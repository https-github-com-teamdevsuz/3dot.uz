# 11 — SEO (seo-specialist)

**Feature id:** 2026-10-seo-perf · **Date:** 2026-10-14

## Files

| File | Change |
|---|---|
| `app/data/seo.uz.ts` | new. The source of the `SeoCopy` type: `ogLocale`, `home.{title,description,keywords}`, `project.keywords`, `breadcrumbHome`, `orgDescription` |
| `app/data/seo.ru.ts`, `seo.en.ts` | new. Both use `satisfies SeoCopy`, so a missing key fails typecheck |
| `app/composables/useSeo.ts` | new. Builds every head tag for the current route. Also holds `SITE_VERIFICATION` |
| `app/composables/useLocale.ts` | `useLocaleHead` removed (replaced by `useSeo`). `stripLocale` and `prefixed` are now exported |
| `app/app.vue` | `useLocaleHead()` → `useSeo()` |
| `app/pages/index.vue`, `app/pages/projects/[slug].vue` | `useSeoMeta` calls removed (head is now centralised) |
| `public/robots.txt` | new |
| `scripts/sitemap.mjs` + `"postgenerate"` in `package.json` | new. Writes `.output/public/sitemap.xml` from the prerendered `*.html` files |

`nuxt.config.ts` and `site.*.ts` are untouched. The global `og:type=website` from `nuxt.config.ts` is overridden to `article` on project pages through unhead dedupe.

## Keyword map

| Locale | Home title (≤60) | Primary terms (title/description) | Secondary (`keywords` meta) |
|---|---|---|---|
| uz | CRM, ERP tizimlari va raqamlashtirish Toshkentda \| 3dot | CRM tizimi Toshkent, ERP joriy etish, biznes jarayonlarini avtomatlashtirish | ERP tizimlari ishlab chiqish, elektron hujjat aylanishi, web-ilova ishlab chiqish, sayt yaratish Toshkent, 1C integratsiya |
| ru | Внедрение CRM и ERP, цифровизация бизнеса в Ташкенте \| 3dot | внедрение CRM Ташкент, ERP система Узбекистан, автоматизация бизнес-процессов | разработка CRM систем, электронный документооборот, разработка веб-приложений, создание сайтов Ташкент, интеграция с 1С |
| en | CRM & ERP development, digitalization in Uzbekistan \| 3dot | CRM development Uzbekistan, ERP implementation Tashkent, business process automation | custom ERP system, document management system, web app development, website development Tashkent |

The terms were sanity-checked against local catalogue rubrics: yellowpages.uz has "Разработка и внедрение CRM систем" and "ERP tizimlari ishlab chiqish, tadbiq etish", and goldenpages.uz has a "CRM-системы — разработка, внедрение" rubric. No statistics were invented. The e2e title words (`raqamlashtirish` / `цифровизация` / `digitalization`) are kept.

## What each page emits (verified in `.output/public`)

**All 21 pages:**
- `<html lang>`, `<title>`, `description`, `keywords`, and `robots: index, follow, max-image-preview:large`.
- `canonical` (slash-less), plus `hreflang` uz/ru/en/x-default (x-default points to uz).
- `og:site_name/title/description/url/locale`, plus 2× `og:locale:alternate`.
- `twitter:card=summary` with title and description.
- One JSON-LD `@graph`.

**Home (`/`, `/ru`, `/en`):**
- Hand-written title and description (55–59 and 152–160 chars).
- JSON-LD: `Organization` (address Toshkent/UZ, `sameAs` socials, `hasOfferCatalog` with 12 `Service` offers from `t.services`) and `WebSite`.

**Project (18 pages):**
- The title is the first variant that fits in 60 chars:
  1. `Title — summary | 3dot`
  2. `Title — summary`
  3. `Title — tags | 3dot`
- The description is `summary. description`, clipped at a word boundary to ≤160 chars (all are 148–159).
- `keywords` = tags, then stack, then generic locale terms. `og:type=article`.
- JSON-LD: `Organization`, `CreativeWork` (dateCreated, inLanguage, creator) and a 2-level `BreadcrumbList`.
- The project copy is derived from `site.*.ts` at render time, so the linguist's edits flow through automatically and the length guards still hold.

**Headings:** each page has exactly one `<h1>`, checked on all 21 pages.

**Sitemap:** `sitemap.xml` is well-formed. It has 21 `<url>` entries, each with 4 `xhtml:link` alternates and `lastmod` (the generate date). `robots.txt` contains `Allow: /` and the `Sitemap:` line.

**Checks:**
- `npm run typecheck`: exit 0.
- `npm run generate`: exit 0 (postgenerate prints `sitemap.xml: 21 urls`).
- `npm run test:e2e`: 91 passed, 5 skipped. No test changes were needed.

## Search Console / Webmaster checklist

1. **Google Search Console:**
   - Add a URL-prefix property for `https://3dot.uz`, or verify the Domain property via DNS TXT.
   - Copy the HTML-tag `content` into `SITE_VERIFICATION.google` in `app/composables/useSeo.ts`, then regenerate and deploy.
   - Sitemaps → submit `https://3dot.uz/sitemap.xml`.
   - URL inspection → request indexing for `/`, `/ru` and `/en`.
2. **Yandex Webmaster:**
   - Add the site and choose the meta-tag method.
   - Copy the tag into `SITE_VERIFICATION.yandex`, then redeploy.
   - Indexing → Sitemap files → add `https://3dot.uz/sitemap.xml`.
   - Region: set it to Tashkent in site information.
   - Check robots.txt in its analyser.
3. Both verification tags render only when non-empty, so no empty meta ships.

## Open items

- **H1 on home** is the visual tagline "digital. systems. growth". It has no keywords and is the same in all locales. Recommendation for frontend-developer: add a locale keyword phrase inside the H1 as a visually-hidden `<span>`, or move the tagline to a `<p>` and make the H1 the localized `meta`-like phrase. The `home.spec` test expects the H1 to contain "digital.", so the qa-engineer would need to update it.
- **No OG image.** Only `favicon.svg` exists. Add a 1200×630 `public/og.png` and I will wire `og:image` and `twitter:card=summary_large_image`. The `Organization.logo` is the SVG favicon; Google prefers a raster logo of at least 112 px.
- **Placeholder data.** The projects are fictional and `email` and `phone` are placeholders. Do not submit to search engines until they are replaced, or add `noindex` to the project pages.
- **Error pages.** `404.html` and `200.html` keep only the global head (no `noindex`, no lang). Low impact, because they are not linked and not in the sitemap.
- **FAQ JSON-LD.** `FAQPage` was skipped. Google limits FAQ rich results to authoritative gov/health sites; Yandex still reads it. Add it if Yandex snippets matter.
- **Bundle size.** All three `seo.*.ts` files are bundled (about 1 KB gz). Lazy-load them like `site.*.ts` if they grow.
