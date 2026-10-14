# 01 · Requirements — Multilingual (uz/ru/en) + dark/light theme

> Owner: product-analyst (sonnet) · Status: draft

## Problem & goal

The client asked for two changes: (1) the site must be available in Uzbek, Russian and English, and (2) it needs a light mode in addition to the current dark look. Today all copy is Uzbek Latin in `app/data/site.ts` (plus hard-coded strings in `SiteHeader.vue`, `nuxt.config.ts` head, and likely other components), the site is a statically prerendered Nuxt 4 app (`nitro.prerender` routes `['/']`, `crawlLinks`), colours are CSS variables in `app/assets/css/main.css` (`--bg`, `--fg`, `--line`, ...) with a dark-only palette, and the WebGL blob is tuned for a dark background (`theme-color #050505`). Goal: ship uz/ru/en as separate prerendered URLs with correct SEO, and a persisted dark/light theme with no flash, including a blob that reads well on a light background.

## Audience

Uzbek-speaking, Russian-speaking and international business and government decision makers evaluating 3dot; plus search engines (per-language indexing).

## Decisions proposed (for approval)

- Locale strategy: **prefix routes, uz default unprefixed**: `/` (uz), `/ru/`, `/en/`, and `/ru/projects/<slug>`, `/en/projects/<slug>`, `/projects/<slug>`. Reason: the site is statically generated, so each language needs its own prerendered HTML for SEO and no-JS/first paint. A client-only switch would ship Uzbek HTML to crawlers and flash on load.
- Theme: `data-theme="dark|light"` on `<html>`, set by a tiny inline head script before first paint (static HTML cannot know the user's preference at build time).
- Project/client names, stack names and brand stay untranslated; descriptive copy is translated.

## User stories

| ID | Story | Acceptance criteria (Given / When / Then) | Priority |
|----|-------|--------------------------------------------|----------|
| US-1 | As a visitor I want the site in uz, ru or en at distinct URLs so that I can read and share it in my language. | Given the generated site, When I open `/`, `/ru/`, `/en/`, Then each returns HTTP 200 prerendered HTML (present in `.output/public`) whose `<html lang>` is `uz`, `ru`, `en` respectively and whose hero lead/nav text is in that language. Given `/ru/projects/ijro-pro` and `/en/projects/ijro-pro`, Then each is prerendered with translated title/summary/description. | Must |
| US-2 | As a visitor I want a language switcher in the header so that I can change language on any page. | Given any page on desktop, When I click "RU" in the header switcher, Then the URL becomes the same page under `/ru` (hash/section preserved where applicable: `/projects/x` becomes `/ru/projects/x`) and all visible copy is Russian. Given viewport <=900px, When I open the burger menu, Then the language switcher is visible and usable inside it. Given the switcher, Then the current language has `aria-current="true"`, each option is a real link (`<a href>`) with `hreflang` and `lang` attributes and an accessible name (e.g. "Русский"), operable with Tab/Enter. | Must |
| US-3 | As a returning visitor I want my language choice remembered so that I don't have to re-select it. | Given I chose `en` and reload or return later to `/`, When the page loads on the client, Then I am redirected to `/en/` once (choice stored in `localStorage` or cookie). Given I have made no choice, Then no redirect happens and `/` stays Uzbek (no auto-redirect from `Accept-Language`, so crawlers and shared links are stable). Given I explicitly pick `uz` after `en`, Then I land on `/` and uz is stored. | Must |
| US-4 | As a search engine / sharer I want correct language metadata so that each version is indexed and previewed properly. | Given any prerendered page, Then it contains `<link rel="alternate" hreflang="uz|ru|en">` for all three versions plus `x-default` pointing to `/`, a self-referencing canonical, a translated `<title>`, `meta description`, `og:title`, `og:description`, and `og:locale`. Then a sitemap (or the generated routes list) includes all locale URLs. Verified via Playwright reading `document.head` of each generated HTML. | Must |
| US-5 | As a content owner I want every piece of copy translated in one place so that nothing stays in Uzbek on ru/en pages. | Given `/ru/` and `/en/`, When the page is rendered, Then no Uzbek-only strings from `site.ts` remain: nav, hero lead/tagline, intro, services + subs, stats headline/caption/awards/number labels, projects (summary, tags, awards, description), serviceTabs, process, pricing, faq, budgets, contact modal labels/validation/success text, footer, preloader, error page, `aria-label`s (logo, menu, burger), and meta/head. Verified by a test that all translation keys exist in all three locales (no missing keys) and a Playwright check that a sample of uz-only phrases is absent on `/ru/` and `/en/`. Non-translatable items (brand `3dot`, project names, client names, stack names, email, phone, URLs) are intentionally identical. | Must |
| US-6 | As a visitor I want the layout to survive longer Russian text so that nothing breaks. | Given `/ru/` at 1440px and 390px widths, When the page loads, Then there is no horizontal overflow (`scrollWidth <= innerWidth`), and header nav and CTA do not wrap or overlap; CLS stays <= 0.1. | Must |
| US-7 | As a visitor I want light and dark themes so that I can read comfortably in my environment. | Given I have no stored choice, When I load the site with OS `prefers-color-scheme: light` (Playwright `colorScheme`), Then `<html data-theme="light">`; with `dark`, Then `data-theme="dark"`. Given the light theme, Then body background is light and text/background contrast meets WCAG AA (>=4.5:1 body text, >=3:1 large text and UI borders), measured on the main sections, header, modal, footer, FAQ, project pages. | Must |
| US-8 | As a visitor I want a theme toggle in the header so that I can override the system setting. | Given desktop header, When I click the theme toggle, Then `data-theme` flips, colours change, and the choice is stored in `localStorage`. Given viewport <=900px, When I open the burger menu, Then the toggle is present there (or in the header bar next to the burger) and works. Given the toggle, Then it is a `<button>` with `aria-pressed` (or a label that states the action, e.g. "Switch to light theme", translated per locale), visible focus ring, operable via Enter/Space. | Must |
| US-9 | As a visitor I want my theme choice to persist and not flash so that every page load looks right immediately. | Given a stored choice `light` while OS is dark, When I load or reload any prerendered page (any locale), Then `data-theme="light"` is already set before first paint (inline script in `<head>`, verified by reading the attribute at `domcontentloaded` / via `addInitScript`-free navigation and by screenshot of the first frame showing no dark flash), and no hydration mismatch warnings appear in the console. Given a stored choice, Then OS preference changes are ignored; given no stored choice, Then OS changes at runtime update the theme live. | Must |
| US-10 | As a visitor in light mode I want the liquid-chrome blob to look intentional so that the hero still feels premium. | Given light theme, When the hero renders, Then the blob remains visible against the light background (not washed out: measured luminance contrast between blob pixels and canvas background >= 3:1 in a Playwright canvas screenshot sample), the canvas clear/background and any fog/vignette match `--bg`, and switching theme updates the blob without page reload, without recreating the WebGL context, and without leaking resources (dispose still runs on unmount). Given the `prefers-reduced-motion` setting, Then the blob behaves exactly as today (static/reduced) in both themes. | Must |
| US-11 | As a user of assistive tech or reduced motion I want the switchers to respect my settings. | Given `prefers-reduced-motion: reduce`, When I toggle theme or language, Then no animated transition longer than 0ms (colour cross-fade and any blob colour tween are skipped/instant). Given keyboard-only use, Then both switchers are reachable in logical Tab order in the header, and the mobile menu keeps its existing focus/scroll-lock behaviour. | Must |
| US-12 | As a visitor I want `theme-color` and system UI to match the theme so that the browser chrome looks consistent. | Given light/dark theme, Then `<meta name="theme-color">` equals the current `--bg` value (via media-scoped metas or updated on toggle), and the `color-scheme` CSS property is set so native form controls/scrollbars match. | Should |
| US-13 | As a visitor I want the language to be announced correctly so that screen readers use the right voice. | Given I switch language client-side, Then `document.documentElement.lang` matches the active locale; inside the switcher each option carries its own `lang`. | Must |

## Non-functional requirements

- Performance (from `sdlc/pipeline.json -> budgets`): LCP <= 2500 ms, CLS <= 0.1, initial JS <= 180 KB gzip, three chunk <= 200 KB gzip, desktop FPS >= 55. Translations for the non-active locales must not inflate the initial JS beyond budget: load only the active locale's messages (or keep them in prerendered HTML/lazy chunks). The inline theme script must be < 1 KB and non-blocking beyond a few microseconds. Web font request must keep supporting Cyrillic (Unbounded, Manrope, JetBrains Mono: confirm Cyrillic subset in the Google Fonts URL; currently only default subsets are requested via `css2`, which include cyrillic through unicode-range, but verify rendering on `/ru/`).
- Accessibility: WCAG 2.2 AA; both themes pass contrast; focus indicators visible in both themes; switchers keyboard-operable; `lang` correct; `prefers-reduced-motion` respected for theme/language transitions and for the blob.
- SEO: separate crawlable URLs per locale, `hreflang` + `x-default`, canonical, translated meta/OG, all locale URLs prerendered via `npm run generate` (explicit routes or `crawlLinks` reaching every locale link, including every `/<locale>/projects/<slug>`), sitemap with alternates (or at minimum a complete list of URLs).
- i18n: default locale `uz` (Uzbek Latin); `ru` Russian; `en` English. Dates/numbers formatted per locale where displayed. No machine-translated copy shipped without human review (see open questions).
- Quality gates: `npm run typecheck`, `npm run generate`, `npm run test:e2e` (desktop, mobile, reduced-motion projects) pass; new e2e specs cover each story above.

## Out of scope

- Auto-detecting language from `Accept-Language` / geo-IP and auto-redirecting.
- More languages than uz/ru/en; RTL support; Uzbek Cyrillic.
- Translating fictional demo data beyond what is in `site.ts` (client names such as "Northwind" and project brand names stay as is); replacing PLACEHOLDER numbers/cases with real ones.
- CMS or runtime translation editing UI; translation-management tooling.
- More than two themes (no high-contrast or custom accent picker); redesigning the visual identity or adding new sections.
- Server-side rendering/hosting changes (site stays static); cookie banner.
- Per-locale content differences (e.g. different projects per language) and localized URL slugs (slugs stay identical across locales).

## Open questions

1. Translation source: who provides and approves the ru and en copy? Draft machine/AI translation by the team, reviewed by a native speaker, is the proposed default. Confirm.
2. Library vs. hand-rolled: use `@nuxtjs/i18n` (adds a dependency, gives routing, hreflang, SEO helpers) or a minimal in-house solution? Proposed: `@nuxtjs/i18n` with `prefix_except_default`, lazy-loaded locale files. Needs architect sign-off on bundle impact.
3. Default URL for Uzbek: unprefixed `/` (proposed) or `/uz/`? Changing later breaks existing links.
4. Theme control: simple 2-state toggle (proposed; first click overrides system) or 3-state (system / light / dark)?
5. Default theme with no preference signal and no stored choice: dark (site's current identity; proposed fallback) or light?
6. Should the accent colour `#c8ff5a` (lime) stay in light mode? It has poor contrast on a light background; a darker variant for text/links is likely needed. Design to decide.
7. Per-project `palette` cover art: keep same colours in light mode or adapt?
8. Should the language switcher show codes (UZ / RU / EN) or full names? Proposed: codes visible, full names in `aria-label`/`lang`.
9. Is a sitemap/`robots.txt` expected as part of this feature (need site URL, `https://3dot.uz`?) ?

## Risks

- Hard-coded Uzbek strings in components (header aria-labels, modal, footer, preloader, error page, `nuxt.config.ts` head) will be missed; mitigated by the key-parity test and a phrase-absence e2e check.
- Hard-coded dark colours (rgba(5,5,5,...) in `SiteHeader` scoped styles, other components, shader colours, `theme-color`) will break light mode; needs an audit and conversion to CSS variables.
- Flash of wrong theme / hydration mismatch if the theme is applied only after mount; requires the pre-paint inline script and `<html>` attribute handled consistently between server and client.
- Static prerender: every locale x every project slug must be generated; missing routes cause 404s on static hosting.
- Longer Russian strings can overflow the display-size typography (`--fs-hero`, header nav) and increase CLS.
- Blob material (chrome environment/reflections) may look muddy or blown out on a light background; needs WebGL tuning and a performance recheck (no extra render targets or allocations in the loop).
- Adding `@nuxtjs/i18n` could push initial JS over 180 KB gzip; must be measured.
- Machine-quality translations can damage credibility on a B2B/government-facing site.
