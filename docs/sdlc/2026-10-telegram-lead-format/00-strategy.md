# 00 · Strategiya: Telegram guruhidagi lid xabari

## Xulosa
- Relay tayyor (`useLead.ts` → `workers/lead-relay/worker.js` → `sendMessage`), `TELEGRAM_CHAT_ID` guruh id ni ham qabul qiladi. 1-talab asosan sozlash ishi, kod emas.
- Hozirgi xabar inglizcha, sarlavhasi bitta qator (`New lead (uz)`), vaqt, javob tili va keyingi qadam yo'q. Aloqa faqat formati to'g'ri bo'lsa bosiladi.
- Maqsad: sotuvchi push-bildirishnomaning o'zidan kim, qancha byudjet va qaysi tilda ekanini ko'rib, bir bosishda qo'ng'iroq qila yoki yoza olishi kerak.

## Kim o'qiydi, qachon, nima qiladi
- Kim: lidga javob beruvchi xodim. Kimligi va ish vaqti hali ochiq (hq/08, 4-savol). Guruhda bir nechta odam bo'lishi mumkin.
- Qachon: asosan telefonda, push-bildirishnomadan. Bildirishnomada faqat 1–2 qator ko'rinadi.
- Nima qiladi: (1) lidni baholaydi (byudjet, xabar), (2) javob tilini tanlaydi, (3) bir bosishda qo'ng'iroq qiladi yoki yozadi, (4) guruhda "oldim" deb javob yozadi, shunda lid ikki marta ishlanmaydi.
- Va'da: saytda "1 ish kuni ichida bog'lanamiz" deyilgan, shuning uchun xabarda yuborilgan vaqt aniq ko'rinishi kerak.

## Maydonlar tartibi (yuqoridan pastga)
1. `Yangi so'rov: bepul audit`. Push-bildirishnomada shu qator ko'rinadi.
2. `Ism:` mijoz yozganidek.
3. `Aloqa:` bosiladigan ko'rinishda (P1-2 ga qarang).
4. `Byudjet:` faqat tanlangan bo'lsa.
5. `Til:` O'zbekcha / Русский / English, "javob shu tilda" izohi bilan.
6. `Xabar:` faqat bo'sh bo'lmasa, alohida blokda, o'zgartirilmaydi.
7. `—` ajratuvchi chiziq, keyin xizmat ma'lumoti: `Sahifa:` va `Vaqt: 15.10.2026, 14:32 (Toshkent)`.

## Muammo → Yechim → Kutilayotgan natija
1. **P1. Guruhga yetkazish faqat sozlamaga bog'liq.** Bot guruhga qo'shilmagan yoki id eskirgan bo'lsa (guruh supergroup'ga o'tsa id `-100…` ga o'zgaradi), lidlar 502 qaytaradi.
   → Yechim: README'ga guruh bo'yicha tekshiruv ro'yxatini qo'shish: botni qo'shish, yozish huquqi, `-100…` id, deploydan keyin smoke-test. Env nomlari o'zgarmaydi.
   → Natija: lid yo'qolish xavfi kamayadi. Ta'sir: yuqori.
2. **P1. Aloqa har doim ham bosilmaydi.** Telegram `+998901234567`, `@user`, e-mail va `t.me/...` ni o'zi havolaga aylantiradi, lekin `90 123 45 67` yoki `@` siz username'ni aylantirmaydi.
   → Yechim: telefon formatini faqat aniq holatda moslash (`998…`/`+998…`, 12 raqam → bo'shliqsiz `+998…`). Qolgan hollarda matn o'zgarmaydi. Kontakt `@username` bo'lsa, `https://t.me/<username>` ga olib boruvchi inline-tugma "Telegramda yozish" qo'shiladi.
   → Natija: bir bosishda qo'ng'iroq qilish yoki yozish mumkin bo'ladi. Ta'sir: yuqori.
3. **P1. Xabar inglizcha va tartibsiz, birinchi qator hech narsa demaydi.**
   → Yechim: yuqoridagi maydonlar tartibi, yorliqlar o'zbekcha (lotin) va o'zgarmas. Lid qaysi tilda kelganidan qat'i nazar yorliqlar bir xil qoladi.
   → Natija: lidni ko'rib chiqish tezlashadi, xabarni qayta o'qishga hojat qolmaydi. Ta'sir: yuqori.
4. **P2. Javob tili ko'rinmaydi** (hozir faqat `(uz)` kodi bor).
   → Yechim: `Til: Русский — javob shu tilda` kabi to'liq nomi bilan alohida qator.
   → Natija: mijozga birinchi javobning o'zi uning tilida bo'ladi. Ta'sir: o'rta.
5. **P2. Vaqt yo'q.** Telegram vaqtni ko'rsatadi, lekin xabar forward qilinganda yoki Excel/CRM ga ko'chirilganda vaqt yo'qoladi (hq/08, 12-savol).
   → Yechim: worker `Intl.DateTimeFormat` va `Asia/Tashkent` bilan `DD.MM.YYYY, HH:mm (Toshkent)` qatorini qo'shadi.
   → Natija: "1 ish kuni" va'dasi bajarilganini tekshirish mumkin bo'ladi. Ta'sir: o'rta.
6. **P2. Lid manbasi noma'lum.** Reklama rejalashtirilgan, lekin UTM ham, referrer ham yuborilmaydi.
   → Yechim: kirishda `utm_source`/`utm_campaign` (yo'q bo'lsa referrer domeni) sessiyada saqlanib, `Manba:` qatori sifatida yuboriladi. Bu klient va validatsiyaga tegadi, shuning uchun alohida tasdiq kerak.
   → Natija: qaysi kanal lid olib kelayotgani ko'rinadi. Ta'sir: o'rta, reklama boshlangach yuqori.
7. **P3. Sahifa faqat yo'l ko'rinishida** (`/ru/projects/ijro-pro`).
   → Yechim: yo'lni o'zgartirmasdan pastki xizmat blokiga qo'yish. `/` bo'lsa, `Bosh sahifa` deb yozish.
   → Natija: mijoz qaysi loyihaga qiziqqani tushunarli bo'ladi. Ta'sir: past.
8. **P3. Byudjet lid tilida keladi** (`до $3k` / `$3k gacha`).
   → Yechim: klient yorliq o'rniga `site.uz.ts` dagi byudjet yorlig'ini yuboradi.
   → Natija: barcha lidlarda byudjet bir xil yoziladi, guruhda qidirish va saralash osonlashadi. Ta'sir: past.

## Xabar nima qilmasligi kerak
- Emoji, undov belgisi, "Issiq lid!", "VIP" kabi baholashlar ishlatilmaydi. Brend ovozi: jiddiy, korporativ, "—" bilan ro'yxat.
- Ma'lumot o'ylab topilmaydi: ism, mamlakat, kompaniya yoki "taxminiy byudjet" telefon raqamidan chiqarilmaydi. Bo'sh maydon qatori umuman ko'rsatilmaydi.
- Mijoz xabari tarjima qilinmaydi, qisqartirilmaydi, formatlanmaydi.
- IP, user-agent va honeypot qiymati yuborilmaydi (shaxsiy ma'lumotni minimal saqlash).
- `parse_mode` yoqilmaydi. Plain text qoladi (ADR-2: foydalanuvchi matni formatni buzolmaydi), tuzilma qatorlar tartibi bilan beriladi. Tokenni loglarga chiqarmaslik saqlanadi.

## Olib tashlash / qilinmaydi (YAGNI)
- "Oldim" tugmasi va lid statuslari kiritilmaydi, chunki ular webhook va holat saqlashni talab qiladi. Hozircha guruhda reply orqali kelishiladi.
- Topic (`message_thread_id`) va lid raqamlash ham kiritilmaydi. Guruh topic'larga bo'linsa, keyin qo'shiladi.

## Keyingi qadam (product-analyst uchun brif)
- Qamrov: P1-1…P1-3, P2-4, P2-5 faqat `worker.js` (+ `test.mjs`, README) ni o'zgartiradi. P2-6 va P3-8 klientga tegadi, ular uchun egasining tasdig'i kerak.
- Qabul mezonlari: matn tartibi aynan yuqoridagidek; bo'sh maydon qatori yo'q; `+998…` va `@user` Telegram'da bosiladi; vaqt Toshkent bo'yicha; xabarda emoji yo'q; plain text saqlangan.
- Ochiq savollar egaga (hq/08, 4 va 12): lidga kim javob beradi va ish vaqti qanday; lidlar qayerda yuritiladi. Fallback `telegram` havolasi hali placeholder, go-live'dan oldin haqiqiysiga almashtirilishi kerak.
