# NetCode

A responsive React website for NetCode Software Development Services. Built with Vite, Tailwind CSS, Framer Motion, React Three Fiber, Drei, and Lucide. Fonts and gallery placeholders are self-hosted.

## Run locally

Use Node.js 22.12 or newer. No environment file is required to run locally.

```sh
npm install
npm run dev
```

On Windows PowerShell, use `npm.cmd` to avoid the "running scripts is disabled" error:

```powershell
npm.cmd install
npm.cmd start
```

`npm start` and `npm run dev` both start the development server. Open the **Local** URL printed in the terminal (normally http://localhost:5173). Stop the server with Ctrl+C. If it is already running, save your changes and refresh the browser.

To produce and preview a static production build (use `npm.cmd` in PowerShell):

```sh
npm run build
npm run preview
```

On this workspace, a checksum-verified portable runtime is also available in `.tools/node-v22.23.3-win-x64`. In PowerShell:

```powershell
$env:PATH = (Join-Path (Get-Location) '.tools\node-v22.23.3-win-x64') + ';' + $env:PATH
& '.\.tools\node-v22.23.3-win-x64\npm.cmd' run dev
```

## Before publishing

Copy `.env.example` to `.env.local` and provide the company's actual email, GitHub, and Facebook URLs. These are public configuration values. Rebuild after changes.

To enable message delivery, set `VITE_CONTACT_ENDPOINT` to an HTTPS service that accepts JSON POST requests with `name`, `email`, `company`, `type`, and `message`. A 2xx response means the inquiry was accepted. The service must allow your site's origin, validate input, apply spam protection and rate limits, and perform delivery on its server. Never put API secrets in `VITE_*` variables.

The footer includes Services, Company, and Resources navigation, plus social icons below the divider. Set `VITE_CONTACT_EMAIL`, `VITE_CONTACT_PHONE`, and `VITE_CONTACT_LOCATION` in `.env.local` to show contact details. Optional `VITE_TWITTER_URL` and `VITE_LINKEDIN_URL` add those social profiles alongside GitHub and Facebook. Without contact details, the footer links to the inquiry section.

Without an endpoint, submitting a valid form opens an honest local brief preview with working copy/download actions. Nothing is sent or stored remotely. A configured email also enables a prefilled email draft. Errors preserve the visitor's form data.

The completed-work section is an images-only carousel with a continuous sliding animation and no heading, captions, or controls. Medium images repeat seamlessly across the screen. Hovering or focusing the carousel pauses the animation, and it stays idle when offscreen or when the tab is hidden. Reduced motion shows one manually scrollable collection without animation. Put screenshots or photos in `public/work/`, then edit `src/workGallery.js`: set each entry's `image` (for example, `/work/my-project.jpg`) and descriptive `alt` text. Titles serve as alternative text when `alt` is omitted; categories are not displayed. Add or remove entries to change the gallery size. Missing or broken images have an icon fallback. Landscape images around 960 × 600 work best, and images are cropped to fit the cards.

Edit projects in `src/data.js`. The homepage shows the first four projects; add `featured: false` to keep an entry only in the full gallery. **View All Projects** opens `projects.html`, with search across names, subtitles, categories, and technologies, category filters, and 12 projects per page. Both pages share `src/components/Projects.jsx`; the full page is assembled in `src/pages/AllProjects.jsx`.

To display a real website, add `url: "https://your-project.example/"`; no `image` is needed. The card displays a live, scaled website preview, and **Live Demo** opens an interactive embedded website. **Open website** always opens the actual system in a new tab. Categories and the project count are derived from the project data automatically.

Only absolute HTTP/HTTPS URLs are supported; use HTTPS when publishing. The project website must allow iframe embedding: `X-Frame-Options` and CSP `frame-ancestors` on that website can block previews. These restrictions cannot be bypassed by this frontend. Some login providers also require opening the website directly. The new-tab link stays available when embedding is blocked or the site is unavailable.

Projects without a valid `url` keep their optional local `image` and interactive concept demo. Missing or broken images display a project placeholder. Confirm the provided `10+ Projects Completed` statistic before launch. No client logos or testimonials have been fabricated.

The About section includes **Meet Our Team**, with a profile image, name, title, and **View Portfolio** button per member. Edit the five profiles in `src/team.js` to update names, photos, roles, bios, skills, project credits, and optional portfolio/GitHub URLs. Use `isPlaceholder: true` for sample profiles. `projectIds` refer to entries in `src/data.js`.

To link a team member's portfolio website, fill in their `portfolioUrl` in `src/team.js`:

```js
portfolioUrl: "https://yourname.dev",
```

Their **View Portfolio** link opens that website in a new tab. An empty `portfolioUrl: ""` keeps the built-in portfolio preview.

Contact displays an **Inquire Here!** button. Clicking it opens the validated inquiry form in a dialog. Closing and reopening the dialog preserves the visitor's draft for the current page session. Brief preview and delivery confirmation appear in that same dialog, with Escape-to-close and focus restoration to the Inquire button.

The **See All Gallery** link at the upper right of the homepage carousel opens `gallery.html`. This page shows every entry from `src/workGallery.js` once in a responsive image grid. Add more entries to that file to expand the collection; both the carousel and full gallery update automatically. **Back to home** returns to the carousel.

Deploy the complete `dist/` directory to any static host after building, including `index.html`, `projects.html`, `gallery.html`, and their shared assets. All three pages use real HTML entry points and need no route rewrites.

## Interaction and accessibility

- Mobile navigation with Escape-to-close, section tracking, and smooth anchor scrolling.
- Service detail dialogs and animated portfolio filtering.
- Project demos with search, empty states, and reversible saved items.
- An interactive development timeline with arrow, Home, and End key support.
- Client-side form validation, download/copy fallback, timeout handling, and optional delivery.
- Focus-managed dialogs, focus restoration, labeled inputs, visible focus, and a skip link.
- Reduced motion disables 3D rendering, animation, and smooth scrolling.
- Mobile and unsupported WebGL environments use a CSS cube fallback. The lazy-loaded 3D scene pauses offscreen and in hidden tabs, uses capped pixel density, and requires no external 3D assets.

## Browser checks

```sh
npx playwright install chromium
npm test
```

In PowerShell, use `npx.cmd playwright install chromium` and `npm.cmd test`. This workspace also has browsers in `.tools/browsers`; to reuse them, set `$env:PLAYWRIGHT_BROWSERS_PATH = (Join-Path (Get-Location) '.tools\browsers')` before testing.

Playwright starts a local server automatically and covers desktop, mobile, and reduced-motion layouts; menu and keyboard interactions; filters and demos; modal focus; validation and brief downloads; gallery animation and image fallbacks; and overflow. Screenshots are written into Playwright test artifacts. Run `npm run format:check` to check formatting.
