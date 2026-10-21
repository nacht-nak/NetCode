import { expect, test } from "@playwright/test";
import { projects } from "../src/data.js";

test.beforeEach(async ({ page }) => {
  for (const project of projects.filter((entry) => entry.url)) {
    await page.route(`${project.url}**`, (route) =>
      route.fulfill({ contentType: "text/html", body: "Project preview" }),
    );
  }
});

async function fillInquiry(page) {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Inquire Here!", exact: true })
    .click();
  await page.getByLabel("Name", { exact: false }).fill("Jamie Example");
  await page.getByLabel("Email", { exact: false }).fill("jamie@example.com");
  await page.getByLabel("Project Type").selectOption("Internet PisoWifi");
  await page
    .getByLabel("Message", { exact: false })
    .fill("We need help setting up a network for our small business.");
}

for (const [label, response, message] of [
  [
    "mail unavailable",
    { status: 503, json: { ok: false } },
    "Your message could not be sent",
  ],
  [
    "SMTP failure",
    { status: 502, json: { ok: false } },
    "Your message could not be sent",
  ],
  [
    "static HTML fallback",
    { status: 200, contentType: "text/html", body: "<html>Website</html>" },
    "Your message could not be sent",
  ],
  [
    "false success payload",
    { status: 200, json: { ok: false } },
    "Your message could not be sent",
  ],
  ["rate limit", { status: 429, json: { ok: false } }, "Too many messages"],
]) {
  test(`contact preserves draft and offers download after ${label}`, async ({
    page,
  }) => {
    await page.route("**/api/contact", (route) => route.fulfill(response));
    await fillInquiry(page);
    await page.getByRole("button", { name: "Send Message" }).click();
    await expect(page.getByRole("alert")).toContainText(message);
    await expect(page.getByLabel("Email", { exact: false })).toHaveValue(
      "jamie@example.com",
    );
    await expect(
      page.getByRole("button", { name: "Send Message" }),
    ).toBeEnabled();
    const downloadPromise = page.waitForEvent("download");
    await page.getByRole("button", { name: "Save your brief" }).click();
    expect((await downloadPromise).suggestedFilename()).toBe(
      "netcode-project-brief.txt",
    );
  });
}

test("contact waits for server acceptance and prevents duplicate clicks", async ({
  page,
}) => {
  let release;
  let requests = 0;
  const pending = new Promise((resolve) => {
    release = resolve;
  });
  await page.route("**/api/contact", async (route) => {
    requests++;
    await pending;
    await route.fulfill({ json: { ok: true } });
  });
  await fillInquiry(page);
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByRole("button", { name: "Sending" })).toBeDisabled();
  await expect(page.getByRole("dialog")).not.toContainText(
    "Your message has been sent.",
  );
  release();
  await expect(page.getByRole("dialog")).toContainText(
    "Your message has been sent.",
  );
  expect(requests).toBe(1);
});
