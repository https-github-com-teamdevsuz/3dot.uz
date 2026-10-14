# 3dot — 3D portfolio sayt (Nuxt 4 · three.js · GSAP · Lenis)

liqium.ru uslubidagi qorong‘i, tipografiyaga asoslangan 3D portfolio: suyuq-xrom WebGL shar har bir bo‘limga skroll qilganda shakli, joyi va rangini o‘zgartiradi.

## Ishga tushirish

```bash
npm install
npm run dev        # http://localhost:3000
```

Node.js 20.19+ (tavsiya: 22).

| Buyruq | Vazifasi |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` / `npm run preview` | SSR build va ko‘rish |
| `npm run generate` | Statik sayt (`.output/public`, 21 ta HTML sahifa) va `sitemap.xml` — hosting uchun |
| `npm run typecheck` | TypeScript tekshiruvi |
| `npm run test:e2e` | Playwright testlari (avval `npm run generate`; birinchi marta `npx playwright install chromium`). Band mashinada: `npx playwright test --workers=2` |
| `node workers/lead-relay/test.mjs` | Lid relay (Cloudflare Worker) self-check |
| `npm run agents:check` | Har bir agent o‘z modeliga bog‘langanini tekshiradi |
| `npm run sdlc:status` | Pipeline bo‘yicha feature’lar holati |

## Sayt tarkibi

Preloader → Hero (`Excel o‘rniga — yagona tizim.`, «Bepul audit olish» tugmasi va Telegram havolasi) → Kirish (qisqa tanishtiruv va yagona raqamlar: 20+ tizim, 5 yil) → 4 ta xizmat (CRM, ERP va ombor, Hujjat aylanishi, Integratsiya) → Gorizontal pin qilingan loyihalar (NDA belgisi, oxirida CTA) → Ish bosqichlari (oxirida CTA) → Narxlar + FAQ (`#pricing`, oxirida CTA) → Aloqa → Footer. Jami 7 bo‘lim. Har bir loyiha uchun `/projects/<slug>` sahifasi (oxirida CTA), kontakt formasi (modal), custom cursor, film grain, `prefers-reduced-motion` va WebGL yo‘q bo‘lgandagi fallback.

## Qanday tahrirlash

- **Matnlar, xizmatlar, narxlar** — `app/data/site.uz.ts`, `site.ru.ts`, `site.en.ts` (har bir til). Umumiy ma’lumotlar (brend, kontaktlar, loyiha slug’lari, `SITE_URL`, narx, raqamlar, NDA belgisi) — `app/data/site.ts`. Brend nomi `brand`. Logotip — `app/components/ui/BrandLogo.vue` (SVG manbalari va boshqa konsepsiyalar `brand/` papkasida). Demo loyihalar — o‘ylab topilgan, o‘zingiznikiga almashtiring.
- **CTA matni** — bitta kalit: `ui.cta.label` (uz/ru/en). Header, hero, bo‘lim oxiridagi tugmalar va keys sahifasi shundan oladi. Modal sarlavhasi — `ui.modal.title`.
- **Narx va raqamlar (PLACEHOLDER)** — `app/data/site.ts`: `priceFrom` (`$1 500`) va `statsBase.numbers` (20+, 5). Biznes tasdiqlagach, almashtiring. Placeholder’larni ko‘rish uchun:

  ```bash
  NUXT_PUBLIC_SHOW_PLACEHOLDERS=1 npm run dev
  ```

  PowerShell’da: `$env:NUXT_PUBLIC_SHOW_PLACEHOLDERS=1; npm run dev`. Ishlab chiqarish buildida bu belgi chiqmaydi.
- **3D shar har bo‘limda qanday turishi** — `app/webgl/scenePresets.ts` (`x, y, scale, distort, frequency, tint, satellites`).
- **Ranglar, shriftlar** — `app/assets/css/main.css` dagi `:root` (dark) va `:root[data-theme='light']` tokenlari. 3D shar palitrasi — `SCENE_PALETTES` (`app/webgl/scenePresets.ts`).
- **Shader / yorug‘lik** — `app/webgl/LiquidScene.ts` (`buildEnvironment`, `liquid()` GLSL funksiyasi).
- **SEO matnlari** (title, description, keywords) — `app/data/seo.uz.ts`, `seo.ru.ts`, `seo.en.ts`. Pastdagi “SEO” bo‘limiga qarang.
- **Shriftlar** — `public/fonts/` va `app/assets/css/fonts.css`. Pastdagi “Shriftlar va performance” bo‘limiga qarang.
- **Lid formasi** — `ContactModal.vue` va `app/composables/useLead.ts`. Yuborish manzili — `NUXT_PUBLIC_LEAD_ENDPOINT`. Pastdagi “Lid relay (Telegram)” bo‘limiga qarang.

## Lid relay (Telegram)

Kontakt formasi so‘rovni Cloudflare Worker ga yuboradi. Worker uni Telegram botiga jo‘natadi. Bot tokeni va chat id faqat Worker sirlarida turadi. Ular saytda va `.output/public` da yo‘q.

1. Forma `app/composables/useLead.ts` orqali `NUXT_PUBLIC_LEAD_ENDPOINT` manziliga JSON yuboradi (`text/plain`, 10 soniya kutish).
2. Worker (`workers/lead-relay/worker.js`) so‘rovni tekshiradi: hajm, maydonlar, Origin va IP bo‘yicha cheklov. Keyin Telegramga yuboradi.
3. Muvaffaqiyatda forma “qabul qilindi” holatini ko‘rsatadi. Xatoda (5xx, tarmoq, timeout, manzil yo‘q) forma to‘ldirilgan holda qoladi va “Telegramda yozish” havolasi chiqadi. Soxta muvaffaqiyat yo‘q.

Himoya: honeypot maydoni (`website`), mijoz tomonida 30 soniyalik cheklov, Worker’da IP boshiga 5 so‘rov / 10 daqiqa (bitta nusxa ichida).

Manzil build vaqtida o‘rnatiladi. `NUXT_PUBLIC_LEAD_ENDPOINT` ni o‘zgartirgandan keyin sayt qayta yig‘ilishi kerak. Deploy’da bu repo o‘zgaruvchisi `LEAD_ENDPOINT` orqali beriladi. Demo manzil (`lead-relay.example.workers.dev`) bilan forma har doim xato holatini ko‘rsatadi. Go-live oldidan haqiqiy manzilni qo‘ying.

Lokal sinov:

```bash
node workers/lead-relay/test.mjs      # self-check
cd workers/lead-relay && npx wrangler dev
```

Lokal relay bilan ishlash uchun `.env` da `NUXT_PUBLIC_LEAD_ENDPOINT=http://localhost:8787/lead` qo‘ying.

Egasi uchun qadamlar (BotFather, `wrangler secret put`, `wrangler deploy`, `LEAD_ENDPOINT`): `workers/lead-relay/README.md` va `docs/sdlc/2026-10-cro-analysis/08-release.md`.

## Tillar

Uchta til: `uz` (standart, prefikssiz — `/`), `ru` (`/ru`), `en` (`/en`). Loyiha sahifalari: `/projects/<slug>`, `/ru/projects/<slug>`, `/en/projects/<slug>`. Slug’lar barcha tillarda bir xil.

1. Manba — `app/data/site.uz.ts`. `SiteCopy` tipi shu fayldan olinadi.
2. `site.ru.ts` va `site.en.ts` — `satisfies SiteCopy` bilan yoziladi. Kalit yoki massiv yetishmasa, `npm run typecheck` xato beradi.
3. Yangi matn: avval `site.uz.ts` ga, keyin ikkala faylga qo‘shing.
4. Yangi loyiha: `app/data/site.ts` dagi `projectBase` ga qo‘shing (`nda` maydonini ham), so‘ng har bir til faylida `projects` ga tarjima qo‘shing.

Routelar: `nuxt.config.ts` dagi `pages:extend` hook har bir sahifani `/ru` va `/en` ostida nusxalaydi. `nitro.prerender.routes` har bir til uchun bosh sahifa va loyiha sahifalarini yaratadi. `npm run generate` 21 ta HTML sahifa chiqaradi. Har bir sahifada `hreflang` (uz, ru, en, x-default) va canonical bo‘ladi.

Til tanlovi `localStorage` da `3dot:locale` kalitida saqlanadi. Saqlangan `ru` yoki `en` prefikssiz URL ni bir marta yo‘naltiradi. `uz` tanlovi yo‘naltirmaydi.

`ru` va `en` matnlari `linguist` agenti tomonidan yangilangan. Ona tilli kishi tekshirishi tavsiya etiladi.

## Mavzu (dark / light)

- Standart: tizim sozlamasi (`prefers-color-scheme`). Signal bo‘lmasa — dark.
- Tanlov `localStorage` da `3dot:theme` kalitida (`light` yoki `dark`) saqlanadi. Saqlangan tanlov bo‘lsa, tizim o‘zgarishi e’tiborga olinmaydi.
- `data-theme` atributini faqat `nuxt.config.ts` dagi inline script va `useTheme().toggle()` o‘rnatadi. Vue uni render qilmaydi.
- Ranglar — `app/assets/css/main.css`: `:root` (dark) va `:root[data-theme='light']` tokenlari.
- 3D shar — `app/webgl/scenePresets.ts` dagi `SCENE_PALETTES` (`dark`, `light`). Shader o‘zgarmagan, mavzu almashganda WebGL kontekst qayta yaratilmaydi.

## SEO

- **Sarlavha, tavsif, kalit so‘zlar** — `app/data/seo.uz.ts`, `seo.ru.ts`, `seo.en.ts`. Uchala fayl `SeoCopy` tipiga mos bo‘lishi shart. Kalit yetishmasa, `npm run typecheck` xato beradi.
- **Head teglar** — hammasi `app/composables/useSeo.ts` da: title, description, keywords, canonical, hreflang, Open Graph, Twitter, JSON-LD. Sahifalarda `useSeoMeta` chaqirmang.
- **Tasdiqlash kodlari** — `app/composables/useSeo.ts` dagi `SITE_VERIFICATION`:

  ```ts
  export const SITE_VERIFICATION = {
    google: 'GOOGLE_CODE', // Search Console → HTML teg → content="…"
    yandex: 'YANDEX_CODE' // Yandex Webmaster → Meta teg → content="…"
  }
  ```

  Bo‘sh qiymat teg chiqarmaydi. Kodni kiritib, `npm run generate` va deploy qiling.
- **Sitemap** — `npm run generate` dan keyin `scripts/sitemap.mjs` `.output/public/sitemap.xml` ni yozadi. Uni qo‘lda tahrirlamang.
- **Robots** — `public/robots.txt`.
- **Search Console va Yandex Webmaster** — qadamma-qadam: `docs/sdlc/2026-10-seo-perf/11-seo.md`.
- **Yuborishdan oldin** — `app/data/site.ts` dagi email, telefon va demo loyihalarni haqiqiylari bilan almashtiring.

## Shriftlar va performance

- Shriftlar `public/fonts/` da (woff2, latin va cyrillic). Har bir oila uchun OFL litsenziya shu papkada.
- `@font-face` va metrik fallback’lar — `app/assets/css/fonts.css`. `--font-*` tokenlari — `app/assets/css/main.css`.
- **Google Fonts’ni qayta qo‘shmang.** U render’ni bloklaydi va tashqi so‘rovlar qo‘shadi. Yangi shrift kerak bo‘lsa, woff2 faylni `public/fonts/` ga qo‘ying va `fonts.css` ga `@font-face` yozing.
- Subset’lar: latin va cyrillic. Boshqa yozuv kerak bo‘lsa, yangi subset qo‘shing.
- Raqamlar va tekshiruv: `docs/sdlc/2026-10-seo-perf/07-performance.md`.

## Agentlar va SDLC pipeline

Claude Code’da loyiha papkasini ochib:

```
/sdlc Loyihalar sahifasiga filtr va 3D hover effekt qo'shish
```

`/sdlc` endi strategiya auditi bilan boshlanadi. Avval `business-analyst` (opus) `00-strategy.md` yozadi: muammolar, CTA va takliflar. Inson tasdig‘idan keyin `product-analyst` (sonnet) `01-requirements.md` yozadi.

Orkestrator har bir bosqichni o‘z agentiga topshiradi, artefaktlar `docs/sdlc/<feature-id>/` ga yoziladi:

| Bosqich | Agent | Model | Natija |
|---|---|---|---|
| 01 Strategiya → Talablar | business-analyst → product-analyst | opus → sonnet | 00-strategy.md, 01-requirements.md |
| 02 Arxitektura ∥ Dizayn | solution-architect ∥ ui-ux-designer | opus ∥ sonnet | 02-architecture.md, 03-design-spec.md |
| 03 Ishlab chiqish | webgl-engineer ∥ frontend-developer ∥ linguist ∥ seo-specialist ∥ performance-engineer | opus ∥ sonnet ∥ opus ∥ opus ∥ opus | kod + 04-implementation.md |
| 04 Code review | code-reviewer | opus | 05-review.md |
| 05 Test ∥ Performance | qa-engineer ∥ performance-auditor | sonnet ∥ sonnet | 06-test-report.md, 07-performance.md |
| 06 Reliz | devops-engineer | haiku | 08-release.md |
| 07 Hujjatlar | tech-writer | haiku | 09-handoff.md |

Gate’lar: 00/01 dan keyin (strategiya va talablar), 02 dan keyin hamda deploydan oldin — inson tasdig‘i; review `CHANGES_REQUESTED` bo‘lsa — 03 ga qaytish (maks. 2 marta); test/perf `PASS` bo‘lishi shart.

### Har bir agent o‘z modelida ishlashi qanday kafolatlanadi

1. **Pin** — har bir `.claude/agents/<agent>.md` frontmatter’ida `model:` aniq yozilgan (`inherit` taqiqlangan).
2. **Yagona manba** — `sdlc/pipeline.json → agents` da xuddi shu model ko‘rsatilgan.
3. **Statik tekshiruv** — `npm run agents:check` frontmatter ↔ pipeline.json mosligini tekshiradi; CI’ning birinchi job’i shu.
4. **Runtime himoya** — `.claude/settings.json` dagi PreToolUse hook (`scripts/guard-agent-model.mjs`) agent chaqiruvida boshqa `model` berilsa yoki fayl o‘zgartirilgan bo‘lsa chaqiruvni bloklaydi, har bir ishga tushishni `.claude/logs/agent-runs.jsonl` ga yozadi.

Modelni almashtirish uchun: `pipeline.json` va agent faylini birga o‘zgartiring, so‘ng `npm run agents:check`.

## CI/CD

`.github/workflows/ci.yml`: agentlar tekshiruvi → lid relay self-check → typecheck → `generate` → maxfiy ma’lumot tekshiruvi (`.output/public` da bot tokeni yo‘q) → Playwright (desktop / mobile / reduced-motion) → GitHub Pages deploy (`main`). Deploy `LEAD_ENDPOINT` repo o‘zgaruvchisini build’ga beradi. Deploy qadamlari, repo sozlamalari va rollback: `docs/sdlc/2026-10-i18n-theme/08-release.md` (sayt) va `docs/sdlc/2026-10-cro-analysis/08-release.md` (lid relay). Deploydan oldin inson tasdig‘i uchun repo sozlamalarida `github-pages` environment’ga *required reviewers* qo‘shing.
