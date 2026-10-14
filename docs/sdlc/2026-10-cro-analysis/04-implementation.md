# 04 · Implementation — 2026-10-cro-analysis

## webgl-engineer (opus)
- Files changed:
- Perf notes:
- Requests to frontend-developer:

## frontend-developer (sonnet)
- Files changed:
- Manual test notes:
- Requests to webgl-engineer:

## WebGL
- Files changed: `app/webgl/scenePresets.ts` only. Deleted `stats` and `expertise` presets; all other preset values unchanged. No new presets.
- Typing: `SCENE_PRESETS` is now `{...} satisfies Record<string, Partial<SceneState>>` (was `Record<string, ...>`, which accepted any name), plus exported `type SceneName = keyof typeof SCENE_PRESETS`. Anything typed as `SceneName` fails typecheck on a deleted name. `resolvePreset(name: string)` is unchanged at runtime: unknown names fall back to `DEFAULT_STATE`. Note: `data-scene="..."` template attributes are plain strings and are not type-checked.
- `useSceneSections.ts`: no change needed (it passes `el.dataset.scene` through by name).
- Perf: no change (no geometry, material or shader touched; same draw calls and triangle count).
- Typecheck: `npm run typecheck` exit 0 (the vue-router volar plugin warning was already there).
- For reviewer: when WebGL finished, `data-scene="stats"` was still in `StatsSection.vue:10` and `data-scene="expertise"` in `ExpertiseSection.vue:15`. frontend-developer is deleting both files. If either survives, it will morph the blob to the default state.

## Frontend

Files changed (all under `app/` unless noted):
- `data/site.ts` (clients/awards/total removed; `statsBase.numbers` 20+/5, `priceFrom`, `integrations`, `nda:true` on all projects), `composables/useLocale.ts` (`Site.stats` = numbers only), `data/site.uz.ts` (key table ADR-8 applied; `serviceTabs`/`stack`/`ui.hero`/`ui.stats`/`ui.expertise`/`ui.header.cta` removed).
- `nuxt.config.ts` runtimeConfig only: `public.leadEndpoint`, `public.showPlaceholders` (`NUXT_PUBLIC_SHOW_PLACEHOLDERS=1` sets `html[data-show-placeholders]` in `app.vue`).
- New: `composables/useLead.ts`, `components/ui/SectionCta.vue` (button only, `data-cta="section"`).
- Changed: `ContactModal.vue` (useLead, honeypot, budget toggle chips none preselected, consent checkbox kept required/unchecked on open, error/throttle alert + Telegram link, focus return), `SiteHeader.vue` (`ui.cta.label`, `data-cta="header"`), `HeroSection.vue` (2-line H1 at `--fs-h1`, facts, lead, CTA + Telegram link, `data-cta="hero"`), `IntroSection.vue` (marquee removed), `ServicesGrid.vue` (4 cards, `ui.services.also`, breakpoints 1279/560), `ProjectsSection.vue` (NDA badge, SectionCta in `.projects__all`), `ProcessSection.vue`, `FaqSection.vue` (`id="pricing"`, 2 price rows, integration chips under FAQ #3, SectionCta), `ContactSection.vue` (h2 size, `data-cta="contact"`), `pages/projects/[slug].vue` (NDA badge, `.case__cta`), `pages/index.vue`, `assets/css/main.css` (`--danger`, `.badge`, placeholder outline).
- Deleted: `StatsSection.vue`, `ExpertiseSection.vue`.

Deviations: SectionCta has no text/props (ADR arch: label only); spec's per-place sentence copy not added (no keys in ADR-8 table). Spec's service `bullets` and `pricing.fromNote` not implemented (not in the binding key table). Placeholder outline applies to hero facts, intro numbers, project price.

Manual test notes: `npm run dev`; open modal from header/hero/section CTAs; submit with demo endpoint -> error alert + Telegram link, values kept; second submit within 30 s after success -> throttled; fill hidden `website` input -> fake success, no request; Escape returns focus to the trigger; check 360/390 px H1 overflow in uz/ru/en; `#pricing` nav scroll.

Status: typecheck currently fails ONLY on missing keys in `site.ru.ts` / `site.en.ts` (linguist pending); build/generate not yet run.

## Round 2 (Frontend)

Closed the spec gaps. Files: `app/data/site.uz.ts` (sectionCta, service bullets, pricing.project.note, modal errName/errContact/errConsent/retry; uz title shortened to "Integratsiyalar"), `app/components/ui/SectionCta.vue` (props `text`, `variant: bar|card`), `ProjectsSection.vue` (card variant replaces projects__all CTA), `ProcessSection.vue`, `FaqSection.vue` (bar + pricing note), `pages/projects/[slug].vue` (bar with text), `ServicesGrid.vue` (title, outcome, bullets), `ContactModal.vue` (novalidate, inline errors with aria-invalid/aria-describedby, retry button in error state).

Manual tests: submit empty form -> three inline errors, focus unchanged; fill -> errors clear; error state shows retry + Telegram; Services at 1280px and 360px, no title overflow; each SectionCta shows its line.

Note: 03 §1.4 (numbers in the hero) is superseded by ADR-7; the numbers live only in Intro.

## Review fixes (loop 1)

Files (all under `app/`): `components/sections/HeroSection.vue` (`.hero__facts` + CSS removed), `IntroSection.vue` / `FaqSection.vue` (hard-coded PLACEHOLDER `title` removed, `data-placeholder` kept), `components/ui/ContactModal.vue` (`#__nuxt` set `inert` while open and cleared on close/unmount; submit uses `aria-disabled` not `disabled`; inner retry button dropped, submit label becomes `ui.modal.retry` on error; success `h2` `tabindex="-1"` focused on `sent`; first `[aria-invalid="true"]` focused after invalid submit; `aria-describedby` only when the error shows; throttled hint `role="status"`), `composables/useLead.ts` (AbortController + setTimeout instead of `AbortSignal.timeout`; `reset` no-op while sending), `components/ui/SectionCta.vue` (`data-reveal`), `pages/projects/[slug].vue` and `ProjectsSection.vue` (dead scoped CSS removed), `data/site.{uz,ru,en}.ts` (`ui.project.cta` deleted).

Manual tests: open modal and Tab 20 times, focus stays inside; invalid submit focuses the first invalid field; failed send then submit button reads "retry"; success moves focus to the heading; test on Safari 15 or older for the timeout fallback.
