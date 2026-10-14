# 01 · Requirements — CRO: from showcase to lead machine

> Owner: product-analyst (sonnet) · Status: draft · Source: `00-strategy.md` (P1 + P2 approved; Telegram bot = lead channel)

## Problem & goal
The contact form (`ContactModal.vue`) fakes submission (`setTimeout`, `TODO(backend)`), so every lead is lost. The hero has an English, benefit-less H1, the strongest offer (free process audit) is buried in the FAQ, CTAs exist only in header/hero/contact, and trust signals (client marquee, 120+/50+ numbers, demo cases) are placeholders. Goal: one conversion, "Bepul audit" (free audit), reachable from every decision point, delivered to the owner's Telegram, with honest trust signals and 7 instead of 9 sections. KPI: submitted forms + Telegram link clicks.

Already exists (do not rebuild): modal + `useContactModal`, `telegram` URL, `FaqSection` pricing block, `data-scene` blob system, uz/ru/en copy via `useSite()`, theme toggle, `useSeo` + `seo.{uz,ru,en}.ts`.

## Audience
Uzbek SMB/government decision makers (owners, directors, ops heads) with Excel/paper processes; secondary ru/en visitors. Mostly mobile, Telegram-first.

## Decisions fixed for this feature
- Relay: static site cannot hold the bot token. A tiny serverless relay (Cloudflare Worker or equivalent) holds `BOT_TOKEN` + `CHAT_ID` in its env, accepts `POST` JSON, validates, calls Telegram `sendMessage`. The site reads `runtimeConfig.public.leadEndpoint` (env `NUXT_PUBLIC_LEAD_ENDPOINT`). No token, chat id or bot name in the client bundle or repo.
- Single offer wording: "Bepul audit" everywhere (ru/en equivalents by linguist).
- Relay code lives outside `app/` (e.g. `worker/`), is not part of the Nuxt build.

## User stories

| ID | Story | Acceptance criteria (Given / When / Then) | Priority |
|----|-------|--------------------------------------------|----------|
| US-1 | As a visitor I want my audit request to really reach the studio so that I get a reply. | Given the modal with valid name + contact, When I submit, Then the browser sends exactly one `POST` to `runtimeConfig.public.leadEndpoint` (Playwright `route` mock) with JSON `{name, contact, budget?, message?, locale, page, hp}`; the button is disabled and shows `ui.modal.sending` while pending; on a 2xx response the success view (`doneTitle`/`doneText` + Telegram link) shows. Given a double click on submit, Then only one request is sent. | Must |
| US-2 | As a visitor I want a clear message and a way out if sending fails so that I do not lose my request. | Given the endpoint returns 5xx / network error / timeout (10 s), When I submit, Then the form stays filled, an error message with `role="alert"` is shown, and a link "Telegramda yozish" to `telegram` (`target=_blank rel=noopener`) is visible; the submit button is re-enabled for retry. Given an unset or demo endpoint (placeholder), Then the same error state shows (never a fake success). | Must |
| US-3 | As the owner I want the bot token kept secret and spam blocked so that the channel is safe. | Given the generated `.output/public`, When grepped for `bot[0-9]+:`, `api.telegram.org` and the chat id, Then there are zero matches. Given the form, Then a visually hidden honeypot field (`hp`, `tabindex=-1`, `autocomplete=off`, `aria-hidden`) exists; When it is non-empty, Then the client skips the network call and shows the success view; the relay (spec'd, tested with a unit/curl script) returns 200 without forwarding. Given the relay, Then it rejects non-POST (405), bodies > 2 KB or missing name/contact (400), and restricts CORS to the site origin. Given the same client re-submitting within 30 s, Then the client blocks it with a visible hint (basic throttle). | Must |
| US-4 | As a visitor I want a short form so that I finish it. | Given the open modal, Then only `name` and `contact` carry `required`; budget chips are optional, **none selected** on open and after reopen (`:checked` count 0) and can be deselected/skipped; message is optional; the consent checkbox is removed and replaced by a text line under the button (`ui.modal.consent`); Given only name+contact filled, When I submit, Then the request succeeds and `budget` is absent/empty in the payload. Given empty name or contact, Then the browser/ARIA validation blocks sending (`aria-invalid` or native `:invalid`) and no request is made. | Must |
| US-5 | As a visitor I want the hero to tell me in 5 seconds what I get so that I know it is for me. | Given `/` (uz), Then H1 `#hero-title` text is outcome-led per strategy ("Excel o'rniga — yagona tizim." or approved variant) with no English words; `heroLead` states audience + free audit; primary CTA text is "Bepul audit olish" and opens the modal; a secondary link "Telegramda yozish" points to `telegram`; Given the hero, Then `ui.hero.index` and `ui.hero.scroll` strings/elements no longer exist (no "(IT-yechimlar", no "pastga" in DOM) and `site.uz.ts` has no such keys. Given 390x844 mobile, Then both CTAs are visible above the fold without scrolling. | Must |
| US-6 | As a visitor I want one consistent offer so that I am never unsure what to do next. | Given any page in any locale, When I list all CTA buttons (header, hero, section CTAs, contact, project page), Then each has the free-audit label (uz "Bepul audit olish" / "Bepul audit"; ru/en equivalents) and each opens the modal whose title is `Bepul auditga yoziling` (or equivalent). Given the old strings "Loyihani muhokama qilish" / "Loyihani muhokama qilamizmi?", Then they appear nowhere in `site.*.ts` or rendered DOM. | Must |
| US-7 | As a visitor deciding at the end of a section I want a next step there so that I need not scroll back up. | Given `/`, Then exactly one CTA button (shared component, same label) is the last interactive element inside `#projects`, the process section, and the FAQ/pricing section; Given `/projects/<slug>` (all 6, all locales), Then a CTA block "Sizga ham shunday tizim kerakmi? -> Bepul audit" sits before the "next project" link; Given a click on any of them, Then the modal opens and focus moves to the first input; Escape closes it and focus returns to the trigger. The `projects__all` card with the repeated 50+ number is replaced by this CTA. | Must |
| US-8 | As a visitor I want only honest trust signals so that I believe the page. | Given `/`, Then the clients marquee (`site.ts clients`, `expertise.clientsAria`) is absent from DOM and data; exactly one numbers set exists on the page (hero/intro, rendered from a single `site.ts` source, e.g. systems count + years) and Stats/Intro/Projects no longer duplicate it; Given placeholder numbers, Then `site.ts` marks them with a `// PLACEHOLDER (owner to confirm)` comment and the rendered values are conservative (see Blocked items). Given a project whose data is not a confirmed real case, Then its card and detail page show an "NDA" / "Mijoz nomi NDA ostida" badge (field `nda: true` in `site.ts`), and no client logo/name is displayed anywhere. | Must |
| US-9 | As a visitor I want a focused service list so that I see the core offer. | Given `/` services section, Then exactly 4 service blocks render: CRM, ERP va ombor, Hujjat aylanishi, Integratsiya/avtomatlashtirish; each has a title and a one-line outcome (e.g. "Excel o'rniga..."); below them one line "shuningdek: veb, mobil, BI" (ru/en equivalent); title is `Qaysi jarayonni tartibga solamiz?`; the 12-item list is gone (`services.length === 4` in all locales). | Must |
| US-10 | As a visitor I want a shorter page so that I reach the CTA faster. | Given `/`, Then the sections in DOM order are exactly: Hero, Intro, Services, Projects, Process, FAQ/Pricing, Contact (7 `section[data-scene]`); `StatsSection.vue` and `ExpertiseSection.vue` are not mounted and their files deleted; `stats`/`expertise` presets are removed from `scenePresets.ts`; no `data-scene` value exists without a preset and no preset without a section (except `detail`); the blob still transitions on scroll with no console errors; the stack list and service tabs are gone; integration names (1C, Payme, Click, Telegram) appear next to FAQ #3. | Must |
| US-11 | As a visitor worried about cost I want a price anchor so that I can self-qualify. | Given the pricing block (uz), Then the project price row reads "<number> dan boshlab" (e.g. `$X dan boshlab`) instead of "individual hisob-kitob", and a line "Audit — bepul, 1–2 kun" is shown; the number comes from one `site.ts` constant marked PLACEHOLDER; ru "от ... " and en "from ..." equivalents exist. | Must |
| US-12 | As a visitor I want the menu to lead to decisions so that I find prices fast. | Given desktop and burger menu, Then nav order is Xizmatlar, Loyihalar, Narxlar, Aloqa with hashes `#services`, `#projects`, `#pricing`, `#contact` (add `id="pricing"` to the FAQ/pricing section); When I click each, Then the page scrolls to the matching section (Lenis `$scrollTo`) and the section is in viewport; the intro "Kompaniya" link is gone. The header CTA reads the free-audit label. | Must |
| US-13 | As a ru/en visitor I want every changed string translated so that no uz text leaks. | Given `/ru/` and `/en/`, Then all new/changed keys (hero H1/lead/CTAs, modal incl. error/hint/consent, section CTA, project CTA, services, NDA badge, price anchor, nav, contact) exist in `site.ru.ts` and `site.en.ts` (key-parity test, TypeScript `SiteCopy` enforces shape); removed keys are removed in all three; a phrase-absence check finds none of: "Bepul audit", "Loyihani muhokama", "Telegramda yozish" on ru/en pages. ru/en text is reviewed by the linguist agent. | Must |
| US-14 | As a searcher I want titles and descriptions that match the new offer so that I click through. | Given `seo.uz.ts`, `seo.ru.ts`, `seo.en.ts` updated by seo-specialist, Then each `<title>` (<= 60 chars) and meta description (<= 160 chars) mention CRM/ERP automation + free audit, differ per locale, and `og:title/description` equal them; hreflang/canonical behaviour from the i18n feature is unchanged. Verified by Playwright reading `document.head` of `/`, `/ru/`, `/en/`. | Must |
| US-15 | As the owner I want to see conversion events so that I can measure the KPI. | Given a CTA click, form submit success, or Telegram link click, Then a `CustomEvent`/`dataLayer`-style push `cta_click{place}`, `lead_submit{ok}`, `telegram_click{place}` is emitted via one tiny helper (no analytics vendor, no new dependency) that is a no-op when no listener/`window.dataLayer` exists. | Should |

## Non-functional requirements
- Performance (`sdlc/pipeline.json -> budgets`): LCP <= 2500 ms, CLS <= 0.1, initial JS <= 180 KB gzip, three chunk <= 200 KB gzip, desktop FPS >= 55. Removing two sections and the marquee must not raise any budget metric; the submit logic uses native `fetch` (no new dependency). Error/success states must not shift layout (CLS).
- Accessibility (WCAG 2.2 AA): modal keeps `role=dialog`, focus trap/initial focus, Escape; error text `role="alert"`, success `aria-live="polite"`; every field has a label; target size >= 24 px; contrast AA in dark and light themes for new CTA blocks, badge and error state; `prefers-reduced-motion` -> no new animation (section CTA appears without tween).
- SEO: single `h1`; hero H1 contains the value statement; no section removal breaks internal hash links; sitemap and prerender routes unchanged.
- i18n: site copy is Uzbek Latin (source of truth `site.uz.ts`), ru/en in parity; locale included in the lead payload so the owner knows the reply language.
- Security/privacy: no secrets in repo or bundle; relay validates and size-limits; consent text under button must be approved by the owner/lawyer before real launch.
- No regression: theme toggle/persist, locale routing, LangSwitch, preloader, custom cursor, reduced-motion project, existing e2e specs (updated for removed sections) all pass; `npm run typecheck`, `npm run generate`, `npm run test:e2e` green.

## Blocked on the owner (and placeholder behaviour so the pipeline can ship)

| Needed from owner | Placeholder behaviour until supplied |
|---|---|
| Bot token + chat id | Relay code and `.env.example` (`BOT_TOKEN`, `CHAT_ID`, `ALLOWED_ORIGIN`) ship; token is never committed. |
| Relay URL | `NUXT_PUBLIC_LEAD_ENDPOINT` defaults to demo `https://lead-relay.example.workers.dev/lead` (non-resolving). Form therefore shows the **error state with Telegram fallback**, never fake success. E2E mocks the route. A `/ready-check` note in release docs lists "endpoint still demo" as a go-live blocker. |
| Real phone / e-mail / Telegram handle | Keep `phone`, `email`, `telegram` in `site.ts` with `TODO` comment; the Telegram fallback and hero secondary link use the existing `https://t.me/threedot_uz`. |
| Confirmed numbers (systems count, years) | One set in `site.ts`, marked `PLACEHOLDER`, conservative values; no "120+" style duplicates. |
| Real/permitted cases | All 6 demo projects get `nda: true` badge; client names never shown. |
| Price "from" amount and audit duration | Constant `priceFrom` in `site.ts` (PLACEHOLDER, e.g. `$1 500`) with `// TODO(owner)`; audit duration text "1–2 kun". |
| Legal approval of consent line | Strategy wording used; flagged as pre-launch blocker. |
| Reply-time promise ("1 ish kuni ichida") | Used as drafted; owner confirms. |

## Out of scope
- P3 items: contact-section rewrite beyond CTA wording, project-page "Problem -> Solution -> Result" restructure, preloader changes.
- E-mail channel, CRM sync, a second lead channel, server-side Nuxt API, database, captcha/Turnstile (honeypot + throttle only).
- Analytics vendor integration, A/B testing, cookie banner.
- New visual identity, new sections, changes to blob shader; only preset removal.
- Real case studies, logos, photography, copywriting beyond the strategy table.
- Deploying the relay (code and README only; deployment by devops/owner).

## Open questions
1. Cloudflare Worker confirmed as the relay host, or does the owner prefer another (Vercel/Netlify function)?
2. Final H1 wording: strategy's "Excel o'rniga — yagona tizim." accepted as is?
3. Which 2 numbers go in the single trust set, and where (hero strip vs. intro)?
4. Keep all 6 demo cases marked NDA, or hide the ones owner cannot back with real work?
5. The "from" price and currency (USD vs. so'm), and is the 1–2 day audit timeline guaranteed?
6. Is the reply promise "1 ish kuni ichida" acceptable?
7. Should leads also include UTM/referrer (not collected by default)?

## Risks
- Go-live with demo endpoint: all leads fail (mitigated by honest error + Telegram fallback and release checklist).
- Telegram bot spam / abuse of the public relay URL: honeypot + origin check + size limit are weak vs. targeted abuse; add rate limiting on the relay later (Turnstile if abused).
- Placeholder numbers/NDA badges look odd if left; trust gain depends on owner data.
- Deleting sections shifts scroll positions and `data-scene` transitions; stale presets or e2e selectors will fail (update tests).
- Section CTAs add GSAP/reveal usage; must be reverted in `gsap.context` and respect reduced motion.
- ru/en strings longer than uz may overflow the new CTA/hero layout (re-check horizontal overflow at 390 px, CLS).
- Removing the consent checkbox is a legal decision; shipping before approval is on the owner.
