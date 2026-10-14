# 05 · Review: 2026-10-cro-analysis (loop 1)

Reviewer: code-reviewer (opus) · 2026-10-14. Scope: the full uncommitted diff, all 33 modified or deleted files plus the untracked `useLead.ts`, `SectionCta.vue`, `.env.example` and `workers/lead-relay/**`. No source edited. A throwaway Playwright measurement script was run against a static `serve` of the existing `.output/public`.

## Checks run
- `npm run typecheck`: exit 0.
- `node workers/lead-relay/test.mjs`: 11/11 passed.
- Measured on the built output, uz/ru/en:
  - Header at 901 / 960 / 1024 / 1100 / 1180 px: no overlap, no overflow; CTA one line, 46 px.
  - Hero H1 at 360 / 375 / 390 px: fits in all locales (ru lines end at 283 and 312 px).
  - Hero CTAs above the fold even at 375×667.
  - Projects track: `.projects__all` still 333 px wide at 1280 px, pin distance unchanged.
  - Modal on open: focus on Name, consent unchecked, no budget chip pressed.
  - Placeholder marker: `data-show-placeholders` off in built output.

## Findings

| Sev | file:line | Finding | Concrete fix | Owner |
|---|---|---|---|---|
| MAJOR | HeroSection.vue:57-62 + IntroSection.vue:13-17 | The numbers appear twice (hero `.hero__facts` and Intro `.intro__numbers`). Breaks US-8. ADR-7 says one set in Intro; 03 §1.4 puts it in the hero. | ADR-7 is binding: remove `.hero__facts` and its CSS; settle the doc conflict. | frontend-developer |
| MAJOR | HeroSection.vue:59, IntroSection.vue:15, FaqSection.vue:26 | `title="PLACEHOLDER (owner to confirm)"` hard-coded → visible tooltip and SR description in production (5× in index.html). | Remove `title`; keep `data-placeholder`; if wanted, bind `:title` only when `showPlaceholders`. | frontend-developer |
| MAJOR | ContactModal.vue:47-50 | No focus trap: 20 Tabs leave the dialog onto `.header__cta`. WCAG 2.4.3 / 2.1.2. | On open set `inert` on `#__nuxt`, remove on close and in `onBeforeUnmount`. | frontend-developer |
| MAJOR | useLead.ts:31 | No fallback for `AbortSignal.timeout` (Safari < 16, Chrome < 103, Firefox < 100): every submit errors on iOS 15. | Feature-detect; fall back to `AbortController` + `setTimeout`. | frontend-developer |
| MINOR | ContactModal.vue:100 | `:disabled` on submit while sending drops focus to body. | `:aria-disabled` + CSS. | frontend-developer |
| MINOR | ContactModal.vue:97 | Retry button inside the `v-if` alert unmounts on click → focus lost. | Drop inner retry; submit label becomes `ui.modal.retry` when `status==='error'`. | frontend-developer |
| MINOR | ContactModal.vue:104-109 | Success not announced; focused submit removed. | `h2` with `tabindex="-1"`, focus it on `sent`. | frontend-developer |
| MINOR | ContactModal.vue:18-21 | Invalid submit does not move focus. | Focus first `[aria-invalid="true"]` after `tried=true`. | frontend-developer |
| MINOR | ContactModal.vue:40 + useLead.ts:13 | `reset` during an in-flight send breaks the double-submit guard. | `reset` no-op while sending. | frontend-developer |
| MINOR | site.{uz,ru,en}.ts | Unused key `ui.project.cta`. | Delete from all three. | frontend-developer |
| MINOR | ci.yml:43, deploy.yml:51 | Leak regex misses a bare token. | Add `[0-9]{8,10}:[A-Za-z0-9_-]{30,}`. | devops-engineer |
| MINOR | deploy.yml:45 | Unset `LEAD_ENDPOINT` ships a form that always errors, silently. | Warn (or fail) before generate when the var is empty. | devops-engineer |
| MINOR | workers/lead-relay/test.mjs | Untested paths: Telegram throw → 502; no Origin; `Origin: null` → 403; no ACAO on 403; ACAO on 400/413/429. | Add the 5 cases. | devops-engineer |
| NIT | ContactModal.vue:59,64,91 | `aria-describedby` always set, even when the error span is absent. | Bind only when shown. | frontend-developer |
| NIT | ContactModal.vue:95 | Throttled hint uses `role="alert"`; spec says `status`. | `:role` by state. | frontend-developer |
| NIT | [slug].vue:114, ProjectsSection.vue:176 | Dead scoped CSS targeting the child SectionCta. | Delete or `:deep()`. | frontend-developer |
| NIT | worker.js:44 | Missing `Origin` skips the check. | Optional 403. | devops-engineer |
| NIT | SectionCta.vue | No `data-reveal`, never animates. | Optional `data-reveal`. | frontend-developer |

## Verified OK
- No fake success: demo/empty endpoint, non-2xx, network error, timeout → `error` with `role="alert"` + Telegram link; form values kept.
- POST is `text/plain` JSON; `hp` always `''`; filled honeypot short-circuits; honeypot not focusable, `aria-hidden`, offscreen.
- Throttle only after success; `useRuntimeConfig`/`useRoute`/`useLocale` in setup; `document`/`window` only in watch callback.
- Consent required + unchecked on each open; chips `aria-pressed`, none selected, deselectable.
- Worker: OPTIONS 204, non-POST 405 + Allow, bad/null origin 403, size checked twice, plain text no `parse_mode`, errors logged by status only, rate-limit map capped at 10 000, CORS on every response, secrets only via env, `.dev.vars` ignored.
- Section removal complete: no references to removed components, presets, data-scene values or keys; `SCENE_PRESETS` uses `satisfies`.
- Locale key parity holds. Nav order and `id="pricing"` correct.

VERDICT: CHANGES_REQUESTED

---

## 05 · Review: loop 2 delta (2026-10-cro-analysis)

Reviewer: code-reviewer (opus). Every loop-1 finding is fixed; checked in source, in the built `.output/public` (index.html 14:24:08, after the last ContactModal.vue edit 14:23:26), and by running the modal flows in a throwaway Playwright script. Typecheck exit 0. Worker self-check 16/16.

| Loop-1 item | Status | Evidence |
|---|---|---|
| MAJOR numbers shown twice | Fixed | `hero__facts` gone; only `.intro__numbers` remains (ADR-7). |
| MAJOR PLACEHOLDER titles visible | Fixed | No `title=`; `PLACEHOLDER` 0× in built uz/ru/en; `data-placeholder` + gated outline remain. |
| MAJOR no focus trap | Fixed | `inert` on `#__nuxt` while open, cleared on close/unmount; 25 Tabs cycle inside the dialog, honeypot never focused. |
| MAJOR no AbortSignal.timeout fallback | Fixed | AbortController + setTimeout(10 s), cleared in finally. |
| MINOR focus lost while sending | Fixed | `aria-disabled` + preventDefault; focus stays on the busy button; exactly 1 POST under Enter + forced click. |
| MINOR focus lost on Retry | Fixed | Submit label becomes retry text; focus stays on it; alert has Telegram link; form stays filled. |
| MINOR success not announced | Fixed | Done `h2` tabindex=-1 receives focus after 204. |
| MINOR no focus move on invalid submit | Fixed | First `[aria-invalid=true]` focused. |
| MINOR reset during send | Fixed | No-op while sending. |
| MINOR unused `ui.project.cta` | Fixed | Removed in 3 locales. |
| MINOR leak regex | Fixed | Bare-token alternative added; no false positive on current build. |
| MINOR deploy silent on unset LEAD_ENDPOINT | Fixed | Warning step before generate. |
| MINOR worker failure paths | Fixed | 16 tests incl. Telegram throw → 502. |
| NIT aria-describedby | Fixed | Bound only while the error shows. |
| NIT throttle role | Fixed | `role=status`, 0 extra POSTs. |
| NIT dead scoped CSS | Fixed | Removed. |
| NIT missing-Origin acceptance | Accepted | Documented. |
| NIT SectionCta data-reveal | Fixed | Reveals; static under reduced motion. |

Escape returns focus to the trigger in error, success and slow runs. No new findings.

VERDICT: APPROVE
