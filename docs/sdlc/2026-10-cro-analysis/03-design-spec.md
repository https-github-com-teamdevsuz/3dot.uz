# 03 · Design spec — CRO: from showcase to lead machine

> Owner: ui-ux-designer (sonnet) · Status: draft · Inputs: 00-strategy.md, 01-requirements.md, CLAUDE.md, main.css, HeroSection / ServicesGrid / ProjectsSection / ProcessSection / FaqSection / ContactSection / ContactModal / SiteHeader / `projects/[slug].vue`, 2026-10-i18n-theme/03-design-spec.md (conventions reused: `--accent-ink`, `--line-strong`, `--on-accent`, `--bg-rgb`, ru clamps, `hyphens`/`text-wrap` rules).

## 0. Decisions and flags

1. **Consent checkbox stays** (task instruction overrides `01-requirements.md` US-4 and `00-strategy.md` P2-9, which describe replacing it with a text line). The checkbox remains `required`, unchecked on every open. Product-analyst should correct US-4 wording; QA tests `required` + unchecked-by-default, not "removed".
2. **No analytics.** US-15 is dropped: no `cta_click` / `lead_submit` / `telegram_click` helper, no `place` prop. Test hooks use `data-cta="hero|section|header|contact"` attributes only.
3. **No new `data-scene`.** Section CTAs live inside existing scenes; the CTA on project pages sits between `intro` and `contact` scenes with no `data-scene` of its own. `stats` and `expertise` presets are removed (webgl-engineer, per US-10).
4. **One new token** (unavoidable): `--danger` for the error state (dark `#ff8a7a`, light `#b3261e`). Everything else uses existing tokens or component-local clamps.
5. **Hero stays** a `100svh` stage with the blob; the H1 drops from `--fs-hero` (a three-word slogan size) to `--fs-h1` because a full sentence does not fit at hero size (see 1.3).
6. **Marquee:** nothing replaces it. Intro keeps its own `.section` top padding (96–200px).

## 1. Hero

### 1.1 Layout per breakpoint

```
>=1440  (header 88px · hero min-height 100svh · container, 48px gutter)
┌──────────────────────────────────────────────────────────────────────────┐
│ ● raqamli yechimlar — Toshkent                                            │ eyebrow (kept)
│                                                                          │
│ Excel o‘rniga —                                      ~100px, --fs-h1     │
│          yagona tizim.        (outlined, padding-left 18%)               │
│                                                                          │
│ 20+ ishga tushirilgan tizim   5 yil tajriba     Savdo, ombor va hujjat-  │
│ (hero facts, left)            (hero facts)      lar uchun CRM va ERP...  │ lead, max 44ch, col 8–12
│                                                 [ Bepul audit olish → ]  │ btn--solid 56px
│                                                 Telegramda yozish ↗      │ text link
└──────────────────────────────────────────────────────────────────────────┘
1024   same grid; H1 7vw=72px; facts left, lead+CTA right (max 400px)
768    ≤900 breakpoint: single column. Order: eyebrow, H1 (54px), lead, CTA row, facts
┌──────────────────────────────┐
│ ● raqamli yechimlar — Toshkent│
│ Excel o‘rniga —               │
│    yagona tizim.              │
│ Savdo, ombor va hujjatlar     │
│ uchun CRM va ERP. ...         │
│ [ Bepul audit olish → ]  Telegramda yozish ↗   (row: button auto width, link beside, gap 24)
│ 20+ tizim · 5 yil             │
└──────────────────────────────┘
390  (358px content) — both CTAs above the fold (calc: 110 pad + 20 eyebrow + ~150 H1 + ~100 lead + 56 + 8 + 44 + 24 ≈ 520px of 844)
┌────────────────────────┐
│ ● raqamli yechimlar —   │
│   Toshkent              │
│ Excel                   │  H1 38px (2.4rem), wraps freely, text-wrap: balance
│ o‘rniga —               │
│    yagona               │  outline line, no left padding at ≤560
│    tizim.               │
│ Savdo, ombor va         │  lead 1rem, --fg
│ hujjatlar uchun ...     │
│ [ Bepul audit olish → ] │  full width, 56px
│   Telegramda yozish ↗   │  link, min-height 44, centered
│ 20+ tizim    5 yil      │  facts, 2 cols
└────────────────────────┘
```

Removed from the DOM: `.hero__index` (`ui.hero.index`), `.hero__scroll` and `.hero__scroll-dot` (`ui.hero.scroll`, including the `scroll-dot` keyframes), `.hero__awards` fed from `stats.awards`. Eyebrow `role — city` stays (it anchors locale/geo in one line and costs nothing).

### 1.2 Content

| Element | uz | ru | en |
|---|---|---|---|
| H1 `tagline` (2 lines) | `Excel o‘rniga —` / `yagona tizim.` | `Вместо Excel —` / `единая система.` | `One system` / `instead of Excel.` |
| Lead | Savdo, ombor va hujjatlar uchun CRM va ERP. Jarayonlaringizni bepul tahlil qilib, nimani avtomatlashtirish foyda berishini ko‘rsatamiz. | CRM и ERP для продаж, склада и документов. Бесплатно разберём ваши процессы и покажем, что выгодно автоматизировать. | CRM and ERP for sales, stock and documents. We review your processes for free and show what is worth automating. |
| Primary CTA | Bepul audit olish → | Бесплатный аудит → | Get a free audit → |
| Secondary link | Telegramda yozish ↗ | Написать в Telegram ↗ | Message on Telegram ↗ |
| Facts (PLACEHOLDER, one source in `site.ts`) | `20+` ishga tushirilgan tizim · `5` yil tajriba | `20+` запущенных систем · `5` лет опыта | `20+` systems shipped · `5` years |

**Max H1 length (contract for linguist and frontend):** total ≤ 28 chars (uz/en), ≤ 32 chars (ru); exactly 2 lines in `tagline`; longest single word ≤ 12 chars (ru) / 10 (uz, en). At 390 each line may wrap (max 4 rendered lines). Cyrillic Unbounded ≈ 0.8em per glyph, so a 12-letter word at 30px (`html:lang(ru) --fs-h1` min 1.9rem) = 288px < 358px. Playwright: `scrollWidth <= innerWidth` on `/`, `/ru/`, `/en/` at 390 and 1440.

### 1.3 Type and tokens

| Element | Token / value |
|---|---|
| H1 | `.display`, `font-size: var(--fs-h1)` (ru uses the existing `html:lang(ru)` clamp); `text-wrap: balance`; line 0 solid `--fg`; line 1 outlined (`-webkit-text-stroke: 1.5px var(--fg)`, `color: transparent`), `padding-left: 18%` (ru `8%`, ≤560px `0`). Reason it is not `--fs-hero`: "Excel o‘rniga —" is 15 chars (about 15 x 0.75em), which only fits up to `--fs-h1` (7vw -> 100px at 1440). |
| Lead | `--fs-body`, `color: var(--fg)` (not dim: it carries the offer), `max-width: 44ch`, `text-wrap: pretty` |
| Primary CTA | `.btn.btn--solid`, 56px height, `padding: 0 28px`, arrow `aria-hidden` |
| Secondary link | `<a>` styled as text link: Manrope 600, `--fs-body`, `border-bottom: 1px solid var(--line-strong)`, `padding-block: 12px` (hit area 44px), `↗` aria-hidden, `target="_blank" rel="noopener"` + visually-hidden "(yangi oynada ochiladi)" |
| Facts | number `.display`-family (Unbounded) 1.6rem (existing `hero__awards strong` size, no new token), label `.mono.dim` |

Why a text link, not a second button: two pills compete; the strategy wants the audit as the single conversion and Telegram as the quiet fast channel. It still meets 24px target size (44px hit area).

Spacing: `.hero__cta` grid `gap: 20px` (lead -> CTA row); CTA row `display:flex; align-items:center; gap: 24px; flex-wrap: wrap`; ≤560 `flex-direction: column; align-items: stretch; gap: 8px`, button `width:100%`, link `justify-content:center`.

Hero bottom grid: `grid-template-columns: 1fr auto 1fr` becomes `1fr 1fr` (facts left, lead+CTA right, `max-width: 440px`); ≤900 `1fr`.

### 1.4 Placeholder numbers (hero facts)

Rendered normally in production so the page does not look unfinished. Source in `site.ts` carries `// PLACEHOLDER (owner to confirm)`. Rendered with `data-placeholder` on the number. Style, **only** when `<html data-show-placeholders>` is set (dev server and preview builds via `NUXT_PUBLIC_SHOW_PLACEHOLDERS=1`): `outline: 1px dashed var(--violet); outline-offset: 4px;` plus `title="PLACEHOLDER (owner to confirm)"`. The marker string is internal, not localised, and absent from production DOM. Release gate: devops greps `data-placeholder` count and lists it as a go-live blocker until the owner confirms. Only this one set of numbers exists on the page (no Stats section, no `50+` on the projects track).

## 2. `SectionCta` (reusable, `app/components/ui/SectionCta.vue`)

Props: `text: string` (one line), `variant?: 'bar' | 'card'` (default `bar`). Label always `t.ui.cta.audit`. Emits nothing; click calls `useContactModal().show`. Root `data-cta="section"`.

Anatomy (`bar`): glass panel, so text stays legible when the blob passes behind it.

```
>=901  container (gutter 48)
┌────────────────────────────────────────────────────────────────────┐
│  Birinchi qadam bepul: jarayonlaringizni       [ Bepul audit olish → ] │
│  1–2 kunda tahlil qilamiz.                                          │
└────────────────────────────────────────────────────────────────────┘
≤900
┌──────────────────────────┐
│ Birinchi qadam bepul:     │
│ jarayonlaringizni ...     │
│ [ Bepul audit olish → ]   │  full width at ≤560
└──────────────────────────┘
card variant (Projects track end, replaces `.projects__all`)
┌───────────────┐   desktop: width clamp(260px, 26vw, 420px), padding-left 48, border-left 1px --line, same as old .projects__all
│ Jarayoningiz  │   mobile: full width, border-top 1px --line, padding 32px 0 0 (no glass, no panel padding)
│ ham shunday…  │
│ [ Bepul … → ] │
└───────────────┘
```

| Property | Value |
|---|---|
| Panel | `background: rgb(var(--bg-rgb) / 0.72); backdrop-filter: blur(14px); border: 1px solid var(--line); border-radius: var(--radius); padding: clamp(24px, 3vw, 40px)` |
| Layout | `display:flex; justify-content: space-between; align-items:center; gap: 32px`; ≤900 `flex-direction: column; align-items: flex-start; gap: 24px`; ≤560 button `width:100%` |
| Text | Unbounded 300, `font-size: var(--fs-h3)`, `line-height: 1.18`, `letter-spacing: -0.02em`, `max-width: 28ch`, `text-wrap: balance`, `color: var(--fg)` |
| Button | `.btn.btn--solid`, `data-cursor="Audit"` (`t.ui.cta.cursor`) |
| Spacing | margin-top `clamp(48px, 8vh, 96px)` from the section content; bottom padding is the section's own |
| Alignment | left text, right button; never centred (contact is the only centred block) |

Placement:
- **Projects** (`card` variant): last child of `.projects__track`, replacing `.projects__all`. Stays the last interactive element in `#projects`. Desktop: pinned horizontal scroll ends on this card, nothing breaks in `distance()`. Mobile: end of the vertical list.
- **Process**: `bar`, after `.process__grid` inside the section's container (not inside the sticky column).
- **FAQ/pricing** (`#pricing`): `bar`, after `.faq__grid`.
- **Project detail**: `bar`, in its own `<div class="container">` between `.case__body` and `.case__next`.

Copy per place: see table 8.

Motion: see section 9 row "SectionCta". Reduced motion: element is statically visible; no opacity/transform from-state is ever applied (verify that `useReveal` skips under `prefers-reduced-motion`; if it does not, guard inside the composable).

## 3. Services (4 blocks)

Data shape per item: `{ title, outcome, bullets: [2..3] }`. Nothing else on the card: no index number, no icon, no price, no link, no CTA. Below the grid one line "shuningdek" (not a card).

```
>=1280 (4 cols)               561–1279 (2 cols)         ≤560 (1 col)
┌────┬────┬────┬────┐         ┌──────┬──────┐           ┌────────────┐
│ CRM│ERP │Hujj│Inte│         │ CRM  │ ERP  │           │ CRM        │
│ …  │ …  │ …  │ …  │         ├──────┼──────┤           ├────────────┤
└────┴────┴────┴────┘         │ Hujj │ Integ│           │ …          │
shuningdek: veb, mobil, BI    └──────┴──────┘           └────────────┘
```

Card (`.services__item`, keeps existing glass: `background: rgb(var(--bg-rgb) / 0.55); backdrop-filter: blur(14px)`, hairline grid borders):
1. **Name** `h3`: Unbounded 400, component-local `font-size: clamp(1.1rem, 1.55vw, 1.6rem)` (a 15-letter Cyrillic word must fit 4 cols at 1280: 15 x 0.8 x 19.8 = 238px < 243px), `letter-spacing: -0.03em`, `hyphens: auto; overflow-wrap: anywhere` (last-resort break).
2. **Outcome** `p`: `--fs-body`, `color: var(--fg)`, `margin-top: 12px`, max 2 lines.
3. **Bullets** `ul`: `margin-top: 20px; padding-top: 20px; border-top: 1px solid var(--line)`, `display:grid; gap: 8px`, `font-size: 0.9rem`, `color: var(--fg-dim)`; each `li` has a 5px circle `--accent-ink` marker (`::before`, `margin-right: 10px`).

Box: `padding: 28px` (≤560: 24px), `min-height: clamp(260px, 20vw, 340px)` replacing `22vw` (equal heights from grid stretch), `align-content: start`. Header `margin-left: 33%` unchanged (≤1100: 0). Breakpoints change from 1100/560 to **1280 / 561 / 560**.

Interaction: cards are not links. Remove the `::after` lime wipe (false affordance); keep only the `0.5s` background shift on `@media (hover:hover)`. No `data-cursor`.

"Shuningdek" line: `<p class="services__also">` `margin-top: 32px`, `.mono.dim` label "shuningdek" + body text "veb-saytlar, mobil ilovalar, BI hisobotlar" (`--fg`), left aligned with the grid.

Reveal: existing `data-reveal` with stagger `i * 0.06` (4 items; the old `i % 4`).

## 4. Contact modal

Panel stays a right-side drawer (`min(720px, 100%)`), `--bg-2`, existing slide-in. Changes below.

```
┌──────────────────────────────────────┐        390
│                                  (×) │        panel 100% x 100dvh, padding 28
│ Bepul auditga                         │        title: h2, max-width 14ch, mb 16 (padding-right 56 at ≤560 to clear ×)
│ yoziling                              │
│ 1 ish kuni ichida bog‘lanamiz.        │        note: .dim 1rem, mb 32
│ Majburiyat yo‘q.                      │
│                                      │
│ ISM                                   │        label .mono.dim
│ ______________________________        │
│ TELEGRAM YOKI TELEFON                 │
│ @username yoki +998 90 123 45 67      │        placeholder is a hint, never the label
│ ______________________________        │
│ TAXMINIY BYUDJET (IXTIYORIY)          │
│ ( $3k gacha )( $3–10k )( … )          │        chips: toggle buttons, none selected
│ XABAR (IXTIYORIY)                     │
│ ______________________________        │
│ [ ] Shaxsiy ma‘lumotlarimni           │        checkbox 24px, row min-height 44
│     qayta ishlashga roziman           │
│ [ Auditga yozilish ]                  │        btn--solid; ≤560 full width
└──────────────────────────────────────┘
```

Field order and rules:
- **Ism**: `required`, `autocomplete="name"`.
- **Telegram yoki telefon**: `required`, `autocomplete="off"`, `autocapitalize="off"`, `spellcheck="false"`, `inputmode="text"`.
- Required fields carry no asterisk; the two optional ones are labelled "(ixtiyoriy)" (WCAG 3.3.2). Form uses `novalidate` plus custom inline validation (below) so errors are announced consistently across browsers.
- **Budget chips**: `<div role="group" aria-labelledby>` of `<button type="button" aria-pressed>`; single-select, pressing the pressed chip clears it. State on open and after reopen: none pressed (`aria-pressed="false"` x 5). Chip: `min-height: 44px`, `padding: 10px 18px`, pressed = `background: var(--accent)`, `color: var(--on-accent)`, `border-color: var(--accent-ink)` plus a leading `✓` (aria-hidden) so it is never colour-only. Toggle buttons instead of radios, because a radio cannot be un-chosen by keyboard.
- **Message**: `textarea rows=3`, optional.
- **Consent**: `<label class="agree">` with native `required` checkbox, 24x24 (`accent-color: var(--accent-ink)`), row `min-height: 44px`, text `--fg-dim` at `--fs-small` (0.8rem, not uppercase), max 46ch. Unchecked on every open.
- **Submit**: `.btn.btn--solid`, `min-width: 220px` fixed so label swaps do not shift layout.

### 4.1 Honeypot (a11y-correct)

```html
<div class="hp" aria-hidden="true">
  <label>Veb-sayt <input type="text" name="website" tabindex="-1" autocomplete="off" /></label>
</div>
```
`.hp { position:absolute; left:-10000px; top:auto; width:1px; height:1px; overflow:hidden; }` Not `display:none` or `visibility:hidden` (many bots skip those fields), not `type=hidden`. `tabindex="-1"` keeps it out of the tab order and satisfies axe `aria-hidden-focus`. Name is a decoy (`website`); payload key stays `hp`. Screen readers never reach it. Non-empty -> client skips the network and shows success (as US-3).

### 4.2 States

| State | Trigger | Visual | ARIA / focus |
|---|---|---|---|
| idle | open | form above; consent unchecked; no chip pressed | `role=dialog aria-modal aria-labelledby=modal-title`; initial focus on Ism; `#__nuxt` gets `inert` while open (focus trap); on close focus returns to the element that opened it |
| invalid | submit with empty name / contact / unchecked consent | per-field message under the field: `--danger`, 0.85rem, leading `!` glyph; field border-bottom `--danger`; focus moves to first invalid field | `aria-invalid="true"`, `aria-describedby="<id>-err"`, error `<p id>` (no extra live region; focus move announces) |
| sending | valid submit | label becomes `Yuborilmoqda` + three 6px dots pulsing; inputs `readonly`; button `aria-disabled="true"` and `opacity .6` (not `disabled`, so focus stays on it); extra clicks ignored | `<form aria-busy="true">` |
| success | 2xx or honeypot hit | form swaps to done view: h2, text, `.btn` "Telegramda yozish ↗" (secondary, outline). Crossfade 0.35s | wrapper `aria-live="polite"`, h2 `tabindex="-1"` focused programmatically; Escape closes |
| error | non-2xx, network error, 10 s timeout, demo/unset endpoint | form stays filled; bordered box above the submit button: `border: 1px solid var(--danger)`, `padding: 16px`, `border-radius: 14px`, text + link; submit label becomes "Qayta yuborish" and re-enables | box `role="alert"`; focus stays on submit; `scrollIntoView({block:'nearest'})` |
| throttled | second submit within 30 s | same box style, neutral border `--line-strong` | `role="status"` |

Error copy (uz): "Yuborib bo‘lmadi. Ma‘lumotlaringiz saqlanib turibdi — qayta urinib ko‘ring yoki Telegramda yozing." + link `Telegramda yozish ↗` (`telegram`, `target=_blank rel=noopener`, underlined, `--fg`). The link is always present in the error box (US-2).

Success copy (uz): title "So‘rovingiz qabul qilindi", text "1 ish kuni ichida bog‘lanamiz. Shoshilinch bo‘lsa — Telegramda yozing."

Mobile: panel `width:100%`, `padding: 28px`, close button 48px stays top right, form `gap: 22px`.

## 5. Trust signals

### 5.1 NDA badge

Shown on every project with `nda: true` (all six demo projects until the owner supplies real work). No client name or logo anywhere.

| Place | Form |
|---|---|
| Project card (`.project-card__media`) | overlay `top:14px; left:14px`; pill: `.mono`, `padding: 6px 12px`, `border: 1px solid var(--line-strong)`, `border-radius: 999px`, `background: rgb(var(--bg-rgb) / 0.85)`, `backdrop-filter: blur(8px)`, `color: var(--fg)`, 12px lock SVG (aria-hidden) + text "NDA"; accessible name via visually-hidden "Mijoz nomi NDA ostida" |
| Detail page hero | same pill, long label "Mijoz nomi NDA ostida", placed under the eyebrow (`margin-top: 12px`, `justify-self: start`), `data-reveal` |
| Detail facts (`dl`) | no extra row |

The card's existing result chips (`−70% qog‘oz`) stay below the image. No hover change on the badge.

### 5.2 Marquee and removed signals
Intro marquee is deleted; no replacement, no spacer (Intro's own `.section` padding provides the rhythm: hero bottom 36px + intro top 96–200px). Client strip, Stats and Expertise sections are removed. `projects__all` (the `50+` number) is replaced by the `card` SectionCta.

## 6. Pricing anchor

Pricing block is `#pricing` (FAQ left column). Rows:

| Row | dt | dd |
|---|---|---|
| 1 | Jarayonlar auditi va konsultatsiya | `bepul` (existing `.display`, `clamp(2rem, 4vw, 3.4rem)`) + inline chip `1–2 kun` (`.mono`, `border: 1px solid var(--line-strong)`, `padding: 4px 10px`, `border-radius: 999px`, `vertical-align: middle`, margin-left 12px) |
| 2 | Loyiha narxi | `<span class="price__num display">$1 500</span> <span class="price__from">dan boshlab</span>` |

Typography for the anchor: the amount uses the existing `dd.display` size; the qualifier `.price__from` is Unbounded 300, `font-size: var(--fs-h3)`, `color: var(--fg-dim)`, baseline-aligned, `margin-left: 0.4em`; the whole `dd` is `display:flex; flex-wrap: wrap; align-items: baseline; column-gap: 0.4em` so on 390 the qualifier wraps under the amount instead of shrinking. Position of the qualifier follows locale grammar: uz suffix (`$1 500 dan boshlab`), ru and en prefix (`от $1 500`, `from $1 500`), so the copy object is `{ prefix?, amount, suffix? }`. `white-space: nowrap` on the amount. Under row 2 a note `.dim` `--fs-small`-size: "Aniq narx audit natijasidan keyin aytiladi." Amount is PLACEHOLDER (`data-placeholder`, section 1.4). Below the pricing rows nothing else; the SectionCta bar follows the whole FAQ grid.

## 7. Navigation and anchors

Order everywhere (header, burger menu, `SiteHeader` `t.site.nav`): `Xizmatlar #services` · `Loyihalar #projects` · `Narxlar #pricing` · `Aloqa #contact`. Add `id="pricing"` on the FAQ `<section>` (`<section id="pricing" class="faq section" data-scene="faq">`). Menu numbering becomes 01–04. "Kompaniya" (`#intro`) is gone. Header CTA label is `t.ui.cta.audit`; ru/en are no longer than the old label, so the 901–1180px compaction from the i18n spec still holds. Mobile menu footer order stays: lang row, email, CTA. `scroll-margin` identical to other sections (Lenis `$scrollTo` handles the offset).

Contact section: title uses `--fs-h2` (not `--fs-h1`), `max-width: 22ch`, `text-wrap: balance` because the new sentence is ~60 chars. Recommended shortening (linguist to confirm): "Vaqt qayerda yo‘qolayotganini bepul ko‘rsatamiz". The circle button label is "Bepul audit"; circle width `clamp(160px, 14vw, 200px)`, font-size 1rem in ru so "Бесплатный" fits.

## 8. Microcopy (uz-Latn · ru · en)

Keys are proposals under `ui.*`; linguist finalises ru/en.

| Key | uz | ru | en |
|---|---|---|---|
| `cta.audit` (header, hero, SectionCta, project) | Bepul audit olish | Бесплатный аудит | Get a free audit |
| `cta.short` (contact circle) | Bepul audit | Бесплатный аудит | Free audit |
| `cta.telegram` | Telegramda yozish | Написать в Telegram | Message on Telegram |
| `cta.newTab` (sr-only) | yangi oynada ochiladi | откроется в новой вкладке | opens in a new tab |
| `cta.cursor` (`data-cursor`) | Audit | Аудит | Audit |
| `sectionCta.projects` | Jarayoningiz ham shunday tartibga tushishi mumkin. | Ваши процессы тоже можно привести в порядок. | Your processes can be this tidy too. |
| `sectionCta.process` | Birinchi qadam bepul: jarayonlaringizni 1–2 kunda tahlil qilamiz. | Первый шаг бесплатный: разберём ваши процессы за 1–2 дня. | The first step is free: we review your processes in 1–2 days. |
| `sectionCta.faq` | Savolingiz qoldimi? Auditda aniq javob beramiz. | Остались вопросы? Ответим на аудите. | Still have questions? We answer them in the audit. |
| `sectionCta.project` | Sizga ham shunday tizim kerakmi? | Нужна такая же система? | Need a system like this? |
| `modal.title` | Bepul auditga yoziling | Запишитесь на бесплатный аудит | Book your free audit |
| `modal.note` | 1 ish kuni ichida bog‘lanamiz. Majburiyat yo‘q. | Свяжемся в течение 1 рабочего дня. Без обязательств. | We reply within 1 business day. No obligation. |
| `modal.name` | Ism | Имя | Name |
| `modal.contact` | Telegram yoki telefon | Telegram или телефон | Telegram or phone |
| `modal.contactPh` | @username yoki +998 90 123 45 67 | @username или +998 90 123 45 67 | @username or +998 90 123 45 67 |
| `modal.budget` | Taxminiy byudjet (ixtiyoriy) | Ориентировочный бюджет (необязательно) | Rough budget (optional) |
| `modal.message` | Xabar (ixtiyoriy) | Сообщение (необязательно) | Message (optional) |
| `modal.consent` (checkbox, existing value kept) | Shaxsiy ma‘lumotlarimni qayta ishlashga roziman | Согласен(на) на обработку персональных данных | I agree to the processing of my personal data |
| `modal.send` | Auditga yozilish | Записаться на аудит | Book the audit |
| `modal.sending` | Yuborilmoqda | Отправляем | Sending |
| `modal.retry` | Qayta yuborish | Отправить ещё раз | Send again |
| `modal.errName` | Ismingizni yozing | Укажите имя | Enter your name |
| `modal.errContact` | Telegram yoki telefon raqamingizni yozing | Укажите Telegram или телефон | Enter your Telegram or phone |
| `modal.errConsent` | Rozilikni belgilang | Подтвердите согласие | Please tick the consent box |
| `modal.errSend` | Yuborib bo‘lmadi. Ma‘lumotlaringiz saqlanib turibdi — qayta urinib ko‘ring yoki Telegramda yozing. | Не удалось отправить. Данные сохранены — повторите попытку или напишите в Telegram. | Could not send. Your details are kept — try again or message us on Telegram. |
| `modal.errThrottle` | Iltimos, 30 soniya kutib, qayta yuboring. | Подождите 30 секунд и отправьте снова. | Please wait 30 seconds and send again. |
| `modal.doneTitle` | So‘rovingiz qabul qilindi | Заявка принята | Request received |
| `modal.doneText` | 1 ish kuni ichida bog‘lanamiz. Shoshilinch bo‘lsa — Telegramda yozing. | Свяжемся в течение 1 рабочего дня. Срочно — пишите в Telegram. | We reply within 1 business day. In a hurry? Message us on Telegram. |
| `nda.short` (card) | NDA | NDA | NDA |
| `nda.long` (card sr-only, detail) | Mijoz nomi NDA ostida | Название клиента под NDA | Client name under NDA |
| `hero.facts.systems` | ishga tushirilgan tizim | запущенных систем | systems shipped |
| `hero.facts.years` | yil tajriba | лет опыта | years of experience |
| `services.title` | Qaysi jarayonni tartibga solamiz? | Какой процесс наведём в порядок? | Which process do we put in order? |
| `services.also` | shuningdek: veb-saytlar, mobil ilovalar, BI hisobotlar | также: веб-сайты, мобильные приложения, BI-отчёты | also: websites, mobile apps, BI reports |
| `pricing.fromNote` | Aniq narx audit natijasidan keyin aytiladi. | Точная цена — после аудита. | The exact price follows the audit. |
| `pricing.audit` (chip) | 1–2 kun | 1–2 дня | 1–2 days |
| `placeholder.mark` | internal only, not localised, not in production DOM: `PLACEHOLDER (owner to confirm)` | — | — |
| `nav` | Xizmatlar · Loyihalar · Narxlar · Aloqa | Услуги · Проекты · Цены · Контакты | Services · Work · Pricing · Contact |

Service blocks (uz source; ru/en name + outcome, bullets by linguist):

| # | uz name | uz outcome | uz bullets | ru name / outcome | en name / outcome |
|---|---|---|---|---|---|
| 1 | CRM | Mijozlar va savdo Excel o‘rniga bitta oynada. | Voronka va vazifalar · Telegram va telefoniya ulanishi · Rahbar uchun hisobotlar | CRM / Клиенты и продажи в одном окне вместо Excel. | CRM / Customers and sales in one window instead of Excel. |
| 2 | ERP va ombor | Qoldiq, xarid va buyurtmalar real vaqtda. | Ombor va qoldiqlar · Xarid va yetkazib berish · 1C bilan almashinuv | ERP и склад / Остатки, закупки и заказы в реальном времени. | ERP and stock / Stock, purchasing and orders in real time. |
| 3 | Hujjat aylanishi | Qog‘oz o‘rniga elektron kelishuv va nazorat. | Kelishuv marshrutlari · Ijro muddatlari nazorati · Arxiv va qidiruv | Документооборот / Электронное согласование и контроль вместо бумаги. | Document flow / Digital approvals and tracking instead of paper. |
| 4 | Integratsiya | Tizimlar bir-biri bilan o‘zi gaplashadi. | 1C, Payme, Click, Telegram · Qo‘lda kiritishni yo‘qotish · API va hisobotlar | Интеграции / Системы обмениваются данными сами. | Integrations / Your systems talk to each other. |

SectionCta strings may be revised by the product-analyst; the contract is one sentence, ≤ 70 chars (uz) / 75 (ru), no second clause on its own line.

## 9. Motion spec

| Element | Trigger | Property | From → To | Duration | Easing | Stagger |
|---|---|---|---|---|---|---|
| Hero H1 lines (`.hero__line-inner`) | preloader done (existing) | yPercent, rotate | 110, 3° → 0, 0 | 1.4s | `expo.out` | 0.09 |
| Hero lead, CTA row, facts (`[data-hero-fade]`) | after H1, delay 0.5s (existing) | autoAlpha, y | 0, 24 → 1, 0 | 1.2s | `expo.out` | 0.08 (lead, CTA row, facts in that order) |
| Hero title scroll-away | scroll (existing) | yPercent, autoAlpha | 0, 1 → -18, 0.15 | scrub | none | - |
| SectionCta (bar/card) text, then button | enters at `top 90%` (`useReveal`, `data-reveal`, button `data-reveal="0.08"`) | autoAlpha, y | 0, 24 → 1, 0 | 0.9s | `--ease-out` | 0.08 |
| Service cards | `data-reveal` (existing) | autoAlpha, y | 0, 24 → 1, 0 | 0.9s | `--ease-out` | `i * 0.06` |
| Service card hover | pointer hover | background-color | `/ .55` → `bg-2 80%` | 0.5s | `--ease-out` | - |
| Primary CTA hover | hover | `::before` wipe, color | translateY(101%) → 0, `--fg` → `--on-accent` | 0.6s / 0.5s | `--ease-out` | - |
| Primary CTA press | `:active` | scale | 1 → .98 | 0.2s | `--ease-out` | - |
| Secondary link hover | hover | color, border-color | `--fg`, `--line-strong` → `--accent-ink` | 0.3s | `--ease-out` | - |
| Modal panel in/out | open/close (existing) | translateX; backdrop opacity | 100% → 0; 0 → 1 | 0.7s; 0.6s | `--ease-out` | - |
| Modal form -> success swap | 2xx | opacity | 1 → 0, then 0 → 1 | 0.35s each way | `--ease-out` | - |
| Modal error box | error | grid-template-rows, opacity | 0fr, 0 → 1fr, 1 | 0.4s | `--ease-out` | - |
| Sending dots | state sending | scale, opacity | .6, .4 → 1, 1 (loop) | 1s | `--ease-in-out` | 0.15 |
| Budget chip press | click | background, color | transparent → `--accent` | 0.3s | `--ease-out` | - |
| NDA badge, placeholder marker, Telegram link | none | none | none | - | - | - |

Reduced motion (`prefers-reduced-motion: reduce`): hero fades not applied (existing early return in `onMounted`; ensure nothing is hidden by CSS before JS), SectionCta and cards visible without tween, modal slide and swap instant (global 0.001ms rule), sending dots static at full opacity (no loop), error box appears immediately, no hover wipe movement beyond colour.

## 10. WebGL presets

No new `data-scene`. Presets after removing `stats` and `expertise` (for webgl-engineer's reference; values unchanged):

| data-scene | x | y | scale | distort | frequency | tint | satellites |
|---|---|---|---|---|---|---|---|
| hero | 0.18 | 0.02 | 1.18 | 0.5 | 0.73 | 0 | 1 |
| intro | 0.62 | 0.05 | 0.78 | 0.32 | 0.98 | 0.15 | 0.6 |
| services | -0.66 | 0.1 | 0.62 | 0.75 | 1.26 | 0.05 | 0.3 |
| projects | 0.5 | 0.66 | 0.26 | 0.25 | 0.91 | 0.6 | 0 |
| process | 0.66 | 0 | 0.7 | 0.3 | 1.12 | 0 | 0.5 |
| faq | -0.7 | -0.1 | 0.5 | 0.6 | 1.47 | 0.4 | 0.2 |
| contact | 0 | -0.05 | 1.35 | 0.85 | 0.59 | 0.8 | 1 |
| detail | 0.68 | 0.35 | 0.55 | 0.4 | 0.98 | 0.5 | 0.4 |

Notes: services -> projects -> process now follow each other directly (x -0.66 -> 0.5 -> 0.66); the scroll lerp already covers it, no tweak needed. CTA panels and the modal are glassed (section 2, 4) so the blob behind never decides legibility. The hero blob (x 0.18) sits behind the lead/CTA column on desktop; the lead is `--fg` on the blob, so keep the existing hero scrim behaviour and verify visually.

## 11. No-WebGL and fallbacks

CSS-only fallback from the i18n spec stays (radial gradient using `--bg`/`--bg-2`, ink variant in light). All new elements are plain DOM and work without WebGL. No JS: hero CTA buttons open the modal only with JS; fallback: the secondary Telegram link and the contact section links (`mailto`, Telegram, `tel`) are plain anchors and still work. The modal `inert`/focus handling is JS-only and not needed without JS.

## 12. Contrast check (all pairs)

Ratios hand-computed from sRGB luminance; qa-engineer to confirm with axe in both themes.

| Pair | Dark | Light | Need |
|---|---|---|---|
| H1 / hero lead `--fg` on `--bg` | 18:1 | 17.5:1 | 4.5 (H1 large: 3) |
| H1 outline (`--fg` stroke 1.5px) on `--bg` | 18:1 | 17.5:1 | 3 (large text/graphic) |
| Facts label, bullets, note `--fg-dim` on `--bg` / `--bg-2` | 5.9 / 5.7:1 | 5.2 / 5.1:1 | 4.5 |
| `btn--solid`: `--bg` on `--fg` | 18:1 | 17.5:1 | 4.5 |
| `btn` hover: `--on-accent` on lime | 16.6:1 | 16.6:1 | 4.5 |
| Secondary link `--fg` / hover `--accent-ink` on `--bg` | 18:1 / 17.4:1 | 17.5:1 / 5.5:1 | 4.5 |
| Link underline `--line-strong` on `--bg` | 3.7:1 | 3.55:1 | 3 (UI) |
| SectionCta text `--fg` on glass (`--bg` at .72 over worst-case chrome) | ~7.8:1 | ~9:1 | 4.5 |
| NDA badge `--fg` on `--bg` .85 over lime / dark cover | >=10:1 | >=10:1 | 4.5 |
| NDA badge border `--line-strong` | 3.7:1 | 3.55:1 | 3 |
| Chip text `--fg` on `--bg-2` | 17.5:1 | 16:1 | 4.5 |
| Chip pressed `--on-accent` on lime | 16.6:1 | 16.6:1 | 4.5 |
| Pressed chip border `--accent-ink` | 17:1 | 5.05:1 | 3 |
| `--danger` text on `--bg-2` (**new token**: `#ff8a7a` dark, `#b3261e` light) | 8.5:1 | 5.4:1 | 4.5 |
| `--danger` border / field underline on `--bg-2` | 8.5:1 | 5.4:1 | 3 |
| Disabled/sending button (`--bg` on `--fg`, opacity .6) | ~6:1 | ~5:1 | 4.5 (kept legible although aria-disabled is not exempt) |
| Price qualifier `--fg-dim` on `--bg` | 5.9:1 | 5.2:1 | 4.5 (large text: 3) |
| Placeholder marker `--violet` dashed outline (dev only) | 3.9:1 | 3.9:1 | 3 (non-text) |
| Input placeholder `--fg-dim` on `--bg-2` | 5.7:1 | 5.1:1 | 4.5 |

Errors are never colour-only: always paired with a `!` glyph and text; lime is never the sole indicator in light mode.

## 13. Accessibility checklist

- [ ] One `h1` per page: hero H1 (home), project title (detail); SectionCta uses `<p>`, not a heading.
- [ ] Hero CTA is a `<button>`; Telegram is an `<a target=_blank rel=noopener>` with sr-only "yangi oynada ochiladi"; Tab order: header, primary CTA, Telegram link, content.
- [ ] Both hero CTAs visible without scrolling at 390x844 and 1440x900.
- [ ] Every control has an accessible name containing its visible text (WCAG 2.5.3); contact circle: "Bepul audit" label visible and in name.
- [ ] Modal: `role=dialog aria-modal aria-labelledby`; first-input focus; `inert` on the app root while open; Escape closes; focus returns to the trigger; Lenis stopped while open (existing).
- [ ] Every field has a visible `<label>`; placeholders are hints only; optional fields say "(ixtiyoriy)".
- [ ] Validation: `novalidate`, `aria-invalid`, `aria-describedby`, focus on first invalid; error text 4.5:1 with `!` glyph; checkbox error announced.
- [ ] Error box `role="alert"`; throttle hint `role="status"`; success container `aria-live="polite"` with focused heading; no focus loss on sending (`aria-disabled`, not `disabled`).
- [ ] Honeypot: `aria-hidden` wrapper, `tabindex=-1`, `autocomplete=off`, off-screen, not `display:none`; axe `aria-hidden-focus` clean.
- [ ] Budget chips: `aria-pressed` toggle buttons in a labelled group, none pressed on open and reopen, keyboard Space/Enter; target >= 44px.
- [ ] Consent checkbox 24px, required, label click target >= 44px, unchecked each open.
- [ ] Target sizes: >= 44px on mobile, >= 24px desktop (service cards non-interactive, no tap target issues).
- [ ] NDA badge: not conveyed by colour; text present; lock icon `aria-hidden`.
- [ ] Nav: order Xizmatlar, Loyihalar, Narxlar, Aloqa; `#pricing` exists; hash click scrolls and lands in view; burger menu focus management unchanged.
- [ ] `prefers-reduced-motion`: no GSAP reveal from-states, no loops, no wipes; content visible with JS disabled for hero text.
- [ ] No horizontal overflow at 390 and 1440 on `/`, `/ru/`, `/en/` (H1 and services titles are the risk).
- [ ] Contrast table (section 12) holds in both themes; focus ring `2px --accent-ink`, offset 3px, visible on `--bg`, `--bg-2` and glass panels.
- [ ] `lang` on `<html>` per locale; hyphenation relies on it for service names and body copy.
