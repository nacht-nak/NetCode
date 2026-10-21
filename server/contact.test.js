import assert from "node:assert/strict";
import { once } from "node:events";
import { test } from "node:test";
import { createContactApp } from "./app.js";
import { createMailService } from "./mail.js";

const inquiry = {
  name: "Jamie Example",
  email: "jamie@example.com",
  company: "Example Studio",
  type: "Internet PisoWifi",
  message: "We need help setting up a network for our small business.",
  website: "",
};
const mailEnv = {
  GMAIL_USER: "sender@gmail.com",
  GMAIL_APP_PASSWORD: "test-only-password",
  CONTACT_TO_EMAIL: "owner@gmail.com",
};

async function startApp(t, options = {}) {
  const sent = [];
  const logs = [];
  const app = createContactApp({
    env: {},
    mailService: { sendInquiry: async (values) => sent.push(values) },
    logger: { error: (...args) => logs.push(args) },
    ...options,
  });
  const server = app.listen(0, "127.0.0.1");
  await once(server, "listening");
  t.after(
    () =>
      new Promise((resolve) => {
        server.close(resolve);
        server.closeAllConnections();
      }),
  );
  const base = `http://127.0.0.1:${server.address().port}`;
  return {
    sent,
    logs,
    base,
    post: (body = inquiry, headers = {}) =>
      fetch(`${base}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...headers },
        body: JSON.stringify(body),
      }),
  };
}

test("a valid HTTP inquiry sends only to the configured inbox with client Reply-To", async (t) => {
  const messages = [];
  const mailService = createMailService(mailEnv, {
    async sendMail(message) {
      messages.push(message);
      return { accepted: [mailEnv.CONTACT_TO_EMAIL] };
    },
  });
  const { post } = await startApp(t, { mailService });
  const response = await post({
    ...inquiry,
    name: "  Jamie Example  ",
    to: "attacker@example.com",
    bcc: "attacker@example.com",
  });
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { ok: true });
  assert.equal(messages.length, 1);
  assert.equal(messages[0].to, "owner@gmail.com");
  assert.equal(messages[0].from.address, "sender@gmail.com");
  assert.deepEqual(messages[0].replyTo, {
    name: "Jamie Example",
    address: "jamie@example.com",
  });
  assert.equal(messages[0].bcc, undefined);
  for (const value of [
    inquiry.name,
    inquiry.email,
    inquiry.company,
    inquiry.type,
    inquiry.message,
  ]) {
    assert.ok(messages[0].text.includes(value));
  }
});

for (const [label, body] of [
  ["missing fields", {}],
  ["wrong field types", { ...inquiry, name: {} }],
  ["invalid email", { ...inquiry, email: "not-an-email" }],
  ["recipient list", { ...inquiry, email: "one@example.com,two@example.com" }],
  [
    "email header injection",
    { ...inquiry, email: "one@example.com\r\nBcc: two@example.com" },
  ],
  [
    "name header injection",
    { ...inquiry, name: "Jamie\r\nBcc: two@example.com" },
  ],
  ["long company", { ...inquiry, company: "x".repeat(151) }],
  ["unknown project type", { ...inquiry, type: "other" }],
  ["short message", { ...inquiry, message: "Hello" }],
  ["long message", { ...inquiry, message: "x".repeat(5001) }],
  ["bot trap", { ...inquiry, website: "https://spam.example" }],
  ["array body", [inquiry]],
]) {
  test(`rejects ${label} without sending mail`, async (t) => {
    const { post, sent } = await startApp(t);
    const response = await post(body);
    assert.equal(response.status, 400);
    assert.equal((await response.json()).ok, false);
    assert.equal(sent.length, 0);
  });
}

test("allows an omitted company and an international message", async (t) => {
  const { post, sent } = await startApp(t);
  const response = await post({
    ...inquiry,
    company: undefined,
    message: "こんにちは".repeat(1000),
  });
  assert.equal(response.status, 200);
  assert.equal(sent[0].company, "");
});

test("missing credentials return unavailable, never a false success", async (t) => {
  const { post } = await startApp(t, { mailService: createMailService({}) });
  const response = await post();
  assert.equal(response.status, 503);
  assert.equal((await response.json()).ok, false);
});

test("SMTP failure returns a safe error without exposing details", async (t) => {
  const { post, logs } = await startApp(t, {
    mailService: {
      sendInquiry: async () => {
        throw Object.assign(new Error("private-smtp-details"), {
          code: "EAUTH",
        });
      },
    },
  });
  const response = await post();
  assert.equal(response.status, 502);
  assert.equal((await response.json()).ok, false);
  assert.deepEqual(logs, [["Contact email failed", { code: "EAUTH" }]]);
});

test("does not confirm delivery when the mail server rejects the recipient", async (t) => {
  const mailService = createMailService(mailEnv, {
    sendMail: async () => ({ accepted: [] }),
  });
  const { post } = await startApp(t, { mailService });
  assert.equal((await post()).status, 502);
});

test("defaults delivery to the Gmail sender and delegates authentication verification", async () => {
  let message;
  const service = createMailService(
    { ...mailEnv, CONTACT_TO_EMAIL: "" },
    {
      verify: async () => true,
      sendMail: async (value) => {
        message = value;
        return { accepted: [mailEnv.GMAIL_USER] };
      },
    },
  );
  assert.equal(await service.verify(), true);
  await service.sendInquiry(inquiry);
  assert.equal(message.to, mailEnv.GMAIL_USER);
  assert.throws(() =>
    createMailService({
      ...mailEnv,
      CONTACT_TO_EMAIL: "one@example.com,two@example.com",
    }),
  );
});

test("limits repeated attempts even when X-Forwarded-For is forged", async (t) => {
  const { post, sent } = await startApp(t);
  for (let i = 0; i < 5; i++) assert.equal((await post()).status, 200);
  // Forwarded is ignored unless a trusted proxy has been explicitly configured.
  const response = await post(inquiry, { Forwarded: "for=203.0.113.15" });
  assert.equal(response.status, 429);
  assert.ok(response.headers.get("retry-after"));
  assert.equal(sent.length, 5);
});

test("the mailbox limit applies across client IPs behind a configured proxy", async (t) => {
  const { post, sent } = await startApp(t, {
    env: { TRUST_PROXY: "loopback" },
  });
  for (let i = 1; i <= 30; i++) {
    assert.equal(
      (await post(inquiry, { "X-Forwarded-For": `203.0.113.${i}` })).status,
      200,
    );
  }
  assert.equal(
    (await post(inquiry, { "X-Forwarded-For": "203.0.113.31" })).status,
    429,
  );
  assert.equal(sent.length, 30);
});

test("accepts same-origin requests and rejects unrelated origins", async (t) => {
  const { base, post, sent } = await startApp(t);
  assert.equal((await post(inquiry, { Origin: base })).status, 200);
  const response = await post(inquiry, { Origin: "https://unrelated.example" });
  assert.equal(response.status, 403);
  assert.equal(response.headers.get("access-control-allow-origin"), null);
  assert.equal(sent.length, 1);
});

test("supports the configured frontend origin and JSON preflight", async (t) => {
  const origin = "https://netcode.example";
  const { base, post } = await startApp(t, {
    env: { CONTACT_ALLOWED_ORIGIN: origin },
  });
  const preflight = await fetch(`${base}/api/contact`, {
    method: "OPTIONS",
    headers: { Origin: origin },
  });
  assert.equal(preflight.status, 204);
  assert.equal(preflight.headers.get("access-control-allow-origin"), origin);
  assert.equal((await post(inquiry, { Origin: origin })).status, 200);
});

test("rejects malformed JSON, large bodies, unsupported media, and methods", async (t) => {
  const { base, post, sent } = await startApp(t);
  const malformed = await fetch(`${base}/api/contact`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{",
  });
  assert.equal(malformed.status, 400);
  assert.equal((await malformed.json()).ok, false);
  assert.equal(
    (await post({ ...inquiry, message: "x".repeat(33000) })).status,
    413,
  );
  assert.equal(
    (await post(inquiry, { "Content-Type": "text/plain" })).status,
    415,
  );
  assert.equal((await fetch(`${base}/api/contact`)).status, 405);
  assert.equal((await fetch(`${base}/api/unknown`)).status, 404);
  assert.equal(sent.length, 0);
});
