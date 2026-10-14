# 02 · Architecture — CRO: from showcase to lead machine

> Owner: solution-architect (opus) · Status: draft · Input: `00-strategy.md`, `01-requirements.md` (approved; owner decisions: **consent checkbox stays**, **US-15 analytics OUT of scope**)

## Overview
- **Lead delivery.** A single-file Cloudflare Worker in `workers/lead-relay/` holds `BOT_TOKEN` and `CHAT_ID`. It validates the request, applies a rate limit, checks the origin, and forwards the lead to the Telegram `sendMessage` API. The site gets the relay URL at generate time from `runtimeConfig.public.leadEndpoint` (env `NUXT_PUBLIC_LEAD_ENDPOINT`). A new `useLead()` composable sends the request with native `fetch`. If sending fails, the modal shows an error and the existing `telegram` link (`site.ts`) as the fallback. **No new npm dependency.**
- **Page goes from 9 to 7 sections.** `StatsSection.vue` and `ExpertiseSection.vue` are deleted, together with their copy, their `clients` data and their two scene presets. `useSceneSections` looks presets up by name, not by index, so it needs **no change**.
- **One offer.** Every CTA label comes from one key, `ui.cta.label`. The hero, Projects, Process and FAQ sections and the case page render one shared `SectionCta.vue` component, which calls the existing `useContactModal().show`.
- **WebGL.** The only change is deleting the `stats` and `expertise` entries in `scenePresets.ts`.

## Component tree & files

```
layouts/default.vue  (unchanged)
├─ SiteHeader        nav from copy (new order, #pricing), CTA = ui.cta.label
├─ pages/index.vue   Hero · Intro · ServicesGrid · Projects · Process · Faq · Contact   (7 × section[data-scene])
│   ├─ HeroSection     H1 = site.tagline (2 lines), heroLead, [Bepul audit olish] + <a telegram>
│   ├─ IntroSection    marquee removed; the ONLY numbers set (stats.numbers)
│   ├─ ServicesGrid    4 items + ui.services.also line
│   ├─ ProjectsSection NDA badge per card; .projects__all → <SectionCta/> card
│   ├─ ProcessSection  + <SectionCta/> after the list
│   ├─ FaqSection      id="pricing", 2 explicit price rows, integrations chips under FAQ #3, + <SectionCta/> last
│   └─ ContactSection  copy only
├─ pages/projects/[slug].vue   NDA badge + .case__cta block (ui.project.cta + <SectionCta/>) before .case__next
└─ ContactModal      useLead(), honeypot, error/throttle states, consent checkbox (kept), focus return
```

| File | New/changed | Owner agent | Purpose |
|------|-------------|-------------|---------|
| `workers/lead-relay/worker.js` | new | devops-engineer | Relay (spec below). Plain ES module, no deps |
| `workers/lead-relay/test.mjs` | new | devops-engineer | Self-check: `node workers/lead-relay/test.mjs` (stubs global `fetch`, asserts 405/400/403/413/204/hp/429) |
| `workers/lead-relay/wrangler.toml` | new | devops-engineer | `name="lead-relay"`, `main="worker.js"`, `compatibility_date`, `[vars] ALLOWED_ORIGIN="https://3dot.uz"` |
| `workers/lead-relay/.dev.vars.example` | new | devops-engineer | `BOT_TOKEN=`, `CHAT_ID=`, `ALLOWED_ORIGIN=http://localhost:3000` |
| `workers/lead-relay/README.md` | new | devops-engineer | `wrangler secret put BOT_TOKEN/CHAT_ID`, `npx wrangler deploy`, curl examples, go-live checklist |
| `.env.example` | new | devops-engineer | `NUXT_PUBLIC_LEAD_ENDPOINT=https://lead-relay.example.workers.dev/lead` |
| `.gitignore` | changed | devops-engineer | add `.dev.vars` |
| `.github/workflows/ci.yml` | changed | devops-engineer | add steps `node workers/lead-relay/test.mjs` and a post-generate secret grep (ADR-6) |
| `.github/workflows/deploy.yml` | changed | devops-engineer | generate step: `env: NUXT_PUBLIC_LEAD_ENDPOINT: ${{ vars.LEAD_ENDPOINT }}` |
| `nuxt.config.ts` | changed | frontend-developer (`runtimeConfig` only, same as i18n ADR-7) | `runtimeConfig: { public: { leadEndpoint: 'https://lead-relay.example.workers.dev/lead' } }` |
| `app/composables/useLead.ts` | new | frontend-developer | Submit logic (contract below) |
| `app/components/ui/SectionCta.vue` | new | frontend-developer | `<button class="btn btn--solid section-cta" type="button" @click="show">{{ t.ui.cta.label }} <span aria-hidden="true">→</span></button>`. No props, no GSAP |
| `app/components/ui/ContactModal.vue` | changed | frontend-developer | useLead, honeypot, budget none preselected and deselectable, `maxlength`s, error/throttle UI, focus return |
| `app/components/ui/SiteHeader.vue` | changed | frontend-developer | `t.ui.header.cta` → `t.ui.cta.label` (2 places) |
| `app/components/sections/HeroSection.vue` | changed | frontend-developer | remove `.hero__index`, `.hero__scroll`, `.hero__awards` (+ their CSS); add Telegram link; H1 sizing (risk R1) |
| `app/components/sections/IntroSection.vue` | changed | frontend-developer | delete marquee markup, CSS, `gsap` import and tween; keep `id="intro"` and the numbers |
| `app/components/sections/ServicesGrid.vue` | changed | frontend-developer | render `t.ui.services.also` under the grid; grid shows 4 columns ≥1100 px (already does) |
| `app/components/sections/ProjectsSection.vue` | changed | frontend-developer | `.projects__all` → `<div class="projects__all"><SectionCta/></div>` (keep wrapper class and width so `distance()` is unchanged); NDA badge `<span v-if="p.nda" class="badge mono">{{ t.ui.project.nda }}</span>` |
| `app/components/sections/ProcessSection.vue` | changed | frontend-developer | `<SectionCta/>` as the last child of `.process__list` |
| `app/components/sections/FaqSection.vue` | changed | frontend-developer | `id="pricing"`, price rows from `t.pricing.audit` / `t.pricing.project.from(priceFrom)`, `integrations` chips under item `i === 2`, `<SectionCta/>` as the last child of `.faq__grid`'s container (after the list) |
| `app/components/sections/ContactSection.vue` | changed | frontend-developer | none beyond copy (keys keep their names) |
| `app/components/sections/StatsSection.vue` | **deleted** | frontend-developer | — |
| `app/components/sections/ExpertiseSection.vue` | **deleted** | frontend-developer | — |
| `app/pages/index.vue` | changed | frontend-developer | remove `<StatsSection/>` and `<ExpertiseSection/>` |
| `app/pages/projects/[slug].vue` | changed | frontend-developer | NDA badge in `.case__hero`; `<section class="case__cta container">` with `<p>{{ t.ui.project.cta }}</p><SectionCta/>` before `.case__next` (no `data-scene`) |
| `app/data/site.ts` | changed | frontend-developer | see "Shared data" below |
| `app/composables/useLocale.ts` | changed | frontend-developer | `Site.stats` = numbers only; `build()` simplified |
| `app/data/site.uz.ts`, `site.ru.ts`, `site.en.ts` | changed | linguist | Key contract below. uz values are taken word for word from the strategy table; the linguist writes ru/en |
| `app/data/seo.{uz,ru,en}.ts` | changed | seo-specialist | `home.title` (≤60 chars), `home.description` (≤160 chars), `home.keywords`, new `home.catalogName` |
| `app/composables/useSeo.ts` | changed | seo-specialist | OfferCatalog `name: s.home.catalogName` instead of `t.value.servicesTitle`, which is now a question |
| `app/webgl/scenePresets.ts` | changed | webgl-engineer | delete `stats` and `expertise` |
| `tests/e2e/home.spec.ts`, `tests/e2e/i18n-theme.spec.ts`, new `tests/e2e/cro.spec.ts` | changed/new | qa-engineer | see the QA tasks |

`app/webgl/LiquidScene.ts`, `LiquidCanvas.client.vue`, `useSceneSections.ts`, `useContactModal.ts`, `motion.client.ts` and `useReveal.ts` are **unchanged**.

## State & data flow

### Shared data — `app/data/site.ts` (frontend-developer)
```ts
// delete: clients
export const statsBase = {               // PLACEHOLDER (owner to confirm) — the only numbers on the page
  numbers: [ { value: 20, suffix: '+' }, { value: 5, suffix: '' } ]   // systems delivered, years
}                                         // delete: total, awards
export const priceFrom = '$1 500'         // PLACEHOLDER TODO(owner): "from" price
export const integrations = ['1C', 'Payme', 'Click', 'Telegram']
// projectBase: add `nda: true` to all 6 entries (PLACEHOLDER: demo cases)
export interface Project extends ProjectCopy { …; nda: boolean }
```
`useLocale.ts`: `type Site = Omit<SiteCopy,'projects'|'stats'> & { projects: Project[]; stats: { numbers: { value: number; suffix: string; label: string }[] } }`. `build()` keeps only the `numbers` mapping.

### Copy key contract — `site.uz.ts` (linguist; ru/en have the same shape)
| Key | Action | uz value |
|---|---|---|
| `site.tagline` | change (now 2 items) | `['Excel o‘rniga —', 'yagona tizim.']` |
| `site.heroLead` | change | `Savdo, ombor va hujjatlar uchun CRM va ERP. Jarayonlaringizni bepul tahlil qilib, nimani avtomatlashtirish foyda berishini ko‘rsatamiz.` |
| `site.nav` | change | `Xizmatlar #services`, `Loyihalar #projects`, `Narxlar #pricing`, `Aloqa #contact` |
| `servicesTitle` | change | `Qaysi jarayonni tartibga solamiz?` |
| `services` | change (4 items, same `{title, sub}` shape; `sub` = one-line outcome) | CRM · ERP va ombor · Hujjat aylanishi · Integratsiya va avtomatlashtirish; each `sub` is an "… o‘rniga …" outcome |
| `stats` | change | `{ numbers: ['Joriy etilgan tizimlar', 'Yil bozorda'] }` (delete `headline`, `caption`, `awards`) |
| `serviceTabs`, `stack` | **delete** | — |
| `pricing` | change shape | `{ audit: { label: 'Jarayonlar auditi', value: 'bepul, 1–2 kun' }, project: { label: 'Loyiha narxi', from: (p: string) => \`${p} dan boshlab\` } }` |
| `ui.cta` | **new** | `{ label: 'Bepul audit olish', telegram: 'Telegramda yozish' }` |
| `ui.header.cta`, `ui.hero` (whole group: `scroll`, `index`, `cta`) | **delete** | replaced by `ui.cta` |
| `ui.stats`, `ui.expertise` | **delete** | — |
| `ui.services.also` | **new** | `Shuningdek: veb, mobil ilovalar, BI` |
| `ui.modal.title` | change | `Bepul auditga yoziling` |
| `ui.modal.note` | **new** | `1 ish kuni ichida bog‘lanamiz. Majburiyat yo‘q.` |
| `ui.modal.budget` | change | `Taxminiy byudjet (ixtiyoriy)` |
| `ui.modal.message` | change | `Xabar (ixtiyoriy)` |
| `ui.modal.consent` | keep (checkbox label, ADR-5) | unchanged |
| `ui.modal.send` | change | `Auditga yozilish` |
| `ui.modal.error` | **new** | `Yuborib bo‘lmadi. Telegramda yozing yoki qayta urinib ko‘ring.` |
| `ui.modal.throttled` | **new** | `So‘rov yuborildi. Qayta yuborish uchun 30 soniya kuting.` |
| `ui.modal.telegram` | keep | `Telegramda yozish` |
| `ui.faq.integrations` | **new** | `Integratsiyalar` (aria-label of the chip list) |
| `ui.contact.title` | change | `Jarayonlaringiz qayerda vaqt yo‘qotayotganini bepul ko‘rsatamiz` |
| `ui.contact.button` | change | `Bepul audit` |
| `ui.project.cta` | **new** | `Sizga ham shunday tizim kerakmi?` |
| `ui.project.nda` | **new** | `Mijoz nomi NDA ostida` |

Linguist constraints: ru/en `site.tagline` items ≤ 18 characters, no single word longer than 12 characters (risk R1). The ru/en `ui.cta.label` must fit in the 46 px header button at 1180 px width (≤ 22 characters). No uz phrases ("Bepul audit", "Telegramda yozish", "Loyihani muhokama") may appear in ru/en.

### `useLead()` contract — `app/composables/useLead.ts` (frontend-developer)
```ts
export type LeadStatus = 'idle' | 'sending' | 'sent' | 'error' | 'throttled'
export interface LeadForm { name: string; contact: string; budget: string; message: string; hp: string }
export function useLead(): { status: Ref<LeadStatus>; send(f: LeadForm): Promise<void>; reset(): void }
```
- Call it at the top of `ContactModal` setup. It reads `useRuntimeConfig().public.leadEndpoint`, `useLocale()` and `useRoute()` there.
- `send`:
  1. If `status` is `'sending'`, return. This guards against double clicks.
  2. If `f.hp` is not empty, set `status = 'sent'` and make no request.
  3. If the last success was less than 30 s ago (`let lastOk = 0`, held in a closure), set `'throttled'` and return.
  4. Set `'sending'`, then call `fetch(endpoint, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: JSON.stringify({ name, contact, budget: budget || undefined, message: message || undefined, locale, page: route.path, hp: '' }), signal: AbortSignal.timeout(10_000) })`.
  5. If `res.ok`, set `'sent'` and `lastOk = Date.now()`. Any other response, or a thrown error, sets `'error'`. An empty endpoint also sets `'error'`. It never fakes a success.
- `reset()` sets `status` back to `'idle'`. The modal calls it in the existing `setTimeout` on close. Form values are kept after an error.
- The payload is trimmed on the client. Inputs carry `maxlength`: name 100, contact 100, message 1000.

### ContactModal
- `form = reactive({ name:'', contact:'', budget:'', message:'', hp:'', agree:false })`. Delete the `form.budget = budgets[1]` preselect in both places. If the user clicks the already-selected budget chip, it sets `form.budget = ''`, so the choice can be undone.
- Honeypot: `<input v-model="form.hp" name="website" class="visually-hidden" tabindex="-1" autocomplete="off" aria-hidden="true">`, placed inside a `div aria-hidden="true"`.
- The success view renders when `status === 'sent'`. The submit button is `:disabled="status === 'sending'"`.
- `<p role="alert">` with `ui.modal.error` and `<a :href="telegram" target="_blank" rel="noopener">{{ t.ui.modal.telegram }}</a>` is rendered when `status === 'error'`. The same alert `<p>` shows `ui.modal.throttled` when `status === 'throttled'`. The success container gets `aria-live="polite"`.
- Focus return: in `watch(open)`, when it opens, store `returnTo = document.activeElement as HTMLElement | null`. When it closes, run `nextTick(() => returnTo?.focus())`.

### Relay contract — `workers/lead-relay/worker.js` (devops-engineer)
- `OPTIONS` returns 204 with CORS headers. A method other than `POST` returns 405.
- If an `Origin` header is present and not in `env.ALLOWED_ORIGIN.split(',')`, return 403. Every response sets `Access-Control-Allow-Origin` to the matched origin and `Vary: Origin`.
- A body over 2048 bytes (measured with `await req.text()`) returns 413. Invalid JSON, a missing or blank `name`/`contact`, `name`/`contact` over 100 characters, `message` over 1000 characters, `budget` over 40 characters, a `locale` outside `uz|ru|en`, or `page` over 200 characters returns 400.
- A non-empty `hp` returns 204 and forwards nothing.
- Rate limit: an in-memory `Map<ip, number[]>` keyed by `CF-Connecting-IP` allows 5 requests per 10 minutes. Over the limit returns 429. Mark it with `// ponytail: per-isolate, best effort; switch to the Workers Rate Limiting binding if abused`.
- Forwarding: `POST https://api.telegram.org/bot${env.BOT_TOKEN}/sendMessage` with JSON `{ chat_id: env.CHAT_ID, text, disable_web_page_preview: true }`. `text` is plain text (no `parse_mode`) made of the name, contact, budget, message, locale and page. A non-ok Telegram response returns 502. Success returns 204.
- Accept any request `Content-Type`. The relay parses the body text as JSON.

### Other state
No new `useState` keys. `contact-modal-open` and `active-scene` are unchanged.

## SSR / client boundaries
- Everything new renders on the server except `fetch`, `document.activeElement` and `AbortSignal`. These run only inside the submit handler and the `watch(open)` callback, which run on the client.
- `runtimeConfig.public.leadEndpoint` is fixed into the payload when the site is generated. Changing the relay URL needs a re-generate (in deploy.yml through `vars.LEAD_ENDPOINT`).
- `SectionCta` and the NDA badge are plain markup rendered on the server. They add no GSAP. They may use `data-reveal`, which `useReveal` already skips under reduced motion.

## WebGL plan
- **Geometry / draw calls:** unchanged.
- **Shader changes:** none.
- **Presets:** delete `stats` and `expertise` from `SCENE_PRESETS`. Lookups go by name (`resolvePreset(el.dataset.scene)`), so there are no indexes to shift. After the change the `data-scene` values are: home `hero, intro, services, projects, process, faq, contact`, and the case page `detail, intro, contact`. Every value has a preset, and every preset is used. Optional: retune the `projects` and `process` presets if the jumps services→projects and projects→process look abrupt. Only those two keys may change.
- **Disposal & fallbacks:** unchanged.

## Performance strategy
- Net reduction: two sections, the marquee tween, the CountUp in Stats and the clients marquee are removed. That means fewer DOM nodes and ScrollTriggers, and no change to the `three` chunk.
- New JS is `useLead` plus `SectionCta`, both under 1 KB gzip. No dependency is added, and `fetch` and `AbortSignal.timeout` are native.
- CLS: the error, success and throttle states live inside the fixed modal, so they cause no page shift. Hero CTAs and the Telegram link render on the server. The hero fade only changes `autoAlpha`. The `.projects__all` wrapper keeps its width, so the pinned scroll distance is unchanged.
- LCP: the H1 stays the LCP element and is rendered on the server. Do not add images or fonts.
- Budgets (`pipeline.json`): LCP ≤ 2500 ms, CLS ≤ 0.1, initial JS ≤ 180 KB gzip, three chunk ≤ 200 KB gzip, FPS ≥ 55. All must be equal to or better than the current release.

## ADRs
### ADR-1: Cloudflare Worker relay, plain JS, wrangler not added to package.json
- Context: the site is static (GitHub Pages) and cannot hold the bot token. A Nuxt server API was ruled out.
- Decision: a single `workers/lead-relay/worker.js` with no imports. It is deployed with `npx wrangler deploy` from its own folder. The root `package.json` does not change. The folder sits outside `app/`, so Nuxt never bundles it.
- Consequences: 0 KB bundle impact and no new dependency. Deploying needs a Cloudflare account, which is the owner's task (out of scope). Moving to Vercel or Netlify would mean rewriting only about 60 lines.

### ADR-2: `text/plain` body (CORS simple request)
- Context: `application/json` triggers a preflight `OPTIONS` request, which adds one extra round trip on Uzbek mobile networks.
- Decision: the client sends a JSON string with `content-type: text/plain;charset=UTF-8`. The worker parses the text and still answers `OPTIONS`.
- Consequences: one request per lead. The origin check and the browser's ACAO enforcement still apply.

### ADR-3: Per-isolate in-memory rate limit
- Context: the requirements accept basic anti-spam. KV is optional and costs setup time.
- Decision: a `Map` that allows 5 requests per IP per 10 minutes, plus the honeypot, origin check and size limits.
- Consequences: the limit is weak against distributed abuse. The upgrade path is the Workers Rate Limiting binding or Turnstile, and it is noted in the README.

### ADR-4: One `ui.cta` key group instead of `header.cta` and `hero.cta`
- Context: US-6 requires one identical label everywhere. Duplicated keys drift apart.
- Decision: `ui.cta.label` is used by the header, hero and `SectionCta`. The round contact button keeps its own short `ui.contact.button` ("Bepul audit"), because a 140 px circle cannot fit the long label.
- Consequences: a label change happens in one place per locale.

### ADR-5: Consent checkbox kept (deviation from US-4)
- Context: owner decision recorded on approval of 01.
- Decision: keep `<input type="checkbox" required>` with `ui.modal.consent`. The form then has three required controls: name, contact and consent.
- Consequences: US-4's "only name and contact carry `required`" and "consent replaced by text" checks are dropped. QA asserts that budget and message are optional instead.

### ADR-6: Secret leak check in CI, not a build plugin
- Context: US-3 requires zero token traces in `.output/public`.
- Decision: a CI step after `npm run generate` runs `! grep -rEq 'bot[0-9]{6,}:|api\.telegram\.org' .output/public`. The chat id is not known in CI. It is protected only because it exists solely as a Worker secret and is never referenced in `app/`.
- Consequences: one shell line and no tooling. The `api.telegram.org` string must never appear in `app/**`. The `t.me` link is a different host, so it does not trip the check.

### ADR-7: Stats reduced to one numbers set in Intro; the hero has no numbers
- Context: US-8 requires exactly one numbers set. The hero currently shows `stats.awards`, which is placeholder per-industry counts.
- Decision: delete `awards`, `total`, `headline` and `caption`. `IntroSection` is the only place numbers are rendered. Hero awards and `.projects__all` no longer read `stats`.
- Consequences: `Site.stats` shrinks to `{ numbers }`. Old consumers fail typecheck, which is the intended guard.

### ADR-8: Copy key contract in this doc lets frontend and linguist run in parallel
- Context: `SiteCopy` is inferred from `site.uz.ts`, which the linguist owns. The components (frontend) depend on its keys.
- Decision: the key table above is binding. Both agents work at the same time. Typecheck is expected to fail until both have finished, and the phase-03 gate runs typecheck after both land.
- Consequences: a key renamed outside this table is a review BLOCKER.

## Risks
| # | Risk | Mitigation / owner |
|---|---|---|
| R1 | The new H1 is a phrase, not short words. `--fs-hero` (13.5vw; 11vw under ru) overflows at 360–390 px, ru "единая система." most of all | frontend: `.hero__title { font-size: clamp(2.2rem, 9vw, 11rem) }` unless 03-design-spec sets a size; `.hero__line-inner` may wrap (it is an inline-block inside a block, so it does). Linguist: length limits above. QA: `scrollWidth <= innerWidth` at 360 and 390 px for uz/ru/en, and both CTAs inside 844 px |
| R2 | e2e selectors break: `toContainText('digital.')`, `[data-scene]` count 9, button names "Loyihani muhokama qilish" and "Yozish", `UZ_ONLY` and `TITLE` in i18n-theme.spec | qa (task Q1) |
| R3 | CLS or scroll jumps from removed sections or the projects pin | `.projects__all` width kept; perf auditor compares CLS before and after |
| R4 | A preset is missing for a `data-scene` value, or a preset is left without a section | webgl W1 plus QA check Q2 (DOM values ⊆ preset names) |
| R5 | Go-live with the demo endpoint means every lead fails | an honest error state plus the Telegram fallback; devops README marks this as a go-live blocker |
| R6 | ru/en CTA overflows the 46 px header button between 900 and 1180 px | linguist ≤ 22 characters; QA checks the header at 1000 px |
| R7 | SEO `title` regex in the test is tied to old wording | seo titles must contain `CRM` plus `audit` / `аудит` / `audit`; QA updates `TITLE` to match |

## Task breakdown (per owner, conflict-free)
Within phase 03, every file has exactly one owner. Every task in a column can start right away. The phase gate is typecheck plus generate once all columns are done.

**frontend-developer** (all of `app/**` except `app/webgl/**`, `app/data/site.{uz,ru,en}.ts`, `app/data/seo.*.ts` and `app/composables/useSeo.ts`; also `nuxt.config.ts` `runtimeConfig` only)
- F1 `site.ts` + `useLocale.ts`: shared-data changes and the `Site.stats` type.
- F2 `nuxt.config.ts`: `runtimeConfig.public.leadEndpoint`.
- F3 `useLead.ts`, then `ContactModal.vue`, as specified above.
- F4 `SectionCta.vue`.
- F5 `index.vue`: remove the 2 sections; delete `StatsSection.vue` and `ExpertiseSection.vue`.
- F6 `HeroSection.vue`, `IntroSection.vue`, `ServicesGrid.vue`.
- F7 `ProjectsSection.vue`, `ProcessSection.vue`, `FaqSection.vue`, `pages/projects/[slug].vue` (CTA plus NDA badge). Add the shared `.badge` and `.section-cta` styles in `SectionCta.vue` scoped CSS or `main.css`. Follow `03-design-spec.md` for visuals.
- F8 `SiteHeader.vue`: `ui.cta.label`.

**linguist**
- L1 `site.uz.ts`: apply the key contract exactly (values from the strategy table).
- L2 `site.ru.ts`, `site.en.ts`: same shape, native copy, length limits.

**seo-specialist**
- S1 `seo.{uz,ru,en}.ts`: `home.title/description/keywords` covering CRM/ERP automation plus a free audit, and new `home.catalogName`. Update the e2e comment in `seo.uz.ts`.
- S2 `useSeo.ts`: OfferCatalog name from `s.home.catalogName`.

**webgl-engineer**
- W1 `scenePresets.ts`: delete `stats` and `expertise`. Optionally retune `projects`/`process` (ADR-free, values only).

**devops-engineer**
- D1 `workers/lead-relay/{worker.js,test.mjs,wrangler.toml,.dev.vars.example,README.md}`.
- D2 root `.env.example` and `.gitignore` (`.dev.vars`).
- D3 `ci.yml`: add `node workers/lead-relay/test.mjs` (before typecheck) and the secret grep (after generate). `deploy.yml`: pass `NUXT_PUBLIC_LEAD_ENDPOINT` from `vars.LEAD_ENDPOINT`.
- Note for the orchestrator: add `"workers/**"` and root `.env.example` to `pipeline.json → ownership.devops-engineer`.

**qa-engineer** (`tests/**`; may start on stable contracts in phase 03 but runs in phase 05)
- Q1 `home.spec.ts`: H1 `toContainText('Excel')`; `[data-scene]` count 7; `#intro, #services, #projects, #pricing, #contact` attached; modal trigger `getByRole('button', { name: 'Bepul audit olish' }).first()` (mobile: the hero CTA). `i18n-theme.spec.ts`: `UZ_ONLY = ['Bepul audit', 'Telegramda yozish', 'Ismingiz', 'Sahifa topilmadi', 'raqamlashtiramiz']`, `TITLE` per R7.
- Q2 new `cro.spec.ts`:
  - lead success with `page.route('**/lead')` returning 204: exactly 1 POST on double click, payload keys, `budget` absent.
  - error (route `abort`): `role=alert`, Telegram link, values kept, button re-enabled.
  - honeypot: no request.
  - throttle: a second submit within 30 s shows the hint.
  - budget `:checked` count 0 on open and on reopen.
  - SectionCta is the last button in `#projects`, `.process` and `#pricing`, and appears on all 6 case pages × 3 locales.
  - focus returns to the trigger after Escape.
  - nav order and `#pricing` scroll.
  - `services` count 4.
  - NDA badge present; no clients marquee.
  - DOM `data-scene` values match the expected list.
  - no horizontal overflow at 360/390 px for uz/ru/en.
  - ru/en contain no uz-only phrases.
  - seo title ≤ 60 and description ≤ 160 characters.
- Q3 drop the US-4 consent-removal and US-15 analytics checks (ADR-5, out of scope).
