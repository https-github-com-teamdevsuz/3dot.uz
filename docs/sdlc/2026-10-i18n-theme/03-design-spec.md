# 03 · Design spec — Multilingual (uz/ru/en) + dark/light theme

> Owner: ui-ux-designer (sonnet) · Status: draft · Inputs: 01-requirements.md, main.css, SiteHeader.vue, scenePresets.ts, LiquidScene.ts

Decisions taken (resolves open questions 4, 5, 6, 7, 8): 2-state toggle, system default (dark if no signal), lime keeps as a *fill* and gets a dark "ink" twin for text/rings in light mode, project cover art unchanged in light (gets a 1px `--line` border), switcher shows codes with full names in the accessible name.

## 1. Layout per breakpoint (header only; sections unchanged)

Order in header row: logo · nav · lang · theme · CTA · burger. `gap` 32px (see compaction rule below).

```
>=1440 (88px bar)
┌────────────────────────────────────────────────────────────────────────────────┐
│ 3dot ·····  Xizmatlar  Loyihalar  Jarayon  FAQ  ··  UZ / RU / EN  (◐)  [Loyihani muhokama qilish] │
└────────────────────────────────────────────────────────────────────────────────┘
1024 (88px bar, compact: nav gap 22, header gap 18, CTA padding 0 18, lang pad 6)
┌────────────────────────────────────────────────────────────┐
│ 3dot ·  Nav  Nav  Nav  Nav ·  UZ/RU/EN (◐) [CTA]           │
└────────────────────────────────────────────────────────────┘
768 and 390 (<=900px, 72px bar): nav, lang and CTA hidden in bar
┌──────────────────────────────┐   ┌──────────────────────────────┐
│ 3dot ·········· (◐44) (≡46)  │   │ 01 Xizmatlar                 │
└──────────────────────────────┘   │ 02 Loyihalar        menu     │
                                   │ ...                          │
                                   │ [ UZ ][ RU ][ EN ]  44px     │
                                   │ hello@3dot.uz                │
                                   │ [Loyihani muhokama qilish]   │
                                   └──────────────────────────────┘
```
- At 390 the bar must fit: logo ~100 + toggle 44 + 12 gap + burger 46 + 2x16 gutter = fits with >100px spare.
- Compaction (901–1180px) is mandatory for ru, where nav + CTA are longest. Nav, CTA: `white-space: nowrap`; never wrap.
- Menu footer order (mobile): lang row, email, CTA. Lang row = 3 pills, `display:flex; gap:8px`.

## 2. Language switcher

Form: three inline links in `JetBrains Mono` (`.mono`: 0.8rem, uppercase, 0.04em), wrapped in `<nav aria-label="Til|Язык|Language">`. Separator `/` is `aria-hidden`, colour `--fg-faint`-ish (`--line-strong`).

Markup contract (per link):
`<a href="/ru/…" hreflang="ru" lang="ru" aria-current="true"?>RU<span class="visually-hidden"> — Русский</span></a>` — visible text is contained in the accessible name (WCAG 2.5.3). Names: `UZ — O‘zbekcha`, `RU — Русский`, `EN — English`. Real `href` to the same page in the other locale (hash/slug preserved); client navigation via NuxtLink; storing the choice happens on click.

| State | Desktop | Mobile menu pill |
|---|---|---|
| default | `--fg-dim` | `--fg-dim`, 1px `--line-strong` border, radius 999, min 44x44, padding 0 18 |
| active (`aria-current="true"`) | `--fg`, 1.5px underline in `--accent-ink`, offset 6px | `--fg`, bg `--fg-faint`, border `--fg` |
| hover (pointer only, `@media (hover:hover)`) | colour -> `--fg` 0.3s `--ease-out`; underline scaleX 0 -> 1 from left 0.4s `--ease-out` | none |
| focus-visible | global ring `2px solid var(--accent-ink)`, offset 3px | same |
| active (pressed) | opacity .6 | same |
| cursor | `data-cursor` = native name ("O‘zbekcha" / "Русский" / "English"); the active one has `data-cursor=""` | same |

Tap targets: desktop hit area min-height 32px / width >= 32px (>= 24px WCAG 2.2 AA, spacing via padding 6px 8px); mobile pills min 44x44 with 8px gap.

## 3. Theme toggle

- Placement: desktop header, right of lang, left of CTA. Mobile: in the header bar, left of burger (always visible, not inside the menu, so it works with menu closed).
- Form: 44x44 round button (desktop 40x40), 1px `--line-strong` border (same shape as burger), icon: 20px SVG "contrast disc" (circle outline, right half filled `currentColor`). Light theme = disc rotated 0deg, dark theme = rotated 180deg. No sun/moon artwork (less assets, reads on both themes).
- `data-cursor="Tema|Тема|Theme"`.
- Semantics: `<button type="button">`, `aria-label` states the action (below), **no** `aria-pressed` (avoids double-announcing). A visually-hidden `role="status"` span announces the result.
- Keyboard: Tab-reachable between lang and CTA; Enter/Space toggle; focus stays on the button; Tab order mobile: logo, toggle, burger.
- States: hover bg `--fg-faint`; focus ring as global; active scale .94 (0.2s).

## 4. Light token set

Selector model: `:root` = dark (existing values, plus new tokens), `:root[data-theme='light']` overrides. Add `color-scheme: dark|light` per theme. No-JS fallback = dark.

| Token | Dark (current / new) | Light | Contrast (light, vs `--bg`) |
|---|---|---|---|
| `--bg` | `#050505` | `#f4f3ee` | base, L~0.895 |
| `--bg-rgb` (new, for gradients: `rgb(var(--bg-rgb) / .85)`) | `5 5 5` | `244 243 238` | - |
| `--bg-2` (surface) | `#0d0d0f` | `#eae9e2` | - |
| `--fg` | `#f2f2ee` | `#0d0d0f` | 17.5:1 |
| `--fg-dim` | `rgba(242,242,238,.56)` | `rgba(13,13,15,.62)` | 5.2:1 (5.1 on `--bg-2`) |
| `--fg-faint` | `rgba(242,242,238,.14)` | `rgba(13,13,15,.08)` | decorative |
| `--line` (decorative dividers) | `rgba(242,242,238,.12)` | `rgba(13,13,15,.16)` | decorative |
| `--line-strong` (new: toggle, burger, pills, inputs) | `rgba(242,242,238,.42)` | `rgba(13,13,15,.50)` | 3.7:1 dark / 3.55:1 light (UI >= 3) |
| `--accent` (fills, hover wipe, selection) | `#c8ff5a` | `#c8ff5a` (unchanged) | fill only; vs bg 1.06:1, so never the sole indicator |
| `--accent-ink` (new: accent text, focus ring, eyebrow dot, nav hover text) | `#c8ff5a` | `#4d6b00` | 5.5:1 text, 5.05 on `--bg-2` |
| `--on-accent` (new: text on lime fill) | `#050505` | `#050505` | 16.6:1 on lime |
| `--violet` | `#7b5cff` | `#7b5cff` | 3.9:1: decorative/UI only, never small text |
| `theme-color` meta | `#050505` | `#f4f3ee` | - |

Required replacements (frontend): every `color: var(--accent)` text -> `--accent-ink`; `outline` in `focus-visible` -> `--accent-ink`; `.eyebrow::before` bg+glow -> `--accent-ink` (glow `0 0 16px` only in dark; in light drop shadow); `.btn:hover { color:#000 }` -> `var(--on-accent)`, add `border-color: var(--accent-ink)`; `.btn--solid { color:#000 }` -> `color: var(--bg)`; `::selection` unchanged (lime + `--on-accent`); `rgba(5,5,5,…)` in SiteHeader -> `rgb(var(--bg-rgb) / x)`; `.menu` already `--bg`. `.grain` opacity .07 dark / .05 light. `html`/`body` bg already tokenised.

### WebGL palette (light), canvas stays transparent so `--bg` shows through

Add `interface ThemePalette` selected by `setTheme('dark'|'light', animate)` on `LiquidScene`. Both PMREM environments are built once at init (second one lazily on first light request), both disposed in `dispose()`; no allocation in the loop (colours lerped into pre-allocated `THREE.Color`s).

| Parameter | Dark (current) | Light |
|---|---|---|
| env background | `#050506` | `#7d828d` (~3.5:1 vs light bg, keeps silhouette edge at grazing angles) |
| key strips (5 white softboxes) | `WHITE` x 5 / 3.5 / 2.2 / 1.6 | **dark flags**: `#0a0a0c` x 1 on the same 5 positions, plus one white softbox x 3 at top `[0,5,-1]` so highlights still pop |
| coloured bounce | accent x2.6, violet x2.4 | accent `#8fc400` x1.8, violet x1.6 |
| floor | `#8a90a0` x .35 | `#e4e6ea` x .6 |
| blob `material.color` base | `#ffffff` | `#f2f2f2` |
| tint colour (lerp target by `tint`*.35) | `#c8ff5a` | `#7fb800`, factor `tint*.45` |
| rim colour (`uRimColor`) | accent<->violet | `#5f8a00`<->`#5a3be0`, `uRim` x .7 |
| `envMapIntensity` | 1.25 (body) / 1.1 (satellites) | 1.0 / 0.9 |
| `toneMappingExposure` | 1.05 | 0.95 |
| bloom / glow | none exists; none added | none |
| Target check | - | Playwright canvas sample: blob edge/body luminance vs `#f4f3ee` >= 3:1 (else lower exposure to .85, darken flags) |

## 5. Theme-switch choreography

| Element | Trigger | Property | From -> To | Duration | Easing | Stagger |
|---|---|---|---|---|---|---|
| html (via temp class `theme-anim`, removed after 600ms) | toggle click | `background-color, color, border-color, fill` on `body, header, .menu, .btn, .section, [class*=card]` only (no `*`) | old -> new token | 0.5s | `--ease-out` | none |
| toggle icon | toggle click | rotate | 0 <-> 180deg | 0.5s | `--ease-out` | - |
| blob env | `setTheme(t,true)` | `envMapIntensity` dip, swap `scene.environment` at the dip, return | x -> .35x (0.2s), swap, .35x -> target (0.4s) | 0.6s total | power2.in / `--ease-out` equiv | - |
| blob colours/exposure | same | lerp rim/tint/exposure | old -> new palette | 0.6s | expo.out | - |
| language change | link click | existing `.page-*` route transition, but opacity only (no translateY) | 1 -> 0 -> 1 | 0.35s each way | `--ease-out` | - |
| blob on language change | route change | none (canvas persists, preset continues) | - | - | - | - |

No-flash rule: inline `<head>` script (<1 KB, synchronous, before CSS paint, not deferred), key `localStorage.theme`:
`try{var t=localStorage.getItem('theme');if(t!=='light'&&t!=='dark')t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';document.documentElement.dataset.theme=t}catch(e){document.documentElement.dataset.theme='dark'}`
Also sets `<meta name="theme-color">` (both media-scoped metas as SSR default, JS updates the single active value on toggle). Do not bind `data-theme` through `htmlAttrs`/reactive state during SSR (it would mismatch); the app reads the attribute on mount. WebGL scene reads the attribute at construction (`new LiquidScene(…, theme)`) so the first frame has the right palette. Without stored choice, a `matchMedia` change listener updates live; with a stored choice it is ignored. Preloader/background colours must use `var(--bg)`.

## 6. Typography for ru / en

Fonts: Unbounded, Manrope and JetBrains Mono all ship Cyrillic; confirm `css2` request returns the `cyrillic` unicode-range faces and `display=swap` fallback metrics (CLS <= .1) on `/ru/`.

Cyrillic runs ~1.25–1.35x longer than the same English, ~1.1x vs Uzbek. Token overrides (placed in main.css, no new token names):

```
html:lang(ru) { --fs-hero: clamp(2.8rem, 11vw, 12.5rem); --fs-h1: clamp(1.9rem, 6vw, 6.4rem);
                --fs-h2: clamp(1.7rem, 3.8vw, 4rem);     --fs-lead: clamp(1.15rem, 2.3vw, 2.3rem); }
html:lang(en), html:lang(uz) { unchanged }
```
Rule of thumb: at 390 (358px content) a 14-letter Cyrillic Unbounded word needs font-size <= ~32px; do not go above that for h1/h2 minimums.

Rules:
1. Headings `text-wrap: balance`; `.lead` and paragraphs `text-wrap: pretty`; body max-width 62ch.
2. Body copy and cards: `hyphens: auto; overflow-wrap: break-word` (works because `<html lang>` is set per locale). Display headings: `hyphens: manual`, never auto-hyphenate; instead use the smaller clamp above.
3. `data-split`: `.split-word` currently `white-space: pre` + inline-block, so a long word cannot break and will overflow. Changes: emit the space between words as a plain text node outside the inline-block; inside `html:lang(ru) [data-split]` use `.split-word { white-space: normal; overflow-wrap: anywhere }` as last-resort break. Split only after `document.fonts.ready`, re-split on width change (debounced 150ms) and always `revert()` the old split before re-splitting when the locale/route changes, so line measurements are for the final font.
4. Cyrillic descenders (у, д, р, ц, щ) get clipped by `.split-line { overflow:hidden }`: in ru use `padding-bottom: .14em; margin-bottom: -.14em`, and `.display { line-height: .98 }` (0.92 stays for uz/en).
5. Header nav, CTA, lang, mono labels: `white-space: nowrap`; mono uppercase labels in ru keep letter-spacing .04em. No ellipsis truncation of copy.
6. Verify no `scrollWidth > innerWidth` at 390 and 1440 on `/ru/`.

## 7. Interaction states (summary)

Existing: `.btn` hover wipe lime with `--on-accent` text; light mode adds `border-color: var(--accent-ink)` since lime vs bg is 1.06:1. Header link hover: second line uses `--accent-ink` text. Burger/toggle/pills share one style (46/44px, `--line-strong`). Disabled: n/a (no disabled controls added). Focus: single global ring `2px solid var(--accent-ink)` offset 3px, tested on both `--bg` and `--bg-2`.

## 8. Reduced motion / no-WebGL

- `prefers-reduced-motion: reduce`: no `theme-anim` class (instant colours), icon rotation instant (existing global 0.001ms rule covers CSS), `setTheme(t,false)` applies palette and env swap in one frame, route transition instant. Blob behaves as today in both themes.
- No WebGL: CSS-only fallback unchanged; ensure fallback gradient/poster uses `var(--bg)`/`var(--bg-2)` and a light-theme variant (accent-ink at .25 opacity radial) so light page is not empty.
- No JS: dark theme, uz at `/`, language links are plain anchors and still work.

## 9. Contrast check (all pairs >= thresholds)

| Pair | Ratio | Need |
|---|---|---|
| dark: `--fg` / `--bg` | ~18:1 | 4.5 |
| dark: `--fg-dim` / `--bg` | 5.9:1 | 4.5 |
| dark: `--accent-ink` / `--bg` | 17.4:1 | 4.5 |
| dark: `--line-strong` / `--bg` | 3.7:1 | 3 (UI) |
| light: `--fg` / `--bg` | 17.5:1 | 4.5 |
| light: `--fg-dim` / `--bg`, `--bg-2` | 5.2 / 5.1:1 | 4.5 |
| light: `--accent-ink` / `--bg`, `--bg-2` | 5.5 / 5.05:1 | 4.5 (text) and 3 (ring, dot) |
| light: `--on-accent` / lime fill | 16.6:1 | 4.5 |
| light: `--bg` / `--fg` (btn--solid) | 17.5:1 | 4.5 |
| light: `--line-strong` / `--bg` | 3.55:1 | 3 (UI) |
| light: `--violet` / `--bg` | 3.9:1 | 3 (non-text only) |
| light: lime `--accent` as sole indicator | 1.06:1 | forbidden; always paired with ink text/border |
Ratios are hand-computed from sRGB luminance; qa-engineer to re-verify with axe in both themes.

## 10. Accessibility checklist

- [ ] `<html lang>` = active locale (server and client); switcher links carry `lang` + `hreflang`; active has `aria-current="true"`.
- [ ] Switcher is a labelled `<nav>`; accessible name contains the visible code.
- [ ] Toggle is a `<button>` with action label, `role="status"` result announcement; reachable by Tab, Enter/Space.
- [ ] Focus ring visible on both themes, never removed; Tab order: logo, nav, lang, toggle, CTA (desktop); logo, toggle, burger, then menu contents (mobile).
- [ ] Mobile menu keeps Lenis stop/scroll-lock; Escape closes (verify existing), focus returns to burger.
- [ ] Tap targets >= 44px on mobile, >= 24px desktop.
- [ ] Contrast table above met in both themes; no information by colour alone (active language also underlined/filled).
- [ ] `color-scheme` set; `theme-color` matches `--bg`.
- [ ] Reduced motion = zero-duration transitions; no auto-redirect surprises (redirect once, only from stored choice).
- [ ] No text in images; ru headings do not overflow at 390/1440.

## 11. Copy (UI labels)

| Key | uz (Latn) | ru | en |
|---|---|---|---|
| lang.nav | Til | Язык | Language |
| lang.uz / ru / en (hidden name) | O‘zbekcha / Русский / English | O‘zbekcha / Русский / English | O‘zbekcha / Русский / English |
| theme.toLight | Yorug‘ rejimga o‘tish | Включить светлую тему | Switch to light theme |
| theme.toDark | Qorong‘i rejimga o‘tish | Включить тёмную тему | Switch to dark theme |
| theme.nowLight | Yorug‘ rejim yoqildi | Светлая тема включена | Light theme on |
| theme.nowDark | Qorong‘i rejim yoqildi | Тёмная тема включена | Dark theme on |
| theme.cursor | Tema | Тема | Theme |
| menu.open | Menyuni ochish | Открыть меню | Open menu |
| menu.close | Menyuni yopish | Закрыть меню | Close menu |
| nav.aria | Asosiy menyu | Главное меню | Main menu |
| logo.aria | 3dot — bosh sahifa | 3dot — на главную | 3dot — home |
| cta | Loyihani muhokama qilish | Обсудить проект | Discuss a project |

WebGL presets: no new `data-scene` is introduced; existing presets in `scenePresets.ts` are reused unchanged in both themes (only the palette in section 4 differs).
