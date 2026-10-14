# 05 · Code review: 2026-10-i18n-theme

> Owner: code-reviewer (opus) · Loop 1 · 2026-10-14

I found one blocker: in light theme, every fixed-position element (header, blob, menu, modal) scrolls away with the page. Three major issues also need fixing. Locale routing, SEO tags, the head script and the WebGL work look correct and I checked them in a real browser.

**How I checked:** I read all 37 changed and new files. I ran `npm run generate`, which produced 21 locale HTML pages plus 200.html and 404.html. I read the generated `.output/public` HTML. I served the build with `npx serve` and probed it with Playwright using the installed Edge browser (`channel: 'msedge'`), because the Playwright Chromium download is not installed on this machine. I ran a key-parity script over the uz/ru/en files.

| Severity | Location | Owner | Finding | Fix |
|---|---|---|---|---|
| BLOCKER | `app/components/ui/ThemeToggle.vue:51` | frontend-developer | `:global([data-theme='light']) .theme__icon` drops the `.theme__icon` part when Vue compiles it. The built CSS is `[data-theme=light]{transform:rotate(0)}`, so in light theme the `<html>` element itself gets a transform. Any transform on `<html>` makes it the container for every `position: fixed` element. In the browser, light theme at scrollY 2090 put the header and `.webgl` canvas at top -2090; in dark theme they stayed at 0. The same applies to the grain overlay, mobile menu, contact modal, cursor and preloader. The icon also never rotates. | Use `:root[data-theme='light'] .theme__icon { transform: rotate(0deg); }`, the same pattern as `LiquidCanvas.client.vue:97`. A QA check should assert `getComputedStyle(document.documentElement).transform === 'none'` in light theme. |
| MAJOR | `app/pages/projects/[slug].vue:19-22` | frontend-developer | US-4 requires `og:title` and `og:description` on every prerendered page. All 18 project pages have only `og:type` and `og:locale` (checked in `en/projects/ijro-pro/index.html`). Home pages are fine. | Add `ogTitle` and `ogDescription` to the existing `useSeoMeta`, using the same getters as `title` and `description`. |
| MAJOR | `app/components/ui/SiteHeader.vue:121` (`.header__theme`) | frontend-developer | When the mobile menu is open, it covers the theme toggle. `.menu` is positioned with `z-index: 1`, while the toggle has no positioning (the logo and burger have `position: relative; z-index: 2`). At 390px with the menu open, the element at the toggle's centre is `.menu`. The toggle stays in the Tab order while hidden, which fails WCAG 2.4.11 (focus not obscured). Spec §1/§3 says it is always visible in the bar. | Add `position: relative; z-index: 2;` to `.header__theme`. |
| MAJOR | `app/components/ui/ContactModal.vue:165-169` (`.chip.is-active`) | frontend-developer | The selected budget chip is marked only by lime: `background` and `border-color: var(--accent)`, which is 1.06:1 against the light background. Its text (`--on-accent` #050505) is about the same as unselected text (`--fg` #0d0d0f). In light mode the selected chip is effectively indistinguishable, and its border has lower contrast than unselected chips (`--line-strong`). This breaks 03 §4/§9 ("lime never the sole indicator; pair with ink border") and WCAG 1.4.11. | Set `border-color: var(--accent-ink)` on `.chip.is-active`. |
| MINOR | `app/assets/css/main.css:255-266` | frontend-developer | Design spec §5 asks for an opacity-only, 0.35s page transition on language change. The existing transition (opacity plus ±24px translateY, 0.5s) is unchanged, and the deviation is not recorded in 04-implementation. | Either make `.page-*` opacity-only at 0.35s as specified, or record the decision in 04. |
| NIT | `app/components/ui/ThemeToggle.vue:12` | frontend-developer | `setTimeout` is not stored. Clicking twice quickly lets the first timer remove `theme-anim` in the middle of the second fade. | Keep the timer id and call `clearTimeout` before re-adding the class. |
| NIT | `app/components/ui/CustomCursor.client.vue:97` | frontend-developer | The label is still hard-coded `#000`. The file is in the 02 migration table but was not touched. It renders the same today. | Use `color: var(--on-accent)`. |
| NIT | `app/components/sections/ExpertiseSection.vue:25` | frontend-developer | `v-for="(t, i) in serviceTabs"` shadows the `t = useSite()` copy object. Any later `t.ui.*` inside the loop would silently break. | Rename the loop variable to `tab`. |

## What I verified works
- **Locale loading before hydration:** in Nuxt 4.6.1 the global middleware runs during the client's initial `router.replace` in `app:created`, which happens before mount. So the ru/en copy is cached before hydration. No console errors or warnings on `/`, `/ru`, `/en`, `/ru#projects`, `/en/projects/ijro-pro` or `/ru/projects/ijro-pro#x`.
- **Hash URLs:** landing with a hash causes no hydration mismatch. Nuxt hydrates against the prerendered path first, then restores the hash; the switcher hrefs end up as `/en#projects` and so on.
- **Inline head script:** it is the same in every page, including 404.html and 200.html, and comes before the font and CSS styles. A stored `en` on `/projects/ijro-pro?a=1#x` redirects to `/en/projects/ijro-pro?a=1#x` and keeps the query and hash. Clicking UZ stores `uz` and lands on `/projects/ijro-pro#x`, and reloading does not redirect. A redirect loop is impossible because the target always matches the prefix regex. Crawlers have no localStorage, so they are never redirected.
- **Head tags:** `<html lang>` is correct on all locales. Canonical, hreflang uz/ru/en and x-default (the unprefixed uz URL) are correct on home and project pages, e.g. `https://3dot.uz/ru/projects/ijro-pro`. `og:locale` and the translated title/description are on the home pages.
- **Theme:** `colorScheme` light/dark maps to `data-theme` light/dark. After hydration the toggle label syncs to the right action, and toggling updates the DOM, localStorage and the `role=status` text. `theme.client.ts` only reacts to the system setting when nothing is stored. Vue never renders `data-theme`.
- **Copy:** uz/ru/en have identical keys and array lengths, checked recursively. The only strings identical across locales are brand, stack and tech names, prices and native language names, as intended. A grep of all `.vue` files found no remaining hard-coded Uzbek text or aria-labels.
- **Russian header:** at 1440, 1180, 1024, 960 and 901px on `/ru`, `.header__inner` does not overflow, the CTA stays 46px high (no wrapping), and nav and CTA are `nowrap`. Mobile language pills are 54×44.
- **WebGL:**
  - Dark palette equals the old constants (satellites 1.25 × 0.88 = 1.1).
  - No per-frame allocation (the `Object.keys` closure is gone; palettes are parsed once).
  - `setTheme` switches instantly under reduced motion.
  - No new GPU resources; `dispose()` covers everything, including the satellite material now held as a field.
  - The `watch(theme)` is bound to the component and stops with it.
  - The light CSS fallback uses `:root[...]`, which compiles correctly.
- **GSAP:** `useReveal` and Hero contexts are unchanged and still reverted. Pages remount on locale change (distinct route keys), so `data-split` re-splits the new copy.

## Notes for QA (phase 05)
- The US-6 check `document.documentElement.scrollWidth <= innerWidth` fails on every locale, including uz: 2160 at 1440 and 585 at 390. This predates the feature: the projects track overflows, but `overflow-x: hidden` on html and body clips it. On `/ru` at 390 I found no overflowing element outside a clipping parent. Measure visible overflow (look for unclipped elements extending past `innerWidth`) instead of raw `scrollWidth`.
- Playwright's Chromium is not installed here (`npx playwright install` is needed). `channel: 'msedge'` works as a stopgap.
- Accepted, documented deviations: no light environment-map swap or dip choreography (04 WebGL §), `theme-color` follows the OS rather than the toggle (ADR-8), no re-split on resize or after `fonts.ready` (04 QA notes). The US-10 ≥3:1 canvas contrast sample is still unmeasured.

Typecheck: `npx nuxt typecheck` exits 0. It prints one tooling warning, `ERR_PACKAGE_PATH_NOT_EXPORTED` for `vue-router/volar/sfc-route-blocks`, which comes from the language-server plugin resolution, not from project code.

VERDICT: CHANGES_REQUESTED

---

# 05 · Code review, loop 2 (delta): 2026-10-i18n-theme

> Owner: code-reviewer (opus)

All 8 items from loop 1 are fixed and I found nothing new, so this is approved. I checked each fix in the source, then rebuilt (`npm run generate`: 21 locale pages) and tested the blocker and the menu fix in a browser (Edge via Playwright, against the served build).

| Severity (loop 1) | Location | Owner | Status | Evidence |
|---|---|---|---|---|
| BLOCKER | `app/components/ui/ThemeToggle.vue:53` | frontend-developer | FIXED | The built CSS is now `[data-theme=light] .theme__icon[data-v-…]{transform:rotate(0)}`, so `<html>` no longer gets a transform. In light theme after scrolling to 2090px: `getComputedStyle(document.documentElement).transform === 'none'`, header top is 0 and the `.webgl` canvas top is 0, so both stay fixed. The icon now rotates: `matrix(1,0,0,1,…)` in light, `matrix(-1,0,0,-1,…)` in dark. Dark theme is unchanged. No console errors in either theme. |
| MAJOR | `app/pages/projects/[slug].vue:22-23` | frontend-developer | FIXED | `ru/projects/ijro-pro/index.html` now has `og:title` ("IjroPro — 3dot") and the translated `og:description`. |
| MAJOR | `app/components/ui/SiteHeader.vue:121-125` | frontend-developer | FIXED | `.header__theme` now has `position: relative; z-index: 2`. At 390px with the menu open, the element at the toggle's centre is the toggle itself (`button.theme`), not `.menu`. |
| MAJOR | `app/components/ui/ContactModal.vue:167` | frontend-developer | FIXED | `.chip.is-active` now uses `border-color: var(--accent-ink)`. |
| MINOR | `app/assets/css/main.css:255-262` | frontend-developer | FIXED | `.page-*` now fades opacity only, over 0.35s; the translateY is gone. |
| NIT | `app/components/ui/ThemeToggle.vue:5,13-14` | frontend-developer | FIXED | The timer is kept in `fadeTimer` and cleared before it is set again. |
| NIT | `app/components/ui/CustomCursor.client.vue:97` | frontend-developer | FIXED | The label uses `color: var(--on-accent)`. |
| NIT | `app/components/sections/ExpertiseSection.vue:25` | frontend-developer | FIXED | The loop variable is now `tab`, and `t.ui.*` inside the loop resolves to the site copy again. |

Typecheck: `npx nuxt typecheck` exits 0, with the same `vue-router/volar` tooling warning as in loop 1.

QA notes from loop 1 still apply: measure visible overflow instead of raw `scrollWidth`, and the US-10 canvas contrast sample is still unmeasured.

VERDICT: APPROVED

---

# 05 · Code review, follow-up fixes (loop 3): 2026-10-i18n-theme

> Owner: code-reviewer (opus) · 2026-10-14 · scope: uncommitted diff after 34b073a

| Severity | file:line | Finding | Fix |
|---|---|---|---|
| NIT | app/data/site.ts:10 | Trailing space left after removing the TODO. | Deleted (orchestrator). |
| NIT | app/components/ui/CustomCursor.client.vue:84 | `border-color` not in the `transition` list; border snaps while fill fades. | Added `border-color 0.45s` (orchestrator). |
| NIT | app/components/ui/CustomCursor.client.vue:83 | In dark theme over lime fills the ring halo is only 50% opacity; still visible. | Optional, left as is. |

## Verified
1. **LiquidCanvas.client.vue**: `await nextTick()` + `disposed` guard is leak-free for unmount before, during and after the dynamic import; `onBeforeUnmount` cleanup unchanged.
2. **CustomCursor.client.vue**: dot/ring use `--fg` with `--bg` halo, label state ≈18:1 in both themes; hover logic, GSAP quickTo and listener cleanup untouched; no `mix-blend-mode` left.
3. **nuxt.config.ts** `autoSubfolderIndex: false`: output has `ru.html`, `en.html`, `index.html`, `200.html`, `404.html`; inline redirect and every `localePath()` caller emit slash-less URLs; `/ru/` 404 acceptable (nothing links to it).
4. **site.ru.ts / site.en.ts**: `plural()` is pure and SSR-safe with correct 11–14 handling; both satisfy `SiteCopy`; no HTML in strings; header nav / CTA strings unchanged; Russian typography correct.

VERDICT: APPROVE
