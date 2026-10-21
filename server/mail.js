import nodemailer from "nodemailer";
import { isEmail } from "../shared/contact.js";

export function createMailService(env = process.env, transport) {
  const user = env.GMAIL_USER?.trim();
  const password = env.GMAIL_APP_PASSWORD?.replace(/\s/g, "");
  const recipient = env.CONTACT_TO_EMAIL?.trim() || user;
  if (!user || !password) return null;
  if (!isEmail(user) || !isEmail(recipient)) {
    throw new Error(
      "GMAIL_USER and CONTACT_TO_EMAIL must be single email addresses.",
    );
  }
  const mailer =
    transport ||
    nodemailer.createTransport({
      service: "gmail",
      auth: { user, pass: password },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
      disableFileAccess: true,
      disableUrlAccess: true,
    });

  return {
    verify: () => mailer.verify(),
    async sendInquiry(values) {
      const info = await mailer.sendMail({
        from: { name: "NetCode Website", address: user },
        to: recipient,
        replyTo: { name: values.name, address: values.email },
        subject: `NetCode inquiry: ${values.type}`,
        text: [
          "New project inquiry from the NetCode website",
          "",
          `Name: ${values.name}`,
          `Email: ${values.email}`,
          `Company: ${values.company || "Not provided"}`,
          `Project type: ${values.type}`,
          "",
          values.message,
        ].join("\n"),
      });
      if (
        !info.accepted?.some(
          (address) => address.toLowerCase() === recipient.toLowerCase(),
        )
      ) {
        throw new Error("Mail server did not accept the recipient.");
      }
    },
  };
}
