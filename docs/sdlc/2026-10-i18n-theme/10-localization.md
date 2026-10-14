# 10 · Localization — ru / en copy edit

> Owner: linguist (opus) · Source of truth: `app/data/site.uz.ts` · Edited: `app/data/site.ru.ts`, `app/data/site.en.ts` · `npm run typecheck`: exit 0

Keys, structure, slugs, prices, brand/tech names are unchanged. The strings that e2e tests and design spec §11 depend on are kept word for word: the meta titles (`цифровизация` / `digitalization`), `Обсудить проект` / `Discuss a project`, `Открыть меню`, the theme labels and the language names.

## Glossary (uz → ru → en)

| uz | ru | en |
|---|---|---|
| raqamlashtirish | цифровизация; verb: «переводим в цифру» (not «цифровизируем») | digitalization (noun, brand), digitize (verb) |
| davlat tashkiloti / sektori | госорган / госсектор | government agency / public sector |
| joriy etish | внедрение | rollout (process), delivered (stats) |
| ijro nazorati | контроль исполнения | assignment tracking |
| hujjat aylanishi | документооборот (ЭДО) | document management |
| topshiriq | поручение | assignment |
| qo‘llab-quvvatlash | сопровождение (service), поддержка (FAQ answer) | support |
| rivojlantirish | развитие | enhancements / ongoing improvements |
| ombor | склад | inventory (service), warehouse (case) |
| kabinet | личный кабинет | portal |
| keys | кейс (1 кейс / 2 кейса / 5 кейсов) | case study / case studies |
| individual smeta | индивидуальная смета | custom quote |
| onlayn navbat | онлайн-запись | online booking |
| filial | филиал | store (retail case) |
| 1C | **1С** (Cyrillic С, the official Russian spelling) | 1C |
| Yandex Direct | Яндекс Директ | Yandex Direct |

## Quality fixes

**Russian**
- `count` used a fixed «кейсов», which is wrong for 1 or 2–4. It now uses a proper plural rule (кейс / кейса / кейсов).
- «Цифровизируем» is a clumsy verb. Replaced it with «Переводим в цифру процессы бизнеса и госорганов».
- «Согласен на обработку…» assumed a male reader. Changed to the gender-neutral «Даю согласие на обработку персональных данных».
- Calques removed:
  - «ваш новый лучший проект» → «ваш новый проект — и сделаем его лучшим»
  - «Меню в подвале» → «Нижнее меню»
  - «Связываем ваши существующие программы друг с другом» → «Связываем ваши программы между собой»
  - «Остаёмся рядом» → «Не пропадаем после релиза»
- KPI badges now read in the natural order: «−60% звонков от клиентов», «−40% времени в очереди», «Склад оцифрован на 100%».
- Service card «Электронный документооборот» (two very long words) is now «Документооборот» + «ЭДО». The service name «Поддержка» is now «Сопровождение», the standard B2B/1С term.
- Display headings stay short, in line with design spec §6. None is more than about 20% longer than the Uzbek. The header (nav + CTA) is unchanged, so it still fits at 1180px.
- Typography: « », em dashes, no space before punctuation, lowercase «вы».

**English (US)**
- `count` now handles the singular (1 case study).
- Post-Soviet calques replaced:
  - «execution control» → assignment tracking
  - «document flow» → document management
  - «online queue» → online booking
  - «personal account» → dealer portal
  - «years on the market» → years in business
  - «flow of customers» → bring in the customers
- Contact block: «let’s get acquainted / Shall we discuss a project? / Write» is now «let’s get to know each other / Got a project in mind? / Get in touch».
- Copy tightened and kept in sentence case, with US spelling throughout: e-mail → email, «warehouse» → inventory (for the service), cash registers → POS terminals, «individual approach» → tailored approach.

## Open questions for the client
1. `ui.faq.pricingTitle`: the uz «Sayt ishlab chiqish narxi» says *website* development cost, but the page sells CRM/ERP systems. I translated it faithfully. Should it be «Project cost» / «Стоимость разработки» instead?
2. `ui.modal.title`: «Salom!» is informal, but the target audience includes government bodies. I kept «Привет!» / «Hi!» to match the brand voice. Confirm, or switch to «Здравствуйте!».
3. `meta.title` keeps «цифровизация» / «digitalization» because the e2e tests match on them. If the wording ever changes, update `tests/e2e/i18n-theme.spec.ts` at the same time.

## Uzbek proofread

Files: `app/data/site.uz.ts` (source), plus the aligned ru/en strings listed below. Keys, structure, slugs, prices, brand and tech names are unchanged. `npm run typecheck` exits 0.

**Orthography**
- Apostrophes are already consistent: `‘` (U+2018) for oʻ/gʻ and `’` (U+2019) for the glottal stop (maʼlumot). I kept these rather than switching to U+02BB/U+02BC. The Google Fonts subsets (Unbounded, Manrope) do not reliably include U+02BB, so the switch risks fallback glyphs in display headings. Revisit only if self-hosted fonts are verified.
- Web/Veb: «Veb» is now used throughout, matching the existing «Veb-saytlar»: veb-ilovalar, Veb-ilova tag, «Veb, mobil va backend».
- Suffixes on foreign names follow the plain form: «Excel’da» → «Excelda», matching «Telegramda».

**Calques, anglicisms and grammar**
- Nav «Kontaktlar» → «Aloqa».
- `count`: «N ta keys» → «N ta loyiha».
- «Relizdan keyin ham yoningizdamiz» → «Ishga tushirgandan keyin ham yoningizdamiz».
- «Nimadir xato ketdi» (calque of «что-то пошло не так») → «Kutilmagan xatolik yuz berdi».
- Theme cursor «Tema» → «Rejim».
- «individual smeta» → «individual hisob-kitob».
- Service card «Elektron hujjat» → «Hujjat aylanishi» (sub: «Elektron hujjatlar / Ijro nazorati»). This matches ru «Документооборот / ЭДО».
- «Dashboard» → «Dashbordlar».
- «har 2 haftada» → «har ikki haftada».
- Intro: «sizning ish jarayonlaringiz asosida quriladi» (redundant «sizning», passive) → «Har bir yechimni ish jarayonlaringizga moslab quramiz».
- FAQ: «olgan yaxshimi … moslab yozganmi» → «olgan ma’qulmi yoki buyurtma asosida yozdirganmi» (causative: you have it written).
- FAQ: «Ishga tushgandan keyin kim…» → «Ishga tushirilgandan keyin tizimni kim…».
- Consent: «ma’lumotlarni» → «ma’lumotlarimni» (first person, like a checkbox).
- yuk-track: «mijozlar o‘z yukini onlayn kuzatadigan kabinet».
- Process text: «loyiha qayerda ekanini» → «loyiha qaysi bosqichda ekanini».

**Strings that changed meaning (ru/en aligned)**

| key | uz | ru | en |
|---|---|---|---|
| `ui.faq.pricingTitle` | Loyiha qancha turadi? | Сколько стоит проект? | What does a project cost? |
| `ui.modal.title` | Assalomu alaykum! Keling, yangi loyihangizni muhokama qilamiz | Здравствуйте! Давайте обсудим ваш новый проект | Hello! Let’s talk about your next project |

Decisions on the two open questions:
1. **Pricing title.** The studio sells CRM/ERP, not just websites, so «Sayt ishlab chiqish narxi» was wrong. I did not use «Loyiha narxi» because it would duplicate the pricing row label `pricing[1].label` («Loyiha narxi» / «Стоимость проекта») directly below. I chose a short question instead.
2. **Greeting register.** The audience is B2B and government, so the greeting is now formal and neutral: «Assalomu alaykum!» / «Здравствуйте!» / «Hello!». I also dropped «yangi eng yaxshi loyiha» (awkward in uz). The ru/en «— and make it your best» tails went with it.

**Tests.** No string matched by `tests/e2e/i18n-theme.spec.ts` changed: meta titles, CTA «Loyihani muhokama qilish», «Menyuni ochish», Yorug/Qorong theme labels, «O‘zbekcha», and the UZ_ONLY phrases. Nothing needs action from qa-engineer.

**Glossary additions (uz → ru → en)**
- Aloqa → Контакты → Contact
- Hujjat aylanishi → Документооборот → Document management
- Veb-ilova → Веб-приложение → Web application
- Ishga tushirish → Запуск/релиз → Launch
- Rejim (theme) → Тема → Theme
- Individual hisob-kitob → Индивидуальная смета → Custom quote
