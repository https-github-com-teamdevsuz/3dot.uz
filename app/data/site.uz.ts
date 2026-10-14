import type { ProjectCopy, ProjectSlug } from './site'

/** Uzbek (Latin) — source of truth for the `SiteCopy` shape. No `as const` on purpose. */
export default {
  site: {
    tagline: ['digital.', 'systems.', 'growth'],
    role: 'raqamli yechimlar',
    city: 'Toshkent',
    heroLead: 'Qog‘oz, Excel va tarqoq dasturlar o‘rniga — yagona tizim. CRM, ERP va jarayonlarni avtomatlashtirish.',
    intro:
      'Biznes va davlat tashkilotlari jarayonlarini raqamlashtiramiz: qog‘oz va Excel jadvallardan — tartibli, avtomatlashgan tizimlarga. Har bir yechimni ish jarayonlaringizga moslab quramiz.',
    nav: [
      { label: 'Kompaniya', hash: '#intro' },
      { label: 'Loyihalar', hash: '#projects' },
      { label: 'Xizmatlar', hash: '#services' },
      { label: 'Aloqa', hash: '#contact' }
    ]
  },
  servicesTitle: 'Raqamli yechimlar',
  services: [
    { title: 'CRM tizimlari', sub: 'Mijozlar / Savdo / Voronka' },
    { title: 'ERP va ombor', sub: 'Ishlab chiqarish / Ombor / Moliya' },
    { title: 'Avtomatlashtirish', sub: 'Biznes-jarayonlar / Botlar' },
    { title: 'Hujjat aylanishi', sub: 'Elektron hujjatlar / Ijro nazorati' },
    { title: 'Veb-ilovalar', sub: 'Kabinetlar / Portallar / SaaS' },
    { title: 'Veb-saytlar', sub: 'Korporativ / Landing / 3D' },
    { title: 'E-commerce', sub: 'Onlayn do‘kon / To‘lov tizimlari' },
    { title: 'Integratsiyalar', sub: '1C / API / Payme / Click' },
    { title: 'Mobil ilovalar', sub: 'iOS / Android' },
    { title: 'Tahlil va BI', sub: 'Dashbordlar / Hisobotlar' },
    { title: 'SEO va SMM', sub: 'Trafik / Kontent / Reklama' },
    { title: 'Qo‘llab-quvvatlash', sub: 'Monitoring / SLA / Rivojlantirish' }
  ],
  stats: {
    headline: 'Murakkab tizimlarni joriy etish tajribasi',
    caption: 'avtomatlashtirilgan biznes-jarayonlar',
    awards: ['Davlat sektori', 'Savdo', 'Ishlab chiqarish', 'Logistika'],
    numbers: ['Joriy etilgan tizimlar', 'Yil bozorda']
  },
  serviceTabs: [
    { title: 'Raqamlashtirish', text: 'Jarayonlaringizni o‘rganib, ularni tizimga aylantiramiz', items: ['Audit', 'CRM / ERP', 'Hujjat aylanishi', 'Botlar'] },
    { title: 'Ishlab chiqish', text: 'Veb, mobil va backend — bitta jamoada', items: ['Nuxt / Vue', 'Node.js / Laravel', 'Flutter', 'PostgreSQL'] },
    { title: 'Integratsiya', text: 'Mavjud dasturlaringizni bir-biriga ulaymiz', items: ['1C', 'Payme / Click', 'Telegram', 'API'] },
    { title: 'Marketing', text: 'Tizim tayyor — endi mijoz oqimi kerak', items: ['SEO', 'SMM', 'Google Ads', 'Yandex Direct'] },
    { title: 'Qo‘llab-quvvatlash', text: 'Ishga tushirgandan keyin ham yoningizdamiz', items: ['Monitoring', 'SLA', 'O‘qitish', 'Rivojlantirish'] }
  ],
  stack: ['Nuxt / Vue', 'Node.js', 'Laravel', 'PostgreSQL', '1C integratsiya', 'Telegram API', 'Docker / DevOps', 'three.js'],
  process: [
    { title: 'Audit', text: 'Jarayonlaringizni o‘rganamiz: qayerda vaqt va pul yo‘qolayotganini aniqlaymiz' },
    { title: 'Loyihalash', text: 'Texnik topshiriq, tizim arxitekturasi va interfeys prototipi' },
    { title: 'Ishlab chiqish', text: 'Bosqichma-bosqich ishlab chiqamiz, har ikki haftada natijani ko‘rsatamiz' },
    { title: 'Joriy etish', text: 'Ma’lumotlarni ko‘chirish, mavjud dasturlar bilan integratsiya, testlash' },
    { title: 'O‘qitish', text: 'Xodimlaringizni o‘qitamiz, yo‘riqnomalar tayyorlaymiz' },
    { title: 'Qo‘llab-quvvatlash', text: 'Monitoring, xatolarni tuzatish va tizimni rivojlantirish' }
  ],
  pricing: [
    { label: 'Jarayonlar auditi va konsultatsiya', value: 'bepul' },
    { label: 'Loyiha narxi', value: 'individual hisob-kitob' }
  ],
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
      a: 'Ha. 1C, to‘lov tizimlari (Payme, Click), Telegram va boshqa servislar bilan integratsiya qilamiz — ma’lumot qo‘lda ikki marta kiritilmaydi.'
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
        'Haydovchilar uchun mobil ilova, dispetcher paneli va mijozlar o‘z yukini onlayn kuzatadigan kabinet. GPS ma’lumotlari va hujjatlar bir joyda.'
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
    header: {
      logoAria: '3dot — bosh sahifa',
      navAria: 'Asosiy menyu',
      cta: 'Loyihani muhokama qilish',
      menuOpen: 'Menyuni ochish',
      menuClose: 'Menyuni yopish'
    },
    modal: {
      close: 'Yopish',
      title: 'Assalomu alaykum! Keling, yangi loyihangizni muhokama qilamiz',
      name: 'Ismingiz',
      contact: 'Telefon, e-mail yoki @telegram',
      budget: 'Byudjet',
      message: 'Xabar',
      consent: 'Shaxsiy ma’lumotlarimni qayta ishlashga roziman',
      send: 'Yuborish',
      sending: 'Yuborilmoqda…',
      doneTitle: 'Rahmat!',
      doneText: 'So‘rovingizni o‘rganib, tez orada bog‘lanamiz.',
      telegram: 'Telegramda yozish'
    },
    footer: { navAria: 'Pastki menyu' },
    hero: { scroll: 'pastga', index: '(IT-yechimlar ’26)', cta: 'Loyihani muhokama qilish' },
    intro: { eyebrow: 'studiya haqida' },
    services: { eyebrow: 'xizmatlar' },
    stats: { eyebrow: 'tajriba' },
    projects: {
      eyebrow: 'tanlangan ishlar',
      title: 'Loyihalar',
      count: (n: number) => `${n} ta loyiha`,
      cursor: 'Ko‘rish'
    },
    expertise: {
      eyebrow: 'ekspertiza',
      title: 'Har bir vazifaga individual yondashuv',
      tabsAria: 'Xizmat yo‘nalishlari',
      stackLabel: 'ishlab chiqish vositalari',
      clientsAria: 'Mijozlar'
    },
    process: {
      eyebrow: 'jarayon',
      title: 'Ish bosqichlari',
      text: 'Har bir bosqich aniq natija bilan yakunlanadi — siz har doim loyiha qaysi bosqichda ekanini bilasiz.'
    },
    faq: { pricingEyebrow: 'narxlar', pricingTitle: 'Loyiha qancha turadi?', eyebrow: 'ko‘p beriladigan savollar' },
    contact: { eyebrow: 'keling, tanishamiz', title: 'Loyihani muhokama qilamizmi?', button: 'Yozish', cursor: 'Yozish' },
    project: {
      back: '← barcha loyihalar',
      year: 'Yil',
      stack: 'Stek',
      results: 'Natijalar',
      next: 'keyingi loyiha',
      nextCursor: 'Keyingi'
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
