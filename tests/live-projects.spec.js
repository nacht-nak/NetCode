import { expect, test } from "@playwright/test";

const url = "https://ptsmpc.vercel.app/";
const website = `<!doctype html><html><body>
  <h1>Pageant Tabulation System</h1>
  <label>Contestant name <input aria-label="Contestant name"></label>
  <button onclick="document.querySelector('output').textContent = document.querySelector('input').value">Add contestant</button>
  <output></output>
</body></html>`;

test("URL-only projects show live cards, filters, and interactive websites", async ({
  page,
}, testInfo) => {
  await page.route(`${url}**`, (route) =>
    route.fulfill({ contentType: "text/html", body: website }),
  );
  await page.goto("/");
  const section = page.locator("#project");
  await section.scrollIntoViewIfNeeded();
  await section
    .getByRole("button", { name: "Tabulation", exact: true })
    .click();
  const card = section.locator(".project-card");
  await expect(card).toHaveCount(1);
  await expect(card.locator(".concept-label")).toHaveText("LIVE WEBSITE");
  await expect(card.locator("img")).toHaveCount(0);
  await expect(card.locator("iframe")).toHaveAttribute("src", url);
  await expect(card.locator("iframe")).toHaveAttribute("tabindex", "-1");
  await expect(
    card.getByRole("link", { name: "Open Pageant Tabulation System website" }),
  ).toHaveAttribute("href", url);
  const opener = card.getByRole("button", {
    name: "View Pageant Tabulation System",
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("Tabulation · Live website");
  await dialog.getByRole("button", { name: "Explore Live Demo" }).click();
  await expect(dialog.locator(".interactive-demo")).toHaveCount(0);
  const frame = dialog.frameLocator("iframe");
  await frame
    .getByRole("textbox", { name: "Contestant name" })
    .fill("Contestant 01");
  await frame.getByRole("button", { name: "Add contestant" }).click();
  await expect(frame.locator("output")).toHaveText("Contestant 01");
  await expect(
    dialog.getByRole("link", { name: "Open website", exact: true }),
  ).toHaveAttribute("target", "_blank");
  await dialog.screenshot({ path: testInfo.outputPath("live-project.png") });
  for (const width of [320, 375, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        dialog.evaluate(
          (element) => element.scrollWidth <= element.clientWidth,
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("websites that block embedding can still be opened in a new tab", async ({
  page,
  context,
}) => {
  await context.route(`${url}**`, (route) =>
    route.fulfill({
      contentType: "text/html",
      headers: { "Content-Security-Policy": "frame-ancestors 'none'" },
      body: website,
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", {
      name: "View Pageant Tabulation System",
      exact: true,
    })
    .click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Explore Live Demo" }).click();
  await expect(
    dialog.getByText("Preview not loading? Open the website in a new tab."),
  ).toBeVisible();
  const popupPromise = page.waitForEvent("popup");
  await dialog.getByRole("link", { name: "Open website", exact: true }).click();
  const popup = await popupPromise;
  await expect(popup).toHaveURL(url);
  await expect(
    popup.getByRole("heading", { name: "Pageant Tabulation System" }),
  ).toBeVisible();
  await popup.close();
  await dialog.getByRole("button", { name: "Close dialog" }).click();
  await expect(dialog).toHaveCount(0);
});
