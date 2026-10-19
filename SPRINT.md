# ArabTides v1 — Development Sprint

## Project goal

Build a polished, Arabic-first, right-to-left static website called ArabTides for displaying calculated astronomical times, estimated tides, solunar periods, Hijri dates, and prayer times for a launch set of major Arab ports.

The website should feel like a modern marine-information dashboard: elegant, data-rich, visually appealing, responsive, and easy to read on mobile devices.

Use the existing project and uploaded port data. Inspect the current repository before modifying anything. Preserve working functionality and avoid unnecessary rewrites.

## 1. Existing files and server locations

The project directory is:

`/home/hermes/hermes-dashboard/`

Port JSON data directory:

`/home/hermes/hermes-dashboard/data/places/`

Arabic content and terminology guide:

`/home/hermes/hermes-dashboard/data/places/ARABIC_CONTENT.txt`

The Arabic content guide contains the approved Arabic terminology, page headings, interface labels, descriptions, disclaimers, error messages, SEO wording, and editorial rules.

### Required actions

1. Read `ARABIC_CONTENT.txt` before writing any user-facing Arabic content.
2. Treat this file as the primary reference for Arabic terminology, UI wording, and language style.
3. Inspect all available files in `data/places/` and identify the port JSON files separately from the Arabic content guide.
4. Read the README accompanying the port data, if present, and verify the field structure before implementing calculations.
5. Do not overwrite the existing port JSON files or change their schema without a documented technical reason.
6. Use the Arabic guide consistently across the homepage, port pages, dashboard cards, charts, tables, navigation, forms, and static pages.
7. If the guide is missing, report the missing file instead of silently inventing its contents.
8. Centralize reusable Arabic labels in a shared constants file or translation dictionary where practical.

## 2. Language and layout

- Use Modern Standard Arabic (العربية الفصحى المعاصرة).
- Do not use Moroccan Darija or any other regional dialect.
- Set the document language to `ar` and direction to `rtl`.
- Use a suitable Arabic font with appropriate weights and readable typography.
- Use CSS logical properties such as `margin-inline`, `padding-inline`, and `inset-inline` for RTL-compatible styling.
- Ensure correct alignment of numbers, dates, times, chart labels, icons, and tables.
- Keep English technical identifiers and Latin URL slugs where appropriate.
- Use a consistent 24-hour clock and clear measurement units.
- Make the interface accessible, keyboard-friendly, and usable on small screens.

All user-facing text must follow the terminology guide.

## 3. Visual design — essential requirement

Create a professional dashboard with attractive visualizations. Do not build a plain collection of text blocks and unstyled tables.

### Visual direction

Use a contemporary maritime and astronomical visual identity:

- Deep navy and ocean-inspired backgrounds or accents.
- Restrained turquoise or teal highlights.
- Warm, high-contrast text and subtle neutral surfaces.
- Elegant Arabic typography.
- Clear visual hierarchy and generous spacing.
- Subtle borders, rounded cards, and restrained shadows.
- Simple, consistent icons for the sun, moon, tides, prayer times, and calendar.
- A refined light or dark theme, whichever best suits the existing application architecture.

Avoid excessive gradients, excessive animation, clutter, oversized decorative graphics, or visual effects that compromise readability.

### Homepage dashboard

Build a strong first screen containing:

- ArabTides branding and a clear Arabic page title.
- A search field for ports and cities.
- A country-browsing section.
- A featured dashboard for a selected or default port, when suitable port data is available.
- Summary cards for today's tide range, next predicted tide event, sunrise, sunset, moon phase, and Hijri date.
- A compact tide chart showing the predicted water level throughout the day.
- A seven-day overview with daily tide-range comparisons.
- Quick links to port details and methodology information.

Do not fabricate default-port measurements. If no port has been selected, show a useful selection interface or use a real port from the supplied dataset.

### Port dashboard

Every port page should include:

1. Port name and country.
2. Current selected date and local timezone.
3. A prominent tide prediction chart.
4. High-tide and low-tide event cards.
5. Today's sunrise, sunset, moonrise, and moonset.
6. Moon phase and illumination, when available.
7. Solunar major and minor periods.
8. Prayer times and the Hijri date.
9. A seven-day comparison.
10. A monthly tide-event table.
11. Print, WhatsApp share, and report-an-error actions.

### Chart requirements

Create actual charts from calculated data, not decorative mock charts.

- Daily tide curve: line chart with time on the horizontal axis and water level on the vertical axis.
- High and low tide events: visually distinguish local maxima and minima.
- Seven-day comparison: bar or line chart showing daily tidal range.
- Moon illumination: a simple visual indicator or progress-style display.
- Solunar periods: a clear timeline showing the beginning and end of each calculated period.

Charts must include readable Arabic labels, units, useful tooltips where supported, and clear handling of missing data.

Use a lightweight charting library only if necessary and compatible with static hosting. If practical, use a lightweight SVG-based visualization.

Charts must render correctly in RTL layouts without reversing the chronological order of time.

Do not introduce a weather API, interactive map, location tracking, external data service, or runtime API dependency.

## 4. Technology and hosting

Use Astro with static output, TypeScript, and Tailwind CSS if consistent with the existing project.

Configure:

- Correct `site` and `base` values for GitHub Pages.
- GitHub Actions deployment from `main`.
- Custom-domain support through a CNAME file when configured.
- HTTPS enforcement through the hosting platform.
- A restrictive, compatible Content Security Policy using meta tags where feasible.
- Static internal links compatible with the configured deployment base path.

Keep the build lightweight and within current GitHub Pages limits. Verify current platform constraints before making claims about exact limits.

Keep the deployment configuration modular so the project can later move to Cloudflare Pages.

Do not add server-side application code.

## 5. Data model

Read the actual supplied JSON files and validate their structure.

The expected port data includes:

- `id`
- `name_ar`
- `name_en`
- `country`
- `lat`
- `lon`
- IANA timezone
- Grid cell information
- Amplitude and phase values for 17 EOT20 constituents

The exact property names for timezone, grid cell, and constituent data must be taken from the supplied files. Do not assume names that have not been verified.

Validate required fields and numeric ranges. Missing or invalid data must produce a clear fallback state rather than fabricated values.

## 6. Calculation library

Implement calculation functions as a separate, tested TypeScript library.

### Sun and moon

Calculate:

- Sunrise and sunset.
- Moonrise and moonset.
- Solar and lunar transit.
- Moon phase and illumination.

Use a suitable astronomy library after verifying its license and compatibility with the application.

### Solunar periods

- Major periods of approximately two hours around lunar transit and lower transit.
- Minor periods of approximately one hour around moonrise and moonset.
- A daily rating based on a documented, consistent calculation rule.

Clearly label the output as a calculated astronomical indicator, not a guarantee of fishing success.

### Hijri dates

Use the appropriate built-in internationalization functionality, with a configurable per-country adjustment of up to one day.

Explain that calculated Hijri dates may differ from official local dates based on moon sighting or national announcements.

### Prayer times

Implement prayer calculations using a suitable open-source library after checking its license.

Provide the supported calculation-method options and relevant configuration. Do not imply that one method is universally authoritative.

### Tide prediction

Implement the harmonic prediction model:

h(t) = Z0 + Σ f·A·cos(ωt + V + u − g)

Verify the constituent phase convention, units, reference level, and nodal corrections against the actual dataset documentation before coding.

Requirements:

- Use the 17 supplied constituents.
- Apply the appropriate nodal corrections.
- Sample the tide curve at five-minute intervals.
- Identify high and low tides and refine event times through interpolation.
- Calculate daily tidal range.
- Classify relative spring/neap conditions according to a documented numerical rule.
- Determine tidal pattern using the applicable form factor based on K1, O1, M2, and S2, with documented classification thresholds.
- Handle missing constituents and invalid inputs safely.

Do not claim that calculated heights represent absolute sea level unless the reference datum supports that interpretation.

## 7. Arabic content and public-facing methodology

Read `data/places/ARABIC_CONTENT.txt` and use its approved Arabic wording throughout the application.

### Public-facing calculation explanations

Keep explanations short, accessible, and general. Describe the mathematical and astronomical processes without unnecessary academic detail or a long bibliography in the main dashboard.

Suitable topics include:

- How astronomical event times are calculated.
- How lunar phases are determined.
- How prayer times depend on coordinates and calculation settings.
- How harmonic models estimate changes in sea level.
- Why predicted tides may differ from observed conditions.
- Why Hijri dates may differ from local official dates.
- How solunar periods are derived from lunar events.

Do not name external datasets, scientific papers, individual data providers, or dataset-specific identifiers in ordinary dashboard text, tooltips, chart descriptions, or general-purpose user-facing explanations.

Do not make statements that falsely imply that measurements were taken directly, that the model has been independently certified, or that predictions have a specific accuracy without supporting validation.

Keep the public explanation general rather than suggesting an undisclosed source through distinctive identifying details.

**Attribution and licensing:** Do not remove legally required attribution or license notices from the project. Preserve applicable dataset credits and license information in the appropriate data-credits or legal documentation, separate from the dashboard's concise methodological explanations. Do not make false claims about data ownership or provenance.

## 8. Pages and routes

Implement the following pages:

- Homepage and search.
- Country browsing pages.
- Individual port pages.
- Print-friendly port view.
- About.
- Contact.
- Privacy policy.
- Disclaimer.
- How calculations work.
- Data credits or attribution information, where required.

Use Latin slugs for stable routes, such as:

`/ports/<id>`

Ensure internal links work under GitHub Pages base-path configuration.

## 9. Functional requirements

- Search across the supplied port index.
- Browse ports by country.
- Navigate between today, the next seven days, and the monthly view.
- Display correct local dates and times for each port.
- Provide a print-friendly view.
- Generate a WhatsApp sharing link containing the selected port and date.
- Provide a report-an-error action.
- Show the marine safety disclaimer clearly.
- Show appropriate empty, loading, invalid-date, and missing-data states.
- Keep the published site fully functional without runtime external API calls.

Do not implement out-of-scope features such as weather, maps, geolocation, advertisements, mobile applications, or editorial articles.

## 10. SEO and metadata

Implement:

- Unique Arabic page titles and descriptions.
- Canonical URLs.
- Open Graph metadata.
- JSON-LD where appropriate.
- Sitemap generation.
- Robots configuration.
- Correct document language and direction.
- Stable Latin route slugs.

Avoid duplicate metadata across individual port pages.

## 11. Validation and tests

Create automated tests for:

- Sunrise and sunset against known reference values.
- Moon phases against known astronomical reference values.
- Timezone and date-boundary handling.
- Hijri date adjustments.
- Prayer-time configuration.
- Tide prediction with fixed test cases.
- High and low tide event extraction.
- Missing constituent handling.
- Chart data generation.
- Static route generation.
- RTL layout and mobile responsiveness where automated validation is feasible.

If observed tide-gauge CSV files become available, implement a validation script reporting time errors in minutes and height errors in centimetres.

Do not claim that the model has passed real-world validation if no observed reference data has been provided.

## 12. Performance and security

- Keep the site statically generated.
- Minimize JavaScript shipped to the browser.
- Avoid unnecessary dependencies.
- Optimize fonts and assets.
- Avoid external API requests at runtime.
- Ensure charting libraries work offline after the page loads.
- Keep build size and time comfortably within hosting limits.
- Use secure external-link handling.
- Use privacy wording that reflects the actual deployed behavior.

## 13. Delivery and acceptance criteria

The sprint is complete when:

1. The existing port data is correctly read and validated.
2. The Arabic terminology guide is consistently applied.
3. The homepage presents a polished dashboard.
4. Port pages contain working charts generated from calculated data.
5. All calculations are implemented in tested, reusable functions.
6. Seven-day and monthly views work correctly.
7. RTL rendering is correct on mobile and desktop.
8. The print and WhatsApp actions work.
9. Required disclaimers and attribution notices are retained.
10. SEO metadata and static routes are correctly configured.
11. No external API calls are needed at runtime.
12. The static build succeeds and deployment from `main` is configured.
13. No fabricated measurements, unsupported accuracy claims, or misleading data-source statements appear anywhere in the application.

## 14. Execution instructions

Start by inspecting the existing repository, reading the Arabic terminology guide, and checking the supplied JSON files.

Then implement the changes incrementally. Run the build and tests after each major stage.

Do not stop after producing a visual mockup. Deliver a functional application whose dashboard charts reflect actual calculated data.

If a requirement cannot be completed because data or configuration is missing, explain the specific blocker and implement a safe, useful fallback.

At the end, report:

- Files created or modified.
- Calculations implemented.
- Charts and dashboard components completed.
- Tests executed and their results.
- Build and deployment status.
- Any unresolved technical or data issues.

Prioritize correctness, visual quality, maintainability, Arabic readability, and reliable static deployment. Also make English version available if needed. Divide sprints into small steps — one or two changes per commit, user validates, then continue.