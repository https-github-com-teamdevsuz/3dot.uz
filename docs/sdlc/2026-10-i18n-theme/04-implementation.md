# 04 · Implementation — 2026-10-i18n-theme

## Frontend

> Owner: frontend-developer (sonnet) · Tasks F1-F10 from 02-architecture.md

### Files changed
- `nuxt.config.ts`: `pages:extend` clones every page under `/ru` and `/en`; `nitro.prerender.routes` lists 3 x (home + 6 projects); static inline head script (theme + stored-locale redirect); two media-scoped `theme-color` metas; removed static lang/title/description/og:title.
- Data: `app/data/site.ts` (shared: LOCALES, SITE_URL, contacts, clients, `statsBase`, `projectBase`, types), new `site.uz.ts` (source of `SiteCopy`), `site.ru.ts`, `site.en.ts` (`satisfies SiteCopy`). **ru and en are drafts and need native-speaker review.**
- Composables/plugins: new `useLocale.ts` (localeFromPath, loadLocale, useLocale, useSite, useLocalePath, useSwitchLocalePath, storeLocale, useLocaleHead), `middleware/locale.global.ts`, `useTheme.ts`, `plugins/theme.client.ts`.
- UI: new `LangSwitch.vue`, `ThemeToggle.vue`; `SiteHeader` (switcher + toggle in bar, pills in mobile menu, compaction at <=1180px); migrated `SiteFooter`, `ContactModal`, `SitePreloader`, `ProjectCover`, all 9 sections, `layouts/default.vue`, `error.vue`, `app.vue`, `pages/index.vue`, `pages/projects/[slug].vue`.
- `main.css`: dark/light token sets (`--bg-rgb --line-strong --accent-ink --on-accent --glow --grain-opacity --header-scrim`), ru typography clamps, ru split-text fixes, `.theme-anim` cross-fade.
- Pre-existing typecheck errors fixed: `useSceneSections.ts`, `plugins/motion.client.ts`.

### How it works
- Locale comes from the URL prefix (`/ru`, `/en`; uz has none). uz copy is bundled; ru/en are lazy chunks awaited by the global middleware before render/hydration. `useSite()` returns the merged copy (projects and stats merged with shared data).
- Theme: `<html data-theme>` is set only by the inline head script and `toggle()`; Vue never renders it. `useTheme().theme` is `'dark'` until `app:mounted`, then synced. Toggle `aria-label` flips after mount (patch, not mismatch). Both themes are CSS only.
- localStorage keys: `3dot:theme` (`light|dark`), `3dot:locale` (`uz|ru|en`, written on switcher click). A stored `ru`/`en` redirects unprefixed URLs once, before paint; stored `uz` does not.
- Generated: 21 HTML routes (`npm run generate` OK, 44 routes incl. payloads). Canonical form has no trailing slash (`/ru`, `/ru/projects/x`); `/ru/` is served by the same `ru/index.html`.

### QA notes
- Not yet browser-tested by me (no dev-server console check for hydration warnings); please verify hydration on `/ru` and `/en`, light-mode first load, and the 1440/390 overflow checks on `/ru`.
- Not done (ponytail): re-split of `data-split` on resize/fonts.ready (word-level split does not depend on font metrics; Cyrillic overrides are CSS only); `hyphens:auto` is on `p`, `.lead` is a `p` so it may hyphenate.
- `SITE_URL` is `https://3dot.uz` (unconfirmed). `footer.navAria`, `hero.scroll` ("pastga") are new strings.

## WebGL

> Owner: webgl-engineer (opus) · Tasks W1–W4 from 02-architecture.md (ADR-6)

### Files changed
- `app/webgl/scenePresets.ts`: `SceneTheme`, `ScenePalette`, `SCENE_PALETTES`. Two fields were added to the contract: `rimScale` (uRim = rimMin + tint·rimScale) and `tintAmount`. The design spec asks for "uRim ×.7" and "tint·.45" in light, and these fields carry that.
- `app/webgl/LiquidScene.ts`: `theme` constructor option, `setTheme()`, 8 pre-parsed palette colours plus 4 scratch colours, palette-driven rim/base/tint/envMapIntensity/exposure in `update()`. The per-frame `Object.keys(...).forEach` is replaced by a module-level `STATE_KEYS` loop. The satellite material is now held as a field and disposed by that field.
- `app/components/webgl/LiquidCanvas.client.vue`: initial theme comes from `document.documentElement.dataset.theme`, plus `watch(useTheme().theme, t => scene?.setTheme(t))`, plus light variants of the `.webgl::before` glow and the fallback sphere (`:root[data-theme='light'] .webgl…`).

### setTheme contract
```ts
new LiquidScene(canvas, { reducedMotion?: boolean, theme?: 'dark' | 'light' })  // first frame already uses the right palette
scene.setTheme(theme: 'dark' | 'light', instant = false): void
```
- It damps one scalar `themeMix` toward 0 (dark) or 1 (light) with λ=5, about 95% of the way in 0.6 s. It is instant when `instant === true` or `reducedMotion`. Repeating a call with the same value is a no-op.
- It is safe to call at any time, including while the scene is stopped. The value is applied on the next frame.

### Final palettes
| | dark (= previous constants) | light |
|---|---|---|
| rimA ↔ rimB | `#c8ff5a` ↔ `#7b5cff` | `#5f8a00` ↔ `#5a3be0` |
| base / tint | `#ffffff` / `#c8ff5a` | `#f2f2f2` / `#7fb800` |
| rimMin + tint·rimScale | 0.25 + 0.9 | 0.15 + 0.63 |
| tintAmount | 0.35 | 0.45 |
| envMapIntensity blob / satellites | 1.25 / 1.1 | 1.0 / 0.88 |
| toneMappingExposure | 1.05 | 0.95 |

### Second light environment: not built
The cheaper option was chosen: one environment map and a palette cross-fade only. The existing environment is a near-black studio (`#050506`) with bright strips, so most of the chrome body reflects near-black. Against `#f4f3ee` (L≈0.895) that body contrast is far above 3:1. Only the specular strip highlights come close to the background luminance, and those are small and edged by the darker rim. Because of this, the designer's env dip/swap choreography (03 §5, `envMapIntensity` dip and `scene.environment` swap) is **not** implemented: there is nothing to swap. **QA:** verify with the canvas-sample check in 03 §4. If the result is under 3:1, first lower the light `exposure` to 0.85 in `SCENE_PALETTES.light` (a one-line change). The lazy second PMREM env is the fallback after that, per ADR-6.

### Perf notes
- Draw calls are unchanged: 4 (blob plus 3 satellites). Triangles are unchanged: icosahedron detail 48 is about 47k, and the satellites are 3 × about 4.5k.
- No new GPU resources, no new render target, no PMREM pass. GLSL and `customProgramCacheKey` are unchanged, so there is no recompile on toggle (exposure and envMapIntensity are uniforms).
- Per frame the cost rises by 4 `lerpColors` and 6 scalar lerps. Zero allocations. One per-frame allocation was removed (the `Object.keys` array and closure).
- `dispose()` is unchanged in scope: nothing new to free.

### For frontend / QA
- `npm run typecheck`: no errors in WebGL files. Two errors remain from **unmodified** files outside webgl ownership (see the request below).
- No WebGL: the CSS fallback sphere and glow now have light variants keyed on `<html data-theme="light">`, so they need no JS.
- Reviewer: the light selectors use `:root[data-theme='light'] .webgl` rather than `:global(...) .webgl`, because Vue's scoped `:global()` drops the rest of the selector.

### Requests to frontend-developer
- Typecheck fails on files that predate this feature: `app/composables/useSceneSections.ts:37` (`() => requestAnimationFrame(bind)` returns a number) and `app/plugins/motion.client.ts:48` (the hookOnce arrow returns `void | null`). The fix for both is to wrap the arrow body in braces: `() => { requestAnimationFrame(bind) }`.

## Review fixes (loop 1)
- BLOCKER: `ThemeToggle.vue` light-icon rule now `:root[data-theme='light'] .theme__icon` (no more transform on `<html>`); no other `:global(` in non-webgl `.vue` files.
- `pages/projects/[slug].vue`: added `ogTitle`/`ogDescription`.
- `SiteHeader.vue`: `.header__theme` has `position: relative; z-index: 2` (above open mobile menu).
- `ContactModal.vue`: active chip border uses `--accent-ink`.
- Minors: `.page-*` transition is opacity-only 0.35s; ThemeToggle clears the previous `theme-anim` timer; cursor label uses `--on-accent`; `ExpertiseSection` loop var renamed `tab`.
