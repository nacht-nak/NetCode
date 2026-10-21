import express from "express";
import { rateLimit } from "express-rate-limit";
import { validateContact } from "../shared/contact.js";
import { createMailService } from "./mail.js";

export function createContactApp({
  env = process.env,
  mailService = createMailService(env),
  logger = console,
} = {}) {
  const app = express();
  app.disable("x-powered-by");
  // Configure only the actual proxy addresses/subnets used by your hosting provider.
  if (env.TRUST_PROXY)
    app.set(
      "trust proxy",
      env.TRUST_PROXY.split(",").map((value) => value.trim()),
    );
  const allowedOrigin = env.CONTACT_ALLOWED_ORIGIN?.trim();
  if (allowedOrigin && new URL(allowedOrigin).origin !== allowedOrigin) {
    throw new Error(
      "CONTACT_ALLOWED_ORIGIN must be an origin without a path or trailing slash.",
    );
  }

  app.use("/api/contact", (req, res, next) => {
    res.set("Cache-Control", "no-store");
    res.set("X-Content-Type-Options", "nosniff");
    res.vary("Origin");
    const origin = req.get("Origin");
    const sameOrigin = `${req.protocol}://${req.get("host")}`;
    if (origin && origin !== (allowedOrigin || sameOrigin)) {
      return res
        .status(403)
        .json({ ok: false, error: "This website cannot submit this form." });
    }
    if (origin) res.set("Access-Control-Allow-Origin", origin);
    if (req.method === "OPTIONS") {
      res.set("Access-Control-Allow-Methods", "POST");
      res.set("Access-Control-Allow-Headers", "Content-Type, Accept");
      return res.sendStatus(204);
    }
    if (req.method !== "POST") {
      res.set("Allow", "POST, OPTIONS");
      return res
        .status(405)
        .json({ ok: false, error: "Use POST to submit an inquiry." });
    }
    next();
  });

  const limited = {
    ok: false,
    error: "Too many messages. Please try again later.",
  };
  app.post(
    "/api/contact",
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 5,
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: limited,
    }),
    // A second limit protects the Gmail account across all client IPs.
    rateLimit({
      windowMs: 60 * 60 * 1000,
      limit: 30,
      keyGenerator: () => "contact-mailbox",
      standardHeaders: "draft-8",
      legacyHeaders: false,
      message: limited,
    }),
    (req, res, next) => {
      if (!req.is("application/json")) {
        return res
          .status(415)
          .json({ ok: false, error: "Send the form as JSON." });
      }
      next();
    },
    express.json({ limit: "32kb" }),
    async (req, res) => {
      const body = req.body;
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        return res
          .status(400)
          .json({ ok: false, error: "Invalid form submission." });
      }
      if (body.website !== undefined && body.website !== "") {
        return res
          .status(400)
          .json({ ok: false, error: "Invalid form submission." });
      }
      const errors = validateContact(body);
      if (Object.keys(errors).length) {
        return res
          .status(400)
          .json({ ok: false, error: "Please check the form fields.", errors });
      }
      if (!mailService) {
        return res.status(503).json({
          ok: false,
          error: "Message delivery is temporarily unavailable.",
        });
      }
      // Ignore extra fields, including any client-supplied recipients or headers.
      const values = Object.fromEntries(
        ["name", "email", "company", "type", "message"].map((key) => [
          key,
          (body[key] || "").trim(),
        ]),
      );
      try {
        await mailService.sendInquiry(values);
        return res.json({ ok: true });
      } catch (error) {
        // Do not log submitted personal details, credentials, or SMTP responses.
        logger.error("Contact email failed", {
          code: error.code || "SEND_FAILED",
        });
        return res.status(502).json({
          ok: false,
          error: "Your message could not be sent. Please try again later.",
        });
      }
    },
  );

  app.use("/api", (_req, res) =>
    res.status(404).json({ ok: false, error: "Endpoint not found." }),
  );
  app.use((error, _req, res, next) => {
    if (res.headersSent) return next(error);
    const status =
      error.type === "entity.too.large"
        ? 413
        : error.status === 400
          ? 400
          : 500;
    return res.status(status).json({
      ok: false,
      error:
        status === 413
          ? "The form submission is too large."
          : "Unable to process the form submission.",
    });
  });
  return app;
}
