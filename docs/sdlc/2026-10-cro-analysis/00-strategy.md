# 00 · Strategiya — CRO audit (3dot.uz)

**Feature id:** 2026-10-cro-analysis · **Sana:** 2026-10-14 · **Muallif:** business-analyst
**Manba:** `app/data/site.uz.ts`, `app/data/site.ts`, `app/pages/index.vue`, `app/pages/projects/[slug].vue`, `app/components/sections/**`, `SiteHeader.vue`, `ContactModal.vue`, `SiteFooter.vue`.

## Xulosa
- Hozir sayt — chiroyli vizitka: inglizcha shior, 9 bo'lim, 12 ta xizmat, CTA faqat hero, header va eng oxirgi bo'limda.
- Eng kuchli taklif — **bepul jarayonlar auditi** — FAQ ichida yashiringan; birinchi ekranda yo'q.
- **Kritik:** murojaat formasi hech qayerga yubormaydi (`ContactModal.vue` → `setTimeout`, `TODO(backend)`). Hozir har bir lid yo'qoladi.
- Ishonch dalillari (mijozlar, raqamlar, keyslar) placeholder; soxta logotiplar ishonchni oshirmaydi, buzadi.
- Kerak: bitta maqsad — "Bepul audit"ga yozilish; har bo'lim oxirida shu CTA; Telegram — ikkinchi, tezkor kanal.

## Sayohat xaritasi

| # | Bo'lim | Bosqich | Maqsad | CTA | Sotuvga hissasi | Qaror |
|---|---|---|---|---|---|---|
| — | Header | kirish | navigatsiya | bor ("Loyihani muhokama qilish") | o'rta | qayta yoz (CTA = audit) |
| 1 | Hero | kirish | qiymat taklifi | bor | o'rta (H1 inglizcha, ma'nosiz) | qayta yoz |
| 2 | Intro (marquee + matn + 50+/5 yil) | qiziqish | kimmiz | yo'q | past | qisqartir (marquee olib tashla) |
| 3 | Xizmatlar (12 ta) | qiziqish | nima qilamiz | yo'q | past (fokus tarqoq) | qisqartir → 4–6 ta |
| 4 | Statistika (120+, soha bo'yicha) | ishonch | tajriba | yo'q | past (raqamlar hero/intro bilan takror) | olib tashla, raqamlarni hero/keyslarga birlashtir |
| 5 | Loyihalar (6 keys) | ishonch | dalil | yo'q | yuqori | qoldir + CTA qo'sh |
| 6 | Ekspertiza (tablar, stek, mijozlar lentasi) | ishonch | yondashuv | yo'q | past / salbiy (soxta mijozlar) | olib tashla (tablar → xizmatlarga, stek → o'chir) |
| 7 | Jarayon (6 bosqich) | ishonch → qaror | xavfni kamaytirish | yo'q | o'rta | qoldir + 1-qadam = CTA |
| 8 | Narx + FAQ | qaror | e'tirozlar | yo'q | yuqori | qayta yoz (narx langari) + CTA |
| 9 | Kontakt | harakat | murojaat | bor ("Yozish") | o'rta | qayta yoz |
| — | Modal forma | harakat | lid | — | **salbiy (yubormaydi)** | tuzat, qisqartir |
| — | Keys sahifasi `/projects/[slug]` | ishonch → qaror | dalil | yo'q (faqat "keyingi loyiha") | o'rta | CTA qo'sh |
| — | Footer | — | kontakt | yo'q | past | qoldir, placeholder kontaktlarni almashtir |

## Muammo → Yechim → Kutilayotgan natija

### P1 (darhol, yuqori ta'sir)
1. **Forma lidlarni yo'qotadi.** `ContactModal.vue` `submit` faqat 900 ms kutadi va "Rahmat!" ko'rsatadi.
   → Haqiqiy yuborish: Telegram bot / e-mail endpoint (`/api/contact` yoki serverless, sayt statik). Xato holatida xabar + Telegram havolasi.
   → Natija: lid yo'qotish 100% → 0. Ta'sir: **yuqori**, osonlik: o'rta.
2. **Hero hech narsa sotmaydi.** H1 = "digital. systems. growth" (inglizcha, foyda yo'q); qiymat taklifi kichik `heroLead`da.
   → H1 = mijoz natijasi (uz), `heroLead` = kim uchun + nima; CTA = "Bepul audit olish" + ikkinchi havola "Telegramda yozish". `hero.index`, `hero.scroll` olib tashlanadi.
   → Natija: 5 soniyada "bu men uchunmi?" savoliga javob; hero CTA bosilishi oshadi. Ta'sir: **yuqori**, osonlik: yuqori.
3. **Asosiy taklif yashirin.** "Jarayonlar auditi — bepul" faqat FAQ/narx blokida.
   → Barcha CTA (header, hero, kontakt, modal sarlavhasi) bitta taklifga: "Bepul audit". Modal sarlavhasi shunga mos.
   → Natija: aniq, xavfsiz birinchi qadam; konversiya oshadi. Ta'sir: **yuqori**, osonlik: yuqori.
4. **CTA faqat boshida va oxirida.** Loyihalar, Jarayon, FAQ, keys sahifasi CTA'siz tugaydi.
   → Har bir shu bo'lim oxiriga bitta bir xil tugma (modalni ochadi); keys sahifasida "keyingi loyiha"dan oldin "Shunday tizim kerakmi? → Bepul audit".
   → Natija: qaror paytida harakat imkoni; skroll-chiqish kamayadi. Ta'sir: **yuqori**, osonlik: yuqori.
5. **Soxta ishonch signallari.** Mijozlar lentasi (Northwind, Atlas Bank…), 120+/50+/5 yil, keyslar — placeholder; raqamlar 3 joyda turlicha takrorlanadi.
   → Ishga tushirishdan oldin: lenta olib tashlanadi (haqiqiy, ruxsatli logotiplar bo'lmaguncha); bitta tasdiqlangan raqamlar to'plami (masalan, tizimlar soni + yillar) faqat hero ostida; keyslar — real yoki "NDA ostida" belgisi bilan.
   → Natija: ishonch buzilishi xavfi yo'qoladi. Ta'sir: **yuqori**, osonlik: o'rta (ma'lumot egasidan kerak).

### P2 (keyingi sprint)
6. **Xizmatlar ro'yxati tarqoq** (12 ta: SEO/SMM, mobil, 3D sayt, e-commerce…), asosiy yo'nalish CRM/ERP/avtomatlashtirish yo'qolib ketadi.
   → 4 ta asosiy blok: CRM · ERP va ombor · Hujjat aylanishi · Integratsiya/avtomatlashtirish; har biriga 1 qatorli **natija** ("Excel o'rniga…"). Qolganlari bitta qator: "shuningdek: veb, mobil, BI".
   → Natija: aniq pozitsiya, o'qish tezlashadi. Ta'sir: o'rta, osonlik: yuqori.
7. **Takror bo'limlar.** Ekspertiza tablari xizmatlarni takrorlaydi; Statistika intro raqamlarini takrorlaydi; stek ro'yxati biznes egasiga foyda bermaydi.
   → `StatsSection` va `ExpertiseSection` sahifadan olinadi (9 → 7 bo'lim). Integratsiya logotiplari (1C, Payme, Click, Telegram) FAQ #3 yoniga.
   → Natija: CTA'gacha yo'l qisqaradi. Ta'sir: o'rta, osonlik: yuqori.
8. **Narx langari yo'q.** "individual hisob-kitob" e'tirozni yechmaydi.
   → Har yo'nalish uchun "…dan boshlab" yoki muddat oralig'i (tasdiqlangan raqam bilan) + "Audit — bepul, 1–2 kun". Raqamni biznes egasi beradi.
   → Natija: "qimmatmi?" qo'rquvi kamayadi, sifatsiz lidlar filtrlanadi. Ta'sir: yuqori, osonlik: o'rta.
9. **Forma ishqalanishi.** 5 maydon + majburiy rozilik checkbox; budjet oldindan `$3–10k` tanlangan.
   → Majburiy: ism + kontakt. Budjet ixtiyoriy, oldindan tanlanmagan; xabar ixtiyoriy; rozilik — tugma ostida matn (checkbox o'rniga), huquqiy talabni yurist tasdiqlasin.
   → Natija: forma to'ldirish oshadi. Ta'sir: o'rta, osonlik: yuqori.
10. **Navigatsiya.** "Kompaniya" birinchi; "Narxlar"/"Audit" yo'q.
   → Tartib: Xizmatlar · Loyihalar · Narxlar · Aloqa.
   → Natija: qaror ma'lumotiga tez yetish. Ta'sir: past–o'rta, osonlik: yuqori.

### P3 (ixtiyoriy)
11. **Kontakt bo'limi** — "Loyihani muhokama qilamizmi?" + "Yozish" — noaniq; placeholder telefon/e-mail.
   → Sarlavha + javob vaqti va'dasi ("1 ish kuni ichida"), Telegram birinchi; haqiqiy kontaktlar. Ta'sir: o'rta, osonlik: yuqori.
12. **Keys sahifasi** natijasi kichik `dd` ichida. → "Natijalar" yuqoriga, katta raqam bilan; "Muammo → Yechim → Natija" tuzilmasi. Ta'sir: o'rta, osonlik: o'rta.
13. **Dekorativ animatsiya** (intro marquee, preloader) birinchi ma'noli kontentni kechiktiradi. → Marquee o'chiriladi; preloader faqat WebGL tayyor bo'lmaguncha va qisqa. Ta'sir: past, osonlik: yuqori.

## Olib tashlash ro'yxati
- `hero.index` "(IT-yechimlar ’26)", `hero.scroll` "pastga" — ma'no yo'q, diqqatni oladi.
- Intro marquee ("3dot raqamli yechimlar —" ×4) — dekor, sotmaydi.
- `StatsSection` — raqamlar hero/introda takror; "Davlat sektori 12" kabi placeholder.
- `ExpertiseSection`: tablar (xizmatlar takrori), stek ro'yxati (mijozga foydasiz), mijozlar lentasi (soxta nomlar — ishonchga salbiy).
- Xizmatlardan: "SEO va SMM", "Veb-saytlar (3D)", "Mobil ilovalar", "E-commerce" alohida kartochka sifatida — bitta "shuningdek" qatoriga.
- `projects__all` kartochkasi (50+ takror raqam) — o'rniga CTA kartochkasi.
- Footer: inglizcha `tagline` — o'zbek sahifada foydasiz.
- Maqtov so'zlar: hozir kam ("individual yondashuv" — umumiy gap, `expertise.title` bilan birga ketadi).

## Yangi matn takliflari (uz)
| Kalit | Hozir | Taklif |
|---|---|---|
| `site.tagline` (H1) | digital. / systems. / growth | Excel o'rniga — / yagona tizim. |
| `site.heroLead` | Qog'oz, Excel va tarqoq dasturlar o'rniga — yagona tizim. CRM, ERP… | Savdo, ombor va hujjatlar uchun CRM va ERP. Jarayonlaringizni bepul tahlil qilib, nimani avtomatlashtirish foyda berishini ko'rsatamiz. |
| `ui.hero.cta`, `ui.header.cta` | Loyihani muhokama qilish | Bepul audit olish |
| hero ikkinchi havola (yangi) | — | Telegramda yozish |
| `ui.modal.title` | Assalomu alaykum! Keling, yangi loyihangizni muhokama qilamiz | Bepul auditga yoziling |
| modal izoh (yangi) | — | 1 ish kuni ichida bog'lanamiz. Majburiyat yo'q. |
| `ui.modal.send` | Yuborish | Auditga yozilish |
| `ui.modal.budget` | Byudjet | Taxminiy byudjet (ixtiyoriy) |
| `ui.modal.consent` | Shaxsiy ma'lumotlarimni qayta ishlashga roziman (checkbox) | Yuborish orqali ma'lumotlaringizni qayta ishlashga rozilik bildirasiz. |
| `servicesTitle` | Raqamli yechimlar | Qaysi jarayonni tartibga solamiz? |
| `ui.contact.title` | Loyihani muhokama qilamizmi? | Jarayonlaringiz qayerda vaqt yo'qotayotganini bepul ko'rsatamiz |
| `ui.contact.button` | Yozish | Bepul audit |
| bo'lim CTA (yangi, umumiy) | — | Bepul audit olish → |
| keys CTA (yangi) | — | Sizga ham shunday tizim kerakmi? → Bepul audit |
| `pricing[1].value` | individual hisob-kitob | …dan boshlab (raqam biznes egasidan) |
| `site.nav` | Kompaniya · Loyihalar · Xizmatlar · Aloqa | Xizmatlar · Loyihalar · Narxlar · Aloqa |

## Keyingi qadam — product-analyst uchun brif
- **Maqsad:** bitta konversiya — "Bepul audit" so'rovi (modal yoki Telegram). KPI: yuborilgan formalar soni, Telegram bosishlar (analitika hodisalari bilan).
- **P1 doirasi:** (1) formani haqiqiy kanalga ulash + xato holati; (2) hero H1/lead/CTA qayta yozish, Telegram ikkinchi havola; (3) barcha CTA → "Bepul audit"; (4) Loyihalar, Jarayon, FAQ, keys sahifasi oxirida CTA; (5) placeholder ishonch signallarini olib tashlash yoki tasdiqlangan bilan almashtirish.
- **P2 doirasi:** xizmatlarni 4 taga qisqartirish; `StatsSection`, `ExpertiseSection` olib tashlash; narx langari; formani 2 majburiy maydonga qisqartirish; nav tartibi.
- **Biznes egasidan kerak (bloklovchi):** haqiqiy telefon/e-mail, lid qabul kanali (Telegram bot token / e-mail), tasdiqlangan raqamlar, ruxsatli mijozlar/keyslar, "…dan boshlab" narxlar, rozilik matni uchun huquqiy tasdiq.
- **Cheklovlar:** brend ovozi, dizayn tokenlari, WebGL blob saqlanadi; ru/en matnni linguist qiladi; olib tashlangan bo'limlarning `data-scene` presetlari webgl-engineer bilan kelishiladi.
