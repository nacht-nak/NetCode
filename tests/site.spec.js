import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://ptsmpc.vercel.app/**", (route) =>
    route.fulfill({
      contentType: "text/html",
      body: "<html><body><h1>Pageant Tabulation System</h1></body></html>",
    }),
  );
});

test("layout, navigation, and reduced-motion fallback", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "NetCode",
  );
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({
    path: testInfo.outputPath("initial-home.png"),
    fullPage: false,
  });
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(
      page.getByRole("navigation", { name: "Mobile navigation" }),
    ).toBeVisible();
    await page
      .getByRole("navigation", { name: "Mobile navigation" })
      .getByRole("link", { name: "Services", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Open menu" }),
    ).toHaveAttribute("aria-expanded", "false");
  }
  if (testInfo.project.name !== "desktop")
    await expect(page.locator(".hero-visual canvas")).toHaveCount(0);
  const sections = ["home", "services", "project", "about", "contact"];
  for (const id of sections) {
    const target =
      id === "home"
        ? page.locator(`#${id}`)
        : page.locator(`#${id} .section-heading`);
    await target.scrollIntoViewIfNeeded();
    if (id !== "home") {
      await expect(page.locator(`#${id} .section-heading`)).toHaveCSS(
        "opacity",
        "1",
      );
      await page
        .locator(`#${id}`)
        .screenshot({ path: testInfo.outputPath(`${id}.png`) });
    }
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
  }
  await page.setViewportSize(testInfo.project.use.viewport);
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(page.getByRole("heading", { level: 1 })).toBeInViewport();
  await page.screenshot({
    path: testInfo.outputPath("home.png"),
    fullPage: false,
  });
  await expect(page.locator(".navbar")).not.toHaveClass(/navbar-scrolled/);
  expect(errors).toEqual([]);
});

test("project filters, details, live demo, and keyboard modal dismissal", async ({
  page,
}) => {
  await page.goto("/");
  const section = page.locator("#project");
  await section.scrollIntoViewIfNeeded();
  await expect(section.locator(".project-card")).toHaveCount(4);
  for (const category of [
    "Web Development",
    "Tabulation",
    "Business",
    "Other",
  ]) {
    await page.getByRole("button", { name: category, exact: true }).click();
    await expect(section.locator(".project-card")).toHaveCount(1);
    await expect(section.locator(".project-category")).toHaveText(category);
  }
  await section.getByRole("button", { name: /^All/ }).click();
  await expect(section.locator(".project-card")).toHaveCount(4);
  const opener = page.getByRole("button", {
    name: "View Learnly",
    exact: true,
  });
  await opener.click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toBeVisible();
  await page.getByRole("button", { name: "Explore Live Demo" }).click();
  await page
    .getByRole("textbox", { name: "Search demo collection" })
    .fill("React");
  await expect(dialog.locator(".demo-item")).toHaveCount(1);
  await dialog.getByRole("button", { name: "Save", exact: true }).click();
  await expect(
    dialog.getByRole("button", { name: "Saved", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(dialog.getByRole("status")).toHaveText(
    "1 item saved in this preview.",
  );
  await page
    .getByRole("textbox", { name: "Search demo collection" })
    .fill("no-match");
  await expect(
    dialog.getByText("No results. Try a different search."),
  ).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).toHaveCount(0);
  await expect(opener).toBeFocused();
});

test("service details and process keyboard controls", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("button", { name: "Learn more about Networking" })
    .click();
  await expect(page.getByRole("dialog")).toContainText(
    "LAN and Wi-Fi network setup",
  );
  await page.getByRole("button", { name: "Close dialog" }).click();
  const discover = page.getByRole("tab", { name: "01 Discover" });
  await discover.click();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "02 Plan" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Architecture & development roadmap",
  );
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "06 Deploy" })).toBeFocused();
  await expect(page.getByRole("tabpanel")).toContainText(
    "Launch & project handover",
  );
});

test("form validation, local brief download, and focus trapping", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#contact input")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Send Message" })).toHaveCount(
    0,
  );
  const inquire = page.getByRole("button", { name: "Inquire", exact: true });
  await inquire.click();
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(page.getByRole("dialog")).toContainText(
    "Tell us about your idea.",
  );
  await page.getByLabel("Name", { exact: false }).fill("Draft name");
  await page.keyboard.press("Escape");
  await expect(inquire).toBeFocused();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await inquire.click();
  await expect(page.getByLabel("Name", { exact: false })).toHaveValue(
    "Draft name",
  );
  await page.getByLabel("Name", { exact: false }).clear();
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(
    page.getByText("Please enter your name (at least 2 characters)."),
  ).toBeVisible();
  await expect(page.getByLabel("Name", { exact: false })).toBeFocused();
  await page.getByLabel("Name", { exact: false }).fill("Jamie Example");
  await page.getByLabel("Email", { exact: false }).fill("jamie@example.com");
  await page.getByLabel("Project Type").selectOption("Web Development");
  await page
    .getByLabel("Message", { exact: false })
    .fill(
      "We would like a responsive new website for our small design studio.",
    );
  await page.getByRole("button", { name: "Send Message" }).click();
  const dialog = page.getByRole("dialog");
  await expect(dialog).toContainText("your details have not been sent");
  await expect(page.getByRole("dialog")).toHaveCount(1);
  await expect(
    page.getByRole("button", { name: "Close dialog" }),
  ).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Copy brief" })).toBeFocused();
  const downloadPromise = page.waitForEvent("download");
  await page.getByRole("button", { name: "Download brief" }).click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("netcode-project-brief.txt");
  await page.keyboard.press("Escape");
  await expect(inquire).toBeFocused();
});

test("team cards open individual portfolios and return focus when dismissed", async ({
  page,
}, testInfo) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await page
    .locator("#about")
    .getByRole("link", { name: "Meet Our Team" })
    .click();
  const team = page.locator("#team");
  await expect(
    team.getByRole("heading", { name: "Meet Our Team." }),
  ).toBeInViewport();
  const cards = team.locator(".team-card");
  await expect(cards).toHaveCount(3);
  const roles = ["Full Stack Developer", "UI/UX Designer", "Backend Developer"];
  for (let index = 0; index < roles.length; index++) {
    const card = cards.nth(index);
    const name = `Team member ${String(index + 1).padStart(2, "0")}`;
    await expect(card.getByRole("heading", { name })).toBeVisible();
    await expect(card.getByText(roles[index], { exact: true })).toBeVisible();
    const opener = card.getByRole("button", {
      name: `View portfolio of ${name}`,
    });
    await opener.click();
    const dialog = page.getByRole("dialog");
    await expect(
      dialog.getByRole("heading", { name: `${name} — Portfolio` }),
    ).toBeVisible();
    await expect(dialog.getByText(roles[index], { exact: true })).toBeVisible();
    await expect(dialog.locator(".portfolio-work-card")).toHaveCount(2);
    await expect(dialog).toContainText("This is a sample portfolio");
    await expect
      .poll(() =>
        page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      )
      .toBe(true);
    if (index === 0)
      await dialog.screenshot({
        path: testInfo.outputPath("team-portfolio.png"),
      });
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(opener).toBeFocused();
  }
  await team.screenshot({ path: testInfo.outputPath("meet-our-team.png") });
  await cards
    .first()
    .getByRole("button", { name: "View portfolio of Team member 01" })
    .click();
  await page
    .getByRole("dialog")
    .getByRole("link", { name: "Explore Flowdesk in featured projects" })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page).toHaveURL(/#project$/);
  await expect(page.locator("#project .section-heading h2")).toBeInViewport();
  expect(errors).toEqual([]);
});
