# Changelog

All notable changes to this project are documented here.
Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Changed
- feat(lead-relay): Telegram messages use HTML. Labels are bold, user input is escaped.
- feat(lead-relay): fixed line order, empty budget/message/page lines omitted, `Til` line per locale.
- feat(lead-relay): phone normalised to `+998…`, `Telegramda yozish` button for `@username` contacts.
- feat(lead-relay): timestamp in Tashkent time (UTC+5).

### Added
- `server/api/lead.post.ts`: same-origin lead endpoint reusing the worker logic; secrets from `.env` (`NUXT_TELEGRAM_BOT_TOKEN`, `NUXT_TELEGRAM_CHAT_ID`), `npm start` runs the built server with `--env-file=.env`.
- docs: worker README checklist (BotFather, group id, `-100` upgrade trap), root `.env.example` note.

## [0.4.0] - 2026-10-14

CRO rework, based on the business-analyst strategy in `docs/sdlc/2026-10-cro-analysis/00-strategy.md`.

### Added
- Lead relay. The contact modal sends each lead to a Cloudflare Worker (`workers/lead-relay/`), which posts it to a Telegram chat. The bot token and chat id live only in Worker secrets. Self-check: `node workers/lead-relay/test.mjs`.
- `app/composables/useLead.ts`. One POST per lead, 10 s timeout, double-submit guard, honeypot, 30 s client throttle. No new dependency.
- Modal states: idle, sending, sent, error, throttled. Focus trap (`inert` on `#__nuxt`), focus moves to the first invalid field, focus returns to the trigger on close.
- `app/components/ui/SectionCta.vue`. One shared "Bepul audit olish" button after Projects, Process and FAQ, and on case pages.
- NDA badge on project cards and case pages (`nda: true` in `app/data/site.ts`).
- Price anchor in the pricing block (`#pricing`): "… dan boshlab" price and "Audit — bepul, 1–2 kun".
- Telegram link next to the hero CTA.
- `business-analyst` agent (opus). It runs first in phase 01 and writes `00-strategy.md`.
- CI: relay self-check, secret leak check on `.output/public`, and a deploy warning when `LEAD_ENDPOINT` is unset.
- `.env.example` with `NUXT_PUBLIC_LEAD_ENDPOINT`.
- `NUXT_PUBLIC_SHOW_PLACEHOLDERS=1` outlines placeholder values in dev.

### Changed
- Hero rewritten around the client outcome: "Excel o‘rniga — yagona tizim." Primary CTA "Bepul audit olish".
- One offer across all CTAs (`ui.cta.label`). Modal title "Bepul auditga yoziling".
- Services: 12 blocks reduced to 4 (CRM, ERP va ombor, Hujjat aylanishi, Integratsiya). Each has an outcome line and bullets. A "shuningdek" line covers the rest.
- Sections: 9 reduced to 7 (Hero, Intro, Services, Projects, Process, FAQ/Pricing, Contact).
- Trust signals: one numbers set (20+ tizim, 5 yil) in Intro. Values are placeholders until the owner confirms them.
- Navigation: Xizmatlar, Loyihalar, Narxlar, Aloqa (`#services`, `#projects`, `#pricing`, `#contact`).
- Modal form: budget is not preselected and can be cleared. Budget and message are optional. Inputs have max lengths. Consent checkbox stays required and starts unchecked.
- Russian and English copy written by the `linguist` agent. SEO titles and descriptions updated for CRM/ERP and the free audit (`seo.uz.ts`, `seo.ru.ts`, `seo.en.ts`).

### Removed
- `StatsSection.vue`, `ExpertiseSection.vue` and their scene presets (`stats`, `expertise`).
- Clients marquee and client data. Intro marquee. Hero awards.
- Service tabs, tech stack list and the `ui.hero`, `ui.stats`, `ui.expertise` copy groups.
- The "50+" card in Projects (replaced by the CTA card).

### Fixed
- The lead form no longer fakes success. A failed send or an unset endpoint shows an error, keeps the form filled and shows a Telegram link.
- Invalid submit moves focus to the first invalid field. Success moves focus to the heading.
- Timeout works in browsers without `AbortSignal.timeout` (AbortController fallback).
- Placeholder labels no longer appear as tooltips in production.
- Projects header no longer overflows at 390 px.

### Notes
- Placeholders in `app/data/site.ts`: phone, e-mail, `priceFrom` (`$1 500`), numbers 20+ and 5 yil, and the NDA flags. Confirm before go-live.
- The relay is not deployed yet. Until `LEAD_ENDPOINT` is set, every lead shows the error state. This is a go-live blocker.
- Conversion events (analytics) are out of scope for this release.


### Added
- SEO per locale. `app/data/seo.uz.ts`, `seo.ru.ts` and `seo.en.ts` hold titles, descriptions and keywords. Each file satisfies the shared `SeoCopy` type.
- `app/composables/useSeo.ts` builds every head tag from one place: title, description, keywords, canonical, hreflang (with `x-default`), Open Graph, Twitter card and JSON-LD (`Organization`, `WebSite`, `Service` offers, `CreativeWork` and `BreadcrumbList` on project pages).
- `public/robots.txt` with a `Sitemap:` line.
- `sitemap.xml` is written by a `postgenerate` script (`scripts/sitemap.mjs`) after `npm run generate`. It lists 21 URLs with hreflang alternates.
- Google and Yandex verification placeholders in `SITE_VERIFICATION` (`app/composables/useSeo.ts`). Tags render only when a value is filled.
- Self-hosted fonts in `public/fonts/` (woff2, latin and cyrillic subsets, OFL licences next to them). Wired in `app/assets/css/fonts.css`.
- Metric-matched fallback faces for each font family. They reduce layout shift while the web fonts load.
- Modulepreload of the ru and en copy chunk on `/ru*` and `/en*` pages. The Cyrillic display font is preloaded on `/ru*` only.
- SDLC agents: `linguist` (uz/ru/en copy review), `seo-specialist` and `performance-engineer`. All three pin `opus` in `sdlc/pipeline.json`.

### Changed
- Google Fonts stylesheet and preconnects removed. First load makes no third-party requests.
- Desktop first contentful paint went from about 400–800 ms to about 140–350 ms.
- English CLS on load went from 0.021 to about 0.0003.
- Uzbek copy proofread in `app/data/site.uz.ts`. Calques and grammar fixed. Matching ru and en keys aligned. Details in `docs/sdlc/2026-10-i18n-theme/10-localization.md`.
- Head tags moved from `useLocaleHead()` and page `useSeoMeta` calls into `useSeo()`.
- Preloader counter uses tabular numbers, so digits do not shift the layout on each tick.

### Fixed
- Theme plugin re-syncs with the OS colour scheme after mount. A change made before the listener was attached is no longer lost.
- `clip()` in `useSeo` no longer keeps almost the whole string when the text has no space.

### Notes
- Projects, contact email and phone are still placeholders. Replace them before you submit the sitemap to search engines.
- `og:image` is not set yet. Add a 1200×630 `public/og.png` to enable it.

## [0.2.0] - 2026-10-14

### Added
- Three locales: Uzbek (`uz`, default, unprefixed `/`), Russian (`/ru`) and English (`/en`). Each page and project page is prerendered per locale (21 HTML routes).
- `hreflang` alternates (`uz`, `ru`, `en`, `x-default`), self-referencing canonical and `og:locale` on every page.
- Language switcher in the header and in the mobile menu. The choice is stored in `localStorage` (`3dot:locale`). A stored `ru` or `en` redirects unprefixed URLs once.
- Light and dark themes with a toggle. The default follows `prefers-color-scheme`, and dark is the fallback. The choice is stored in `localStorage` (`3dot:theme`).
- Inline `<head>` script that sets the theme before first paint.
- Light palette for the liquid-chrome WebGL scene (`SCENE_PALETTES`). Switching theme does not recreate the WebGL context or recompile shaders.
- Reduced motion is respected for theme and language transitions.
- CI workflow (agents check, typecheck, generate, Playwright e2e) and a GitHub Pages deploy workflow that runs only after CI passes.

### Changed
- All copy moved to `app/data/site.uz.ts`, `site.ru.ts` and `site.en.ts`. Each file satisfies the shared `SiteCopy` type, so key parity is checked by typecheck. Shared data (brand, contacts, clients, projects) stays in `app/data/site.ts`.
- Page `lang`, `<title>` and description are set per locale. Static head values were removed from `nuxt.config.ts`.
- Two media-scoped `theme-color` meta tags.
- Colours use CSS tokens for both themes in `app/assets/css/main.css`.
- Typography and header layout adjusted for longer Russian text.

### Fixed
- Typecheck errors in `app/composables/useSceneSections.ts` and `app/plugins/motion.client.ts`.

### Notes
- The `ru` and `en` copy is a draft. It needs native-speaker review before the release is announced.
