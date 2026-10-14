import type { ProjectCopy, ProjectSlug } from './site'

/** Uzbek (Latin) — source of truth for the `SiteCopy` shape. No `as const` on purpose. */
export default {
  site: {
    tagline: ['Excel o‘rniga —', 'yagona tizim.'],
    role: 'raqamli yechimlar',
    city: 'Toshkent',
    heroLead: 'Savdo, ombor va hujjatlar uchun CRM va ERP. Jarayonlaringizni bepul tahlil qilib, nimani avtomatlashtirish foyda berishini ko‘rsatamiz.',
    intro:
      'Biznes va davlat tashkilotlari jarayonlarini raqamlashtiramiz: qog‘oz va Excel jadvallardan — tartibli, avtomatlashgan tizimlarga. Har bir yechimni ish jarayonlaringizga moslab quramiz.',
    nav: [
      { label: 'Xizmatlar', hash: '#services' },
      { label: 'Loyihalar', hash: '#projects' },
      { label: 'Narxlar', hash: '#pricing' },
      { label: 'Aloqa', hash: '#contact' }
    ]
  },
  servicesTitle: 'Qaysi jarayonni tartibga solamiz?',
  services: [
    { title: 'CRM', sub: 'Mijozlar va savdo Excel o‘rniga bitta oynada.', bullets: ['Lidlar va bitimlar voronkasi', 'Eslatmalar va vazifalar', 'Savdo hisobotlari'] },
    { title: 'ERP va ombor', sub: 'Qoldiq, xarid va buyurtmalar real vaqtda.', bullets: ['Ombor qoldig‘i real vaqtda', 'Xarid va buyurtmalar nazorati', 'Inventarizatsiya'] },
    { title: 'Hujjat aylanishi', sub: 'Qog‘oz o‘rniga elektron kelishuv va nazorat.', bullets: ['Elektron kelishuv', 'Muddat va ijro nazorati', 'Hujjatlar arxivi'] },
    { title: 'Integratsiyalar', sub: 'Qo‘lda kiritish o‘rniga 1C, Payme, Click va Telegram bilan avtomatik almashinuv.', bullets: ['1C bilan ma‘lumot almashinuvi', 'Payme va Click to‘lovlari', 'Telegram xabarnomalari'] }
  ],
  stats: {
    numbers: ['Joriy etilgan tizimlar', 'Yil bozorda']
  },
  process: [
    { title: 'Audit', text: 'Jarayonlaringizni o‘rganamiz: qayerda vaqt va pul yo‘qolayotganini aniqlaymiz' },
    { title: 'Loyihalash', text: 'Texnik topshiriq, tizim arxitekturasi va interfeys prototipi' },
    { title: 'Ishlab chiqish', text: 'Bosqichma-bosqich ishlab chiqamiz, har ikki haftada natijani ko‘rsatamiz' },
    { title: 'Joriy etish', text: 'Ma’lumotlarni ko‘chirish, mavjud dasturlar bilan integratsiya, testlash' },
    { title: 'O‘qitish', text: 'Xodimlaringizni o‘qitamiz, yo‘riqnomalar tayyorlaymiz' },
    { title: 'Qo‘llab-quvvatlash', text: 'Monitoring, xatolarni tuzatish va tizimni rivojlantirish' }
  ],
  pricing: {
    audit: { label: 'Jarayonlar auditi', value: 'bepul, 1–2 kun' },
    project: { label: 'Loyiha narxi', from: (p: string) => `${p} dan boshlab`, note: 'Aniq narx — bepul auditdan keyin.' }
  },
  faq: [
    {
      q: 'Bizda hamma narsa Excelda. Qayerdan boshlash kerak?',
      a: 'Bepul auditdan. Jarayonlaringizni o‘rganib, nimani birinchi navbatda avtomatlashtirish eng ko‘p foyda berishini ko‘rsatamiz.'
    },
    {
      q: 'Tayyor dastur olgan ma’qulmi yoki buyurtma asosida yozdirganmi?',
      a: 'Ikkalasini ham taklif qilamiz. Tayyor tizim (masalan, CRM) yetarli bo‘lsa — sozlab beramiz; jarayonlaringiz o‘ziga xos bo‘lsa — individual ishlab chiqamiz.'
    },
    {
      q: 'Mavjud 1C yoki boshqa dasturlarimiz bilan ishlaydimi?',
      a: 'Ha. 1C, to‘lov tizimlari (Payme, Click), Telegram va boshqa servislar bilan integratsiya qilamiz — ma‘lumot qo‘lda ikki marta kiritilmaydi.'
    },
    {
      q: 'Ishga tushirilgandan keyin tizimni kim qo‘llab-quvvatlaydi?',
      a: 'Biz. Xodimlaringizni o‘qitamiz, monitoring qilamiz va oylik qo‘llab-quvvatlash shartnomasi asosida tizimni rivojlantiramiz.'
    }
  ],
  budgets: ['$3k gacha', '$3–10k', '$10–30k', '$30–100k', '$100k+'],
  projects: {
    'ijro-pro': {
      summary: 'Davlat tashkiloti uchun ijro nazorati tizimi',
      tags: ['Davlat', 'Hujjat aylanishi'],
      awards: ['−70% qog‘oz', '3 kun → 1 kun'],
      description:
        'Topshiriqlarni berish, muddatlarni kuzatish va ijro hisobotlarini avtomatik yig‘ish. Rahbar barcha bo‘limlar holatini bitta panelda ko‘radi, muddat o‘tishi haqida Telegram orqali ogohlantirish keladi.'
    },
    'savdo-360': {
      summary: 'Do‘konlar tarmog‘i uchun CRM va sodiqlik dasturi',
      tags: ['CRM', 'Savdo'],
      awards: ['+24% qayta xarid'],
      description:
        'Mijozlar bazasi, bonus kartalar, SMS va Telegram xabarnomalar, filiallar bo‘yicha savdo tahlili. Kassalar va 1C bilan real vaqtda integratsiya.'
    },
    'zavod-erp': {
      summary: 'Ishlab chiqarish korxonasi uchun ERP',
      tags: ['ERP', 'Ishlab chiqarish'],
      awards: ['Ombor 100% raqamli'],
      description:
        'Xomashyo kirimidan tayyor mahsulot chiqishigacha: ombor, ishlab chiqarish rejalari, tannarx hisob-kitobi va rahbariyat uchun kunlik hisobotlar.'
    },
    'yuk-track': {
      summary: 'Logistika kompaniyasi uchun yuk kuzatuv platformasi',
      tags: ['Logistika', 'Veb-ilova'],
      awards: ['Mijoz qo‘ng‘iroqlari −60%'],
      description:
        'Haydovchilar uchun mobil ilova, dispetcher paneli va mijozlar o‘z yukini onlayn kuzatadigan kabinet. GPS ma‘lumotlari va hujjatlar bir joyda.'
    },
    'shifo-navbat': {
      summary: 'Klinikalar tarmog‘i uchun onlayn navbat va elektron karta',
      tags: ['Tibbiyot', 'Avtomatlashtirish'],
      awards: ['Navbat kutish −40%'],
      description:
        'Shifokorga onlayn yozilish, eslatmalar, bemorning elektron kartasi va klinika bo‘yicha yuklama tahlili. Telegram bot orqali ham yozilish mumkin.'
    },
    'bozor-hub': {
      summary: 'Ulgurji savdo uchun B2B onlayn platforma',
      tags: ['E-commerce', 'Integratsiya'],
      awards: ['Buyurtmalar 24/7'],
      description:
        'Dilerlar uchun shaxsiy kabinet, individual narxlar, qoldiqlar va buyurtmalar 1C bilan sinxron. Menejerlar qo‘lda kiritish o‘rniga mijozlar bilan ishlaydi.'
    }
  } satisfies Record<ProjectSlug, ProjectCopy>,
  ui: {
    skipLink: 'Asosiy kontentga o‘tish',
    cta: { label: 'Bepul audit olish', telegram: 'Telegramda yozish' },
    sectionCta: {
      projects: 'Sizga ham shunday tizim kerakmi?',
      process: 'Birinchi qadam — bepul audit.',
      faq: 'Savol qoldimi? Auditda javob beramiz.',
      project: 'Sizga ham shunday tizim kerakmi?'
    },
    header: {
      logoAria: '3dot — bosh sahifa',
      navAria: 'Asosiy menyu',
      menuOpen: 'Menyuni ochish',
      menuClose: 'Menyuni yopish'
    },
    modal: {
      close: 'Yopish',
      title: 'Bepul auditga yoziling',
      note: '1 ish kuni ichida bog‘lanamiz. Majburiyat yo‘q.',
      name: 'Ismingiz',
      contact: 'Telefon, e-mail yoki @telegram',
      budget: 'Taxminiy byudjet (ixtiyoriy)',
      message: 'Xabar (ixtiyoriy)',
      consent: 'Shaxsiy ma‘lumotlarimni qayta ishlashga roziman',
      send: 'Auditga yozilish',
      sending: 'Yuborilmoqda…',
      doneTitle: 'Rahmat!',
      doneText: 'So‘rovingizni o‘rganib, tez orada bog‘lanamiz.',
      error: 'Yuborib bo‘lmadi. Telegramda yozing yoki qayta urinib ko‘ring.',
      throttled: 'So‘rov yuborildi. Qayta yuborish uchun 30 soniya kuting.',
      telegram: 'Telegramda yozish',
      errName: 'Ismingizni kiriting',
      errContact: 'Telefon, e-mail yoki @telegram kiriting',
      errConsent: 'Davom etish uchun rozilik bering',
      retry: 'Qayta urinib ko‘rish'
    },
    footer: { navAria: 'Pastki menyu' },
    intro: { eyebrow: 'studiya haqida' },
    services: { eyebrow: 'xizmatlar', also: 'Shuningdek: veb, mobil ilovalar, BI' },
    projects: {
      eyebrow: 'tanlangan ishlar',
      title: 'Loyihalar',
      count: (n: number) => `${n} ta loyiha`,
      cursor: 'Ko‘rish'
    },
    process: {
      eyebrow: 'jarayon',
      title: 'Ish bosqichlari',
      text: 'Har bir bosqich aniq natija bilan yakunlanadi — siz har doim loyiha qaysi bosqichda ekanini bilasiz.'
    },
    faq: { integrations: 'Integratsiyalar', pricingEyebrow: 'narxlar', pricingTitle: 'Loyiha qancha turadi?', eyebrow: 'ko‘p beriladigan savollar' },
    contact: { eyebrow: 'keling, tanishamiz', title: 'Jarayonlaringiz qayerda vaqt yo‘qotayotganini bepul ko‘rsatamiz', button: 'Bepul audit', cursor: 'Audit' },
    project: {
      back: '← barcha loyihalar',
      year: 'Yil',
      stack: 'Stek',
      results: 'Natijalar',
      next: 'keyingi loyiha',
      nextCursor: 'Keyingi',
      nda: 'Mijoz nomi NDA ostida'
    },
    error: {
      code: 'xato',
      notFound: 'Sahifa topilmadi',
      generic: 'Kutilmagan xatolik yuz berdi',
      home: 'Bosh sahifaga',
      projectNotFound: 'Loyiha topilmadi'
    },
    theme: {
      toLight: 'Yorug‘ rejimga o‘tish',
      toDark: 'Qorong‘i rejimga o‘tish',
      nowLight: 'Yorug‘ rejim yoqildi',
      nowDark: 'Qorong‘i rejim yoqildi',
      cursor: 'Rejim'
    },
    lang: { nav: 'Til', uz: 'O‘zbekcha', ru: 'Русский', en: 'English' },
    coverLabel: (title: string) => `${title} loyihasi muqovasi`
  }
}
