import { expect, test } from "@playwright/test";
import { projects } from "../src/data.js";

test.beforeEach(async ({ page }) => {
  for (const project of projects.filter((entry) => entry.url)) {
    await page.route(`${project.url}**`, (route) =>
      route.fulfill({
        contentType: "text/html",
        body: "<html><body>Project website preview</body></html>",
      }),
    );
  }
});

test("view all projects opens a searchable gallery with details and home navigation", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page.locator("#project .project-card")).toHaveCount(
    Math.min(
      4,
      projects.filter((project) => project.featured !== false).length,
    ),
  );
  await page.getByRole("link", { name: "View All Projects" }).click();
  await expect(page).toHaveURL(/\/projects\.html$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "All Projects.",
  );
  await expect(page.locator(".project-card")).toHaveCount(
    Math.min(12, projects.length),
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "All Projects.",
  );

  const category = projects[0].category;
  await page.getByRole("button", { name: category, exact: true }).click();
  await expect(page.locator(".project-card")).toHaveCount(
    projects.filter((project) => project.category === category).length,
  );
  await page
    .getByRole("searchbox", { name: "Search projects" })
    .fill("no-matching-project-123");
  await expect(
    page.getByRole("heading", { name: "No matching projects." }),
  ).toBeVisible();
  await expect(page.locator(".project-card")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Show all projects", exact: true })
    .click();
  await expect(page.getByRole("searchbox")).toHaveValue("");
  await expect(page.locator(".project-card")).toHaveCount(
    Math.min(12, projects.length),
  );

  const tag = projects[0].tags[0];
  await page.getByRole("searchbox").fill(tag);
  const matches = projects.filter((project) =>
    [project.title, project.subtitle, project.category, ...project.tags]
      .join(" ")
      .toLowerCase()
      .includes(tag.toLowerCase()),
  );
  await expect(page.locator(".project-card")).toHaveCount(
    Math.min(12, matches.length),
  );
  await page.getByRole("button", { name: "Clear filters" }).click();

  const opener = page.getByRole("button", {
    name: `View ${projects[0].title}`,
    exact: true,
  });
  await opener.click();
  await expect(page.getByRole("dialog")).toContainText(projects[0].description);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(opener).toBeFocused();

  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveURL(/\/index\.html#project$/);
  await expect(page.locator("#project .section-heading")).toBeInViewport();
});

test("a larger collection stays limited on the homepage and paginates in the gallery", async ({
  page,
}) => {
  await page.route("**/src/data.js", async (route) => {
    const response = await route.fetch();
    const body = await response.text();
    await route.fulfill({
      response,
      body: `${body}\nprojects.push(...Array.from({ length: 13 }, (_, index) => ({ ...projects[0], id: 'archive-' + index, title: 'Archive project ' + (index + 1), category: 'Archive', url: '', image: '', tags: ['Archive'] })));`,
    });
  });
  await page.goto("/");
  await expect(page.locator("#project .project-card")).toHaveCount(4);
  await page.getByRole("link", { name: "View All Projects" }).click();
  await expect(page.locator(".project-card")).toHaveCount(12);
  const pagination = page.getByRole("navigation", { name: "Project pages" });
  await expect(
    pagination.getByRole("button", { name: "Previous" }),
  ).toBeDisabled();
  await pagination.getByRole("button", { name: "Next" }).click();
  await expect(page.locator(".project-card")).toHaveCount(
    projects.length + 13 - 12,
  );
  await expect(pagination).toContainText("Page 2 of 2");
  await expect(pagination.getByRole("button", { name: "Next" })).toBeDisabled();
  await page.getByRole("searchbox").fill("Archive project 13");
  await expect(page.locator(".project-card")).toHaveCount(1);
  await expect(page.locator(".project-card")).toContainText(
    "Archive project 13",
  );
  await expect(pagination).toHaveCount(0);
  await page.getByRole("button", { name: "Clear filters" }).click();
  await expect(page.locator(".project-card")).toHaveCount(12);
  await expect(
    page.getByRole("navigation", { name: "Project pages" }),
  ).toContainText("Page 1 of 2");
});
