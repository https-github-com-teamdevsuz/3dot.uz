# 02 · Architecture — Multilingual (uz/ru/en) + dark/light theme

> Owner: solution-architect (opus) · Status: draft · Input: 01-requirements.md (approved as-is: uz at `/`, ru at `/ru`, en at `/en`, 2-state toggle, system default, dark fallback)

## Overview

- **i18n is hand-rolled; we do not add a dependency.** The copy is split into one shared file, `app/data/site.ts`, plus three locale files. A `pages:extend` hook copies every page route under `/ru` and `/en`. All locale × page routes are listed explicitly in `nitro.prerender.routes`. The locale comes from the URL prefix. One composable file (`useLocale.ts`) provides the copy, path helpers and head tags. Uzbek copy is bundled directly. Russian and English copy are lazy chunks, loaded by a global route middleware before any render (SSR, hydration and client navigation).
- **Theme.** `<html data-theme="dark|light">` is set before first paint by a small inline `<head>` script. That same script also performs the stored-locale redirect (US-3). CSS custom properties hold the tokens for both themes. Markup never depends on the theme during SSR. `useTheme()` holds the state and is synced from the DOM only after hydration. The WebGL scene gets `LiquidScene.setTheme()`, which damps between two pre-allocated palettes. It uses the same environment map, creates no new render target, and allocates nothing in the loop.

## Component tree & files

```
app.vue                      useHead: <html lang>, canonical, hreflang×3 + x-default, og:locale
└─ layouts/default.vue       skip-link text from copy
   ├─ SitePreloader · LiquidCanvas(.client) ← useTheme().theme
   ├─ SiteHeader
   │   ├─ LangSwitch  (desktop bar + inside mobile menu)
   │   └─ ThemeToggle (desktop bar + mobile bar next to burger)
   ├─ <NuxtPage/>  index.vue | projects/[slug].vue   (×3 locales via pages:extend)
   ├─ SiteFooter · ContactModal · CustomCursor
error.vue                    copy + localePath('/')
```

| File | New/changed | Owner agent | Purpose |
|------|-------------|-------------|---------|
| `nuxt.config.ts` | changed | frontend-developer (see ADR-7) | `hooks['pages:extend']`, `nitro.prerender.routes`, head: drop `htmlAttrs.lang`/title/description/og:title, add inline script, 2 media-scoped `theme-color` metas |
| `app/data/site.ts` | changed | frontend-developer | Shared, non-translatable data plus types: `LOCALES`, `DEFAULT_LOCALE`, `SITE_URL`, `brand/email/phone/telegram/socials/clients`, `projectBase[]`, `ProjectSlug`, `PROJECT_SLUGS`, `Project`, `SiteCopy`. Pure TS: no Vue/Nuxt imports (nuxt.config imports it) |
| `app/data/site.uz.ts` | new | frontend-developer | All Uzbek copy (moved from site.ts and from hard-coded strings in components). Source of truth for `SiteCopy` |
| `app/data/site.ru.ts`, `site.en.ts` | new | frontend-developer | `export default { … } satisfies SiteCopy`. Key parity is checked by the type system |
| `app/composables/useLocale.ts` | new | frontend-developer | `useLocale`, `useSite`, `useLocalePath`, `useSwitchLocalePath`, `loadLocale`, `storeLocale`, `useLocaleHead` |
| `app/middleware/locale.global.ts` | new | frontend-developer | `await loadLocale(localeFromPath(to.path))` |
| `app/composables/useTheme.ts` | new | frontend-developer | `useTheme(): { theme: Ref<Theme>, toggle(): void }` |
| `app/plugins/theme.client.ts` | new | frontend-developer | On `app:mounted`: sync state from `<html data-theme>`. Adds a `prefers-color-scheme` listener that only acts when nothing is stored |
| `app/components/ui/LangSwitch.vue` | new | frontend-developer | 3 `<NuxtLink>`s with `hreflang`, `lang`, `aria-current`, `aria-label`. Calls `storeLocale` on click |
| `app/components/ui/ThemeToggle.vue` | new | frontend-developer | `<button>` with a static translated label and `aria-pressed`. Both icons are rendered and CSS picks one |
| `app/app.vue` | changed | frontend-developer | `useLocaleHead()` |
| `app/assets/css/main.css` | changed | frontend-developer | Token sets for `:root`/`[data-theme=dark]` and `[data-theme=light]`, `color-scheme`, `--on-accent`, `--accent-ink`, `--header-scrim` |
| `app/layouts/default.vue`, `app/error.vue`, `app/pages/index.vue`, `app/pages/projects/[slug].vue` | changed | frontend-developer | Copy and links through the composables |
| `app/components/sections/*.vue` (all 9), `app/components/ui/{SiteHeader,SiteFooter,ContactModal,SitePreloader,ProjectCover,CustomCursor,BrandLogo}.vue` | changed | frontend-developer | Migrate imports, hard-coded strings and hard-coded dark colours |
| `app/webgl/scenePresets.ts` | changed | webgl-engineer | `SceneTheme`, `ScenePalette`, `SCENE_PALETTES` |
| `app/webgl/LiquidScene.ts` | changed | webgl-engineer | `theme` option, `setTheme()`, palette-driven colours in `update()` |
| `app/components/webgl/LiquidCanvas.client.vue` | changed | webgl-engineer | Pass the initial theme from the DOM, `watch(useTheme().theme)`, light variants of the CSS glow and fallback |

No new dependencies. No sitemap or robots.txt in this feature: the prerender route list covers US-4 "or the generated routes list". Add them once `SITE_URL` is confirmed (open question 9).

## State & data flow

### Copy layout (exact)

```ts
// app/data/site.ts  (shared, pure)
export const LOCALES = ['uz', 'ru', 'en'] as const
export type Locale = (typeof LOCALES)[number]
export const DEFAULT_LOCALE: Locale = 'uz'
export const SITE_URL = 'https://3dot.uz' // confirm (open question 9)
export const brand = '3dot'; export const email = …; phone; telegram; socials; clients
export const projectBase = [ { slug: 'ijro-pro', title: 'IjroPro', year: 2026, palette: [...], stack: [...] }, … ] as const
export type ProjectSlug = (typeof projectBase)[number]['slug']
export const PROJECT_SLUGS = projectBase.map((p) => p.slug)
export interface Project { slug; title; year; palette; stack; summary; tags; awards; description }  // merged shape, unchanged for consumers
export type SiteCopy = typeof import('./site.uz').default
```

```ts
// app/data/site.uz.ts   (ru/en identical shape, end with `satisfies SiteCopy`)
export default {
  meta: { title, description, ogLocale: 'uz_UZ' },
  site: { tagline, role, city, heroLead, intro, nav: [{ label, hash: '#intro' }, …] },
  servicesTitle, services, stats, serviceTabs, stack, process, pricing, faq, budgets,
  projects: { 'ijro-pro': { summary, tags, awards, description }, … } satisfies Record<ProjectSlug, …>,
  ui: { skipLink, header: {…}, modal: {…}, footer: {…}, preloader, hero: {…}, project: {…}, error: {…},
        theme: { toggle: 'Mavzuni almashtirish' }, lang: { uz: 'O‘zbekcha', ru: 'Русский', en: 'English' },
        coverLabel: (title: string) => `${title} loyihasi muqovasi` }
}
```

- Nav stores only `hash`. The href is built as `localePath('/') + hash`.
- Interpolations are plain functions inside the locale file. There is no formatter.
- `stack` contains "1C integratsiya", so it is locale data. `clients` and the project title, slug, palette, year and stack are shared.
- `site.uz.ts` must not use `as const`. That keeps `SiteCopy` widened to `string`, so ru/en can hold any text while keys and array/object shapes are still enforced.

### `app/composables/useLocale.ts` contract

```ts
localeFromPath(path: string): Locale        // /^\/(ru|en)(\/|$)/ → 'ru'|'en', else 'uz'
loadLocale(l: Locale): Promise<void>        // fills a module-level shallowReactive cache; uz is a static import, ru/en via import('~/data/site.ru')
useLocale(): ComputedRef<Locale>            // from useRoute().path
useSite(): ComputedRef<SiteCopy & { projects: Project[] }>  // cache[locale] ?? cache.uz; projects merged once at load time (projectBase × locale entry)
useLocalePath(): (path: string) => string   // uz: path; ru: '/ru' + (path === '/' ? '' : path)
useSwitchLocalePath(): (l: Locale) => string // strip prefix of route.path, re-prefix, keep route.hash
storeLocale(l: Locale): void                // localStorage '3dot:locale' (client only, try/catch)
useLocaleHead(): void                       // called once in app.vue (see SEO)
```

- The cache is module-level and holds immutable data. It is safe across prerender requests because the current locale is always read from the route, never from module state.
- Each consumer calls `const t = useSite()` at the top of `setup` and reads `t.site.heroLead`, `t.stats.headline`, `t.ui.header.cta` and so on. The template auto-unwraps the top-level ref.

### Consumer migration (every importer of `~/data/site`)

| File | Before → after |
|------|----------------|
| `pages/index.vue` | `useSeoMeta({ title: () => t.value.meta.title, description: () => t.value.meta.description, ogTitle, ogDescription })` |
| `pages/projects/[slug].vue` | `projects` → `t.value.projects`. 404 message from `t.ui.error`. Back link `localePath('/') + '#projects'`. Next link `localePath('/projects/' + slug)`. Labels Yil/Stek/Natijalar, "keyingi loyiha", `data-cursor` come from `t.ui.project` |
| `SiteHeader.vue` | `site.nav` → `t.site.nav`. `go()` compares `route.path === localePath('/')`. CTA and aria labels from `t.ui.header`. Mount `LangSwitch` + `ThemeToggle`. `.header--scrolled` background uses `--header-scrim` |
| `SiteFooter.vue` | nav and tagline from `t`. Links through `localePath`. Shared contacts from `site.ts` |
| `ContactModal.vue` | All labels, button states, success text, consent text and `aria-label="Yopish"` from `t.ui.modal`. `budgets` from `t`. Default budget is `t.value.budgets[1]`, re-read when the modal opens |
| `SitePreloader.vue`, `HeroSection.vue`, `IntroSection.vue`, `ServicesGrid.vue`, `StatsSection.vue`, `ProjectsSection.vue` (links via `localePath`), `ExpertiseSection.vue` (aria-labels), `ProcessSection.vue`, `FaqSection.vue`, `ContactSection.vue` | Same pattern. **Also grep each template for literal Uzbek text and aria-labels** (e.g. hero "scroll", "(IT-yechimlar ’26)", button "Loyihani muhokama qilish") |
| `ProjectCover.vue` | `aria-label` → `t.ui.coverLabel(title)` |
| `layouts/default.vue`, `error.vue` | Skip-link text. Error copy and `clearError({ redirect: localePath('/') })` |

### Routing and prerender (nuxt.config.ts)

```ts
import { LOCALES, DEFAULT_LOCALE, PROJECT_SLUGS } from './app/data/site'
const prefixes = LOCALES.map((l) => (l === DEFAULT_LOCALE ? '' : `/${l}`))
hooks: {
  'pages:extend'(pages) {
    for (const p of [...pages]) for (const l of LOCALES) if (l !== DEFAULT_LOCALE)
      pages.push({ ...p, name: `${p.name}___${l}`, path: `/${l}${p.path === '/' ? '' : p.path}` })
  }
},
nitro: { prerender: { crawlLinks: true, routes: prefixes.flatMap((x) => [x || '/', ...PROJECT_SLUGS.map((s) => `${x}/projects/${s}`)]) } }
```

- Result: **21 HTML routes** (3 × (1 home + 6 projects)), plus their payloads.
- `crawlLinks` stays as a safety net.
- Canonical form: `/`, `/ru`, `/en`, `/ru/projects/x` (no trailing slash). `ru/index.html` serves both `/ru` and `/ru/`, so the "`/ru/`" URL in the requirements is satisfied.

### Global middleware `locale.global.ts`

```ts
export default defineNuxtRouteMiddleware((to) => loadLocale(localeFromPath(to.path)))
```

- Runs on the server before render.
- Runs on the client's initial route before hydration (`router.isReady` gates the mount), so the ru/en chunk is in the cache when hydration happens. This means no mismatch.
- On each client navigation it loads the target locale before the route commits.

### SEO (`useLocaleHead` in app.vue)

- `htmlAttrs.lang = locale`
- `link rel=canonical` = `SITE_URL + route.path`
- `link rel=alternate hreflang=uz|ru|en` = `SITE_URL + switchLocalePath(l)` (hash dropped)
- `hreflang=x-default` points to the uz URL of the same page
- `meta og:locale` = `t.meta.ogLocale`
- Per-page title and description stay in the pages (`useSeoMeta`)

### Theme state

```ts
// app/composables/useTheme.ts
export type Theme = 'dark' | 'light'
export const useTheme = () => {
  const theme = useState<Theme>('theme', () => 'dark')   // stays 'dark' through SSR + hydration
  const toggle = () => { theme.value = theme.value === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = theme.value; try { localStorage.setItem('3dot:theme', theme.value) } catch {} }
  return { theme, toggle }
}
```

- `plugins/theme.client.ts`: `nuxtApp.hook('app:mounted', …)` sets `theme.value` from `document.documentElement.dataset.theme`. It also adds a `matchMedia('(prefers-color-scheme: light)')` `change` listener that updates the attribute and state **only if** `localStorage['3dot:theme']` is empty (US-9).
- Theme cross-fade: none by default (instant attribute swap). If 03-design-spec asks for one, add `html.theme-fade *{transition:background-color .3s,color .3s,border-color .3s}` for 300 ms in `toggle()`, skipped when `$reducedMotion`.

### Inline head script (nuxt.config `app.head.script`, `tagPosition: 'head'`, first in head)

```js
(function(){var d=document.documentElement,t,l,p=location.pathname;try{t=localStorage.getItem('3dot:theme');l=localStorage.getItem('3dot:locale')}catch(e){}
d.dataset.theme=t==='light'||t==='dark'?t:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');
if((l==='ru'||l==='en')&&!/^\/(ru|en)(\/|$)/.test(p))location.replace('/'+l+(p==='/'?'':p)+location.search+location.hash)})()
```

- About 450 bytes. It is a static string, so every prerendered page gets identical HTML and there is nothing to hydrate.
- If JS is disabled, the CSS default (`:root` = dark) applies.
- A stored `uz` (set by picking UZ in the switcher) does not redirect, which covers US-3.

## SSR / client boundaries

| Concern | Server (prerender) | Client |
|---|---|---|
| Copy | Locale from path. Loaded in middleware. Rendered into HTML | Same chunk loaded before hydration. Reactive on navigation |
| `<html lang>`, hreflang, canonical | `useHead` | Same, reactive |
| `data-theme` | **Never rendered by Vue/unhead.** Set only by the inline script and `toggle()` | DOM is the source of truth |
| `useTheme().theme` | `'dark'` | `'dark'` until `app:mounted`, then synced |
| Theme-dependent markup | Forbidden. Both toggle icons are rendered and CSS (`[data-theme=light] .icon-sun`) picks one. The label is static per locale | `aria-pressed` binds to `theme === 'light'` and is correct after `app:mounted` (a patch, not a hydration mismatch) |
| localStorage, matchMedia | never | inline script, `theme.client.ts`, `storeLocale`, `toggle` |

## WebGL plan

- **Geometry / draw calls:** unchanged. The blob is 1 draw (icosahedron detail 48) and the satellites are 3 draws sharing one geometry and material. No new geometry, render target or PMREM pass.
- **Shader changes:** none in GLSL. `uRimColor`, `uRim`, `material.color`, `material.envMapIntensity` and `renderer.toneMappingExposure` are driven from the mixed palette. `customProgramCacheKey` stays the same, so there is no recompile on toggle.
- **Contract (scenePresets.ts):**
  ```ts
  export type SceneTheme = 'dark' | 'light'
  export interface ScenePalette { rimA: string; rimB: string; base: string; tint: string; rimMin: number; envIntensity: number; exposure: number }
  export const SCENE_PALETTES: Record<SceneTheme, ScenePalette> = {
    dark:  { rimA: '#c8ff5a', rimB: '#7b5cff', base: '#ffffff', tint: '#c8ff5a', rimMin: 0.25, envIntensity: 1.25, exposure: 1.05 }, // = today
    light: { /* webgl-engineer tunes; start: rimA '#7b5cff', rimB '#2b6cff', base '#e9ebf0', tint '#7b5cff', rimMin 0.15, envIntensity 1.1, exposure 0.95 */ }
  }
  ```
- **Contract (LiquidScene.ts):**
  - `new LiquidScene(canvas, { reducedMotion, theme })`
  - `setTheme(theme: SceneTheme, instant = false): void` sets `themeTarget` to 0 or 1. If `instant || reducedMotion`, it sets `themeMix` immediately.
  - At construction it parses both palettes into pre-allocated `THREE.Color`s (8 instances). Scratch colours `rimA`, `rimB`, `base` and `tint` are class fields.
  - `update()`: `themeMix = damp(themeMix, themeTarget, 6, dt)` (about 0.5 s). Then `scratch.lerpColors(dark.x, light.x, themeMix)`, and the existing lines use the scratch colours instead of `ACCENT`, `VIOLET` and `WHITE`. No `new`, `clone()` or object spread in the loop.
  - The existing `Object.keys(c).forEach` in `update()` allocates every frame. Replace it with a static key array while you are in that function.
- **Contract (LiquidCanvas.client.vue):**
  - Initial theme is `document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'`, passed to the constructor. Do **not** use `useTheme()` for the initial value, because it reads `'dark'` until `app:mounted`.
  - Use `watch(useTheme().theme, (t) => scene?.setTheme(t))`. The post-mount sync then re-sends the same value, which is a no-op.
  - Restyle the `.webgl::before` glow and the `.webgl--fallback::after` sphere for light using `:global([data-theme='light']) .webgl…`. The canvas clear stays transparent, so the background is always `--bg` (US-10).
- **Disposal & fallbacks:** `dispose()` is unchanged: no new GPU resources. If tuning shows a single dark environment cannot pass US-10 contrast and look right, build a second "light studio" env lazily on the first `setTheme('light')`, outside the loop, and dispose it in `dispose()`. Record that in 04-implementation. No WebGL means the CSS fallback sphere per theme. Reduced motion means instant theme swap and today's blob behaviour. Low-end mobile has no change (no added cost).

## Performance strategy

| Budget | Impact |
|---|---|
| Initial JS ≤ 180 KB gzip | About +1.5 KB (useLocale, useTheme, middleware, 2 small components). Uzbek copy is already in the bundle today, so it is neutral. ru/en are separate chunks of about 4–5 KB gzip each (Cyrillic UTF-8), and only the active one is loaded. `@nuxtjs/i18n` would have cost an estimated 15–25 KB (vue-i18n runtime plus module runtime), see ADR-1. The performance auditor must measure the actual delta in 07. |
| three chunk ≤ 200 KB | Unchanged. No new three imports |
| FPS ≥ 55 | Per frame: 4 `lerpColors` plus 3 scalar lerps. Negligible. One per-frame allocation is removed |
| LCP ≤ 2.5 s | HTML is prerendered per locale. The inline script runs in under 1 ms. On ru/en, the lazy chunk adds one request before hydration but does not affect LCP (text is already painted) |
| CLS ≤ 0.1 | No theme flash (pre-paint attribute). Russian strings are longer: header nav/CTA and hero lead need `white-space: nowrap` and a breakpoint check at 1440 and 390 px (design spec decides whether the burger breakpoint moves from 900 px). Unbounded, Manrope and JetBrains Mono serve Cyrillic via `unicode-range` from the existing `css2` URL, so no change is needed. `display=swap` behaves the same as today |
| Prerender | 21 routes (was 7). Build time is negligible |

## ADRs

### ADR-1: Hand-rolled i18n instead of `@nuxtjs/i18n`
- Context: we need 3 locales, prefix-except-default routes, `<html lang>`, hreflang and canonical, a static prerender, and must stay under the 180 KB JS budget. There are no plurals, no runtime locale negotiation and no translation tooling.
- Decision: no new dependency. Use typed locale modules, one composable file, one middleware and a `pages:extend` hook. Total is about 120 LOC.
- Consequences: no bundle cost beyond about 1.5 KB. Key parity is enforced by `satisfies SiteCopy` at typecheck. We own the hreflang and canonical logic, about 15 lines in `useLocaleHead`. If plurals, ICU messages or more locales are ever needed, migrate to `@nuxtjs/i18n` (the copy files map 1:1 to its lazy message files).

### ADR-2: Locale routes through the `pages:extend` hook
- Context: alternatives were an `[[locale]]` optional-param folder (it matches `/anything` as a locale and needs `validate`) or duplicated page files.
- Decision: clone every page route under `/ru` and `/en` in `nuxt.config.ts`. Derive the locale from the path prefix (`localeFromPath`), not from route meta, so `error.vue` and unmatched routes work too.
- Consequences: no change to page files' structure. Exact static paths, so invalid prefixes 404. New pages are localised automatically.

### ADR-3: Uzbek copy eager, ru/en lazy, merged project data
- Context: the NFR is to load only the active locale's messages. `error.vue` and unmatched routes still need guaranteed copy.
- Decision: `site.uz.ts` is statically imported as the fallback. ru/en use `import()` and are awaited in the global middleware. Shared project fields live once in `site.ts`, and translatable fields are keyed by `ProjectSlug`.
- Consequences: ru/en pages also download uz copy (about 4 KB, which is today's cost anyway). A missing slug translation fails typecheck. Nothing is duplicated in `__NUXT__` payloads because the copy comes from modules, not `useState`.

### ADR-4: One inline head script for theme and stored-locale redirect
- Context: static HTML cannot know the user's theme or locale. Applying either after hydration causes a flash and a hydration mismatch.
- Decision: a static script of about 450 B in `app.head.script`, run before CSS paint. It sets `data-theme` and, if a ru/en choice is stored and the URL is unprefixed, calls `location.replace` to the prefixed URL.
- Consequences: no flash, no mismatch, and crawlers (no localStorage) are never redirected. A user who stored `en` and opens a shared uz link is redirected, which matches US-3. Inline script requires CSP `'unsafe-inline'` or a hash if a CSP is added later (devops note).

### ADR-5: DOM attribute is the source of truth for the theme; state syncs after mount
- Context: `useState('theme')` is `'dark'` on the server. If the client set it to `'light'` before hydration, `aria-pressed` and any bound attribute would mismatch.
- Decision: `theme.client.ts` syncs on `app:mounted`. All visual differences are CSS (`[data-theme]`). The canvas reads its initial theme from the DOM.
- Consequences: there is one reactive patch of `aria-pressed` after mount, which is invisible. Components must never `v-if` on the theme.

### ADR-6: WebGL theming by palette damping, single environment map
- Context: a second PMREM environment costs VRAM, a startup render and a dispose path. Chrome reflecting a dark studio already reads with high contrast on a light background.
- Decision: `setTheme()` damps a scalar between two pre-parsed palettes that drive rim, base, tint, envIntensity and exposure. There are no shader or program changes.
- Consequences: zero GPU and memory cost, toggle without context recreation, and dispose is unchanged. The escape hatch (lazy light env) is documented in the WebGL plan.

### ADR-7: `nuxt.config.ts` edited by frontend-developer for this feature
- Context: pipeline ownership gives devops only the build/nitro sections, and devops does not run in phase 03. Hooks, head and prerender routes are coupled to the i18n design.
- Decision: frontend-developer owns all `nuxt.config.ts` edits in this feature. webgl-engineer does not touch it.
- Consequences: no parallel conflict. devops reviews the `nitro` block in phase 06.

### ADR-8: `theme-color` via two media-scoped metas
- Context: an unhead-managed meta updated on toggle risks being reset during hydration. US-12 is "Should".
- Decision: `<meta name="theme-color" media="(prefers-color-scheme: dark)" content="<dark --bg>">` and the equivalent for light. CSS sets `color-scheme: dark` / `light` per `[data-theme]`.
- Consequences: browser chrome follows the OS, not a manual override. Accepted. Upgrade: set the meta in `toggle()` and the inline script, without unhead.

## Risks

- **Hydration with the wrong copy.** If the ru chunk is not loaded before hydration, uz renders and the hydration mismatches. Mitigation: the global middleware awaits `loadLocale`, and `useSite` warns in dev when it falls back.
- **Missed hard-coded strings and colours.** Known literals: `rgba(5,5,5,…)` in `SiteHeader.vue:92` and `ServicesGrid.vue:49`, `#000` text on accent across components (→ `--on-accent`), `ProjectCover.vue` gradient stops. Mitigations: grep-based audit (task F9), key-parity typecheck, and a phrase-absence e2e test (QA).
- **Lime accent on a light background fails AA.** Use `--accent-ink` (text, links, focus ring) and keep `--accent` for fills only. Values come from 03-design-spec.
- **Russian overflow and CLS in the header at 901–1200 px.** Design spec sets the nowrap/breakpoint rule. QA checks at 1440 and 390 px.
- **Out-in page transition on a locale switch.** The header updates instantly while the old page fades out with the old copy (the page's own `useRoute` is frozen). Accepted. Scroll resets via the existing `page:finish` hook and the hash is preserved.
- **`SITE_URL` is unconfirmed** (open question 9). The hreflang and canonical URLs depend on it.

## Task breakdown (per owner, conflict-free)

### webgl-engineer (files: `app/webgl/**`, `app/components/webgl/**` only)
1. **W1** `scenePresets.ts`: add `SceneTheme`, `ScenePalette`, `SCENE_PALETTES` (dark = current constants exactly).
2. **W2** `LiquidScene.ts`:
   - add the `theme` option and `setTheme(theme, instant?)`
   - pre-allocate palette and scratch colours
   - drive the rim, base, tint, envMapIntensity and exposure from the mix
   - replace the per-frame `Object.keys` allocation
   - keep `dispose()` complete
3. **W3** `LiquidCanvas.client.vue`: initial theme from the DOM, `watch(useTheme().theme)`, light CSS for the glow and the fallback sphere.
4. **W4** Tune the light palette against US-10 (≥ 3:1 blob vs `--bg` light, taken from 03-design-spec) and check desktop FPS. Note the final values in 04-implementation.

### frontend-developer (everything else in `app/`, plus `nuxt.config.ts`)
1. **F1** `app/data/site.ts` → shared and types. Create `site.uz.ts` (existing copy plus every hard-coded UI string). Create `site.ru.ts` and `site.en.ts` (drafts, marked for native review).
2. **F2** `app/composables/useLocale.ts` and `app/middleware/locale.global.ts`.
3. **F3** `nuxt.config.ts`:
   - `pages:extend`
   - prerender routes
   - inline script
   - theme-color metas
   - remove the static lang, title, description and og:title
4. **F4** `app/app.vue` → `useLocaleHead()`. Update `pages/index.vue` and `pages/projects/[slug].vue`.
5. **F5** `app/composables/useTheme.ts` and `app/plugins/theme.client.ts`. **Ship F5 first**, because W3 depends on `useTheme` (contract above).
6. **F6** `main.css` token sets for dark and light (values from 03-design-spec): `--bg --bg-2 --fg --fg-dim --fg-faint --line --accent --accent-ink --on-accent --violet --header-scrim`, plus `color-scheme`.
7. **F7** `LangSwitch.vue` and `ThemeToggle.vue`. Integrate them into `SiteHeader.vue` (desktop bar and mobile menu).
8. **F8** Migrate every consumer in the migration table.
9. **F9** Colour audit: grep `app/**/*.vue` and `main.css` for `#000`, `#fff`, `rgba(5`, `rgba(0`, `rgba(242`. Replace each with tokens or `color-mix(in srgb, var(--bg) N%, transparent)`.
10. **F10** `npm run typecheck && npm run generate`. Confirm 21 HTML files in `.output/public`.

### Interface contract summary (W ↔ F)
- F provides `useTheme(): { theme: Ref<'dark'|'light'>; toggle(): void }`, auto-imported from `app/composables/useTheme.ts`.
- W provides `LiquidScene.setTheme(theme: 'dark'|'light', instant?: boolean)` and the `theme` constructor option. Only `LiquidCanvas.client.vue` calls them.
- Shared truth: `document.documentElement.dataset.theme` is set by the inline script (F3) and by `toggle()` (F5). W only reads it.
