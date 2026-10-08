import { expect, test } from "@playwright/test";
import { workGallery } from "../src/workGallery.js";

test.beforeEach(async ({ page }) => {
  await page.route("https://**", (route) => route.abort());
  await page.goto("/#completed-work");
  await page.locator("#completed-work").scrollIntoViewIfNeeded();
  await page.mouse.move(0, 0);
});

test("gallery shows only medium images without headings or captions", async ({
  page,
}, testInfo) => {
  const gallery = page.locator("#completed-work");
  const carousel = gallery.getByRole("region", {
    name: "Completed projects",
    exact: true,
  });
  await expect(carousel).toHaveText("");
  await expect(
    gallery.getByRole("link", { name: "See All Gallery", exact: true }),
  ).toHaveAttribute("href", "./gallery.html");
  await expect(gallery.getByRole("heading")).toHaveCount(0);
  await expect(gallery.getByRole("button")).toHaveCount(0);
  await expect(gallery.locator("figcaption")).toHaveCount(0);
  await expect(carousel.getByRole("img")).toHaveCount(workGallery.length);
  await expect(
    carousel.getByRole("img", { name: workGallery[1].alt, exact: true }),
  ).toHaveAttribute("src", "/mike.png");
  const image = gallery.locator(".completed-work-image").first();
  const size = await image.boundingBox();
  expect(size.width).toBeLessThanOrEqual(340);
  expect(size.height).toBeLessThanOrEqual(213);
  await expect
    .poll(() =>
      image
        .locator("img")
        .evaluate((img) => img.complete && img.naturalWidth > 0),
    )
    .toBe(true);
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
    if (testInfo.project.name !== "reduced-motion") {
      await expect
        .poll(
          async () =>
            (
              await gallery
                .locator(".completed-work-group")
                .first()
                .boundingBox()
            ).width,
        )
        .toBeGreaterThanOrEqual(width);
    }
  }
  await gallery.screenshot({
    path: testInfo.outputPath("images-only-gallery.png"),
  });
});

test("image animation loops smoothly and pauses during interaction", async ({
  page,
}, testInfo) => {
  const carousel = page.getByRole("region", {
    name: "Completed projects",
    exact: true,
  });
  const track = carousel.locator(".completed-work-track");
  if (testInfo.project.name === "reduced-motion") {
    await expect(carousel.locator(".completed-work-group")).toHaveCount(1);
    await expect(track).toHaveCSS("animation-name", "none");
    await page.setViewportSize({ width: 390, height: 844 });
    await carousel.focus();
    await page.keyboard.press("ArrowRight");
    await expect
      .poll(() => carousel.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
    return;
  }
  await expect(carousel.locator(".completed-work-group")).toHaveCount(2);
  await expect(track).toHaveCSS("animation-play-state", "running");
  const transform = await track.evaluate(
    (el) => getComputedStyle(el).transform,
  );
  await expect
    .poll(() => track.evaluate((el) => getComputedStyle(el).transform))
    .not.toBe(transform);
  const loopDelta = await track.evaluate(async (el) => {
    const animation = el.getAnimations()[0];
    animation.pause();
    const duration = animation.effect.getTiming().duration;
    const frame = () =>
      new Promise((resolve) => requestAnimationFrame(resolve));
    animation.currentTime = duration * 0.25;
    await frame();
    const first = new DOMMatrix(getComputedStyle(el).transform).m41;
    animation.currentTime = duration * 1.25;
    await frame();
    const next = new DOMMatrix(getComputedStyle(el).transform).m41;
    animation.play();
    return Math.abs(first - next);
  });
  expect(loopDelta).toBeLessThan(1);
  await carousel.hover();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await page.mouse.move(0, 0);
  await expect(track).toHaveCSS("animation-play-state", "running");
  await carousel.focus();
  await expect(track).toHaveCSS("animation-play-state", "paused");
  await page.evaluate(() => {
    document.activeElement.blur();
    window.scrollTo({ top: 0, behavior: "instant" });
  });
  await expect(carousel).not.toBeInViewport();
  await expect(track).toHaveCSS("animation-play-state", "paused");
});

test("broken gallery images display an accessible fallback", async ({
  page,
}) => {
  const photo = workGallery[1];
  await page.route(`**${photo.image || photo.photo}`, (route) => route.abort());
  await page.reload();
  const carousel = page.getByRole("region", {
    name: "Completed projects",
    exact: true,
  });
  await carousel.scrollIntoViewIfNeeded();
  await expect(
    carousel.getByRole("img", { name: photo.alt, exact: true }),
  ).toHaveClass("completed-work-placeholder");
  await expect(carousel.getByRole("img")).toHaveCount(workGallery.length);
});

test("the upper-right gallery link opens the full collection and returns home", async ({
  page,
}, testInfo) => {
  const section = page.locator("#completed-work");
  const link = section.getByRole("link", {
    name: "See All Gallery",
    exact: true,
  });
  const actions = await section
    .locator(".completed-work-actions")
    .boundingBox();
  const linkBox = await link.boundingBox();
  const carouselBox = await section
    .locator(".completed-work-carousel")
    .boundingBox();
  expect(
    Math.abs(linkBox.x + linkBox.width - actions.x - actions.width),
  ).toBeLessThan(1);
  expect(linkBox.y + linkBox.height).toBeLessThan(carouselBox.y);

  // A larger collection must remain fully available on the separate page.
  await page.route("**/src/workGallery.js*", async (route) => {
    const response = await route.fetch();
    await route.fulfill({
      response,
      body: `${await response.text()}\nworkGallery.push(...Array.from({ length: 13 }, (_, index) => ({ id: 'extra-' + index, image: '/work/placeholder.svg', alt: 'Gallery photo ' + (index + 1) })));`,
    });
  });
  await link.click();
  await expect(page).toHaveURL(/\/gallery\.html$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gallery.");
  const images = page.getByRole("list", { name: "Gallery images" });
  await expect(images.getByRole("img")).toHaveCount(workGallery.length + 13);
  await expect(
    images.getByRole("img", { name: "Gallery photo 13", exact: true }),
  ).toHaveCount(1);
  await page.reload();
  await expect(images.getByRole("img")).toHaveCount(workGallery.length + 13);
  await expect(
    images.getByRole("img", { name: workGallery[1].alt, exact: true }),
  ).toHaveAttribute("src", "/mike.png");
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await expect
      .poll(() =>
        page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      )
      .toBe(true);
  }
  await page.screenshot({ path: testInfo.outputPath("full-gallery.png") });
  await page.getByRole("link", { name: "Back to home", exact: true }).click();
  await expect(page).toHaveURL(/\/index\.html#completed-work$/);
  await expect(section).toBeInViewport();
});
