/**
 * All site copy lives here so the site can be edited without touching components.
 * Brand: 3dot — raqamlashtirish va IT-yechimlar (biznes va davlat tashkilotlari uchun).
 *
 * ⚠️ Lines marked PLACEHOLDER hold sample numbers / demo cases — replace them with
 * real figures and real (approved) client cases before going live.
 */
export const site = {
  brand: '3dot',
  tagline: ['digital.', 'systems.', 'growth'],
  role: 'raqamli yechimlar',
  city: 'Toshkent',
  email: 'hello@3dot.uz', // TODO: real mailbox
  phone: '+998 90 000 00 00', // TODO: real phone
  telegram: 'https://t.me/threedot_uz',
  socials: [
    { label: 'Telegram', href: 'https://t.me/threedot_uz' },
    { label: 'Instagram', href: 'https://instagram.com/3dot.uz' }
  ],
  nav: [
    { label: 'Kompaniya', href: '/#intro' },
    { label: 'Loyihalar', href: '/#projects' },
    { label: 'Xizmatlar', href: '/#services' },
    { label: 'Kontaktlar', href: '/#contact' }
  ],
  heroLead: 'Qog‘oz, Excel va tarqoq dasturlar o‘rniga — yagona tizim. CRM, ERP va jarayonlarni avtomatlashtirish.',
  intro:
    'Biznes va davlat tashkilotlari jarayonlarini raqamlashtiramiz: qog‘oz va Excel jadvallardan — tartibli, avtomatlashgan tizimlarga. Har bir yechim sizning ish jarayonlaringiz asosida quriladi.'
}

export const servicesTitle = 'Raqamli yechimlar'

export const services = [
  { title: 'CRM tizimlari', sub: 'Mijozlar / Savdo / Voronka' },
  { title: 'ERP va ombor', sub: 'Ishlab chiqarish / Ombor / Moliya' },
  { title: 'Avtomatlashtirish', sub: 'Biznes-jarayonlar / Botlar' },
  { title: 'Elektron hujjat', sub: 'Hujjat aylanishi / Ijro nazorati' },
  { title: 'Web-ilovalar', sub: 'Kabinetlar / Portallar / SaaS' },
  { title: 'Veb-saytlar', sub: 'Korporativ / Landing / 3D' },
  { title: 'E-commerce', sub: 'Onlayn do‘kon / To‘lov tizimlari' },
  { title: 'Integratsiyalar', sub: '1C / API / Payme / Click' },
  { title: 'Mobil ilovalar', sub: 'iOS / Android' },
  { title: 'Tahlil va BI', sub: 'Dashboard / Hisobotlar' },
  { title: 'SEO va SMM', sub: 'Trafik / Kontent / Reklama' },
  { title: 'Qo‘llab-quvvatlash', sub: 'Monitoring / SLA / Rivojlantirish' }
]

export const stats = {
  headline: 'Murakkab tizimlarni joriy etish tajribasi',
  total: 120, // PLACEHOLDER
  caption: 'avtomatlashtirilgan biznes-jarayonlar',
  // PLACEHOLDER: projects per sector
  awards: [
    { name: 'Davlat sektori', count: 12 },
    { name: 'Savdo', count: 18 },
    { name: 'Ishlab chiqarish', count: 9 },
    { name: 'Logistika', count: 7 }
  ],
  numbers: [
    { value: 50, suffix: '+', label: 'Joriy etilgan tizimlar' }, // PLACEHOLDER
    { value: 5, suffix: '', label: 'Yil bozorda' } // PLACEHOLDER
  ]
}

export interface Project {
  slug: string
  title: string
  summary: string
  year: number
  tags: string[]
  awards: string[]
  /** two colours used to paint the procedural cover art */
  palette: [string, string]
  description: string
  stack: string[]
}

// PLACEHOLDER: demo cases (fictional) — replace with your own case studies
export const projects: Project[] = [
  {
    slug: 'ijro-pro',
    title: 'IjroPro',
    summary: 'Davlat tashkiloti uchun ijro nazorati tizimi',
    year: 2026,
    tags: ['Davlat', 'Hujjat aylanishi'],
    awards: ['−70% qog‘oz', '3 kun → 1 kun'],
    palette: ['#c8ff5a', '#1d2b12'],
    description:
      'Topshiriqlarni berish, muddatlarni kuzatish va ijro hisobotlarini avtomatik yig‘ish. Rahbar barcha bo‘limlar holatini bitta panelda ko‘radi, muddat o‘tishi haqida Telegram orqali ogohlantirish keladi.',
    stack: ['Nuxt', 'Node.js', 'PostgreSQL', 'Telegram API']
  },
  {
    slug: 'savdo-360',
    title: 'Savdo360',
    summary: 'Do‘konlar tarmog‘i uchun CRM va sodiqlik dasturi',
    year: 2025,
    tags: ['CRM', 'Savdo'],
    awards: ['+24% qayta xarid'],
    palette: ['#7b5cff', '#120c2b'],
    description:
      'Mijozlar bazasi, bonus kartalar, SMS va Telegram xabarnomalar, filiallar bo‘yicha savdo tahlili. Kassalar va 1C bilan real vaqtda integratsiya.',
    stack: ['Vue', 'Laravel', '1C', 'Payme / Click']
  },
  {
    slug: 'zavod-erp',
    title: 'ZavodERP',
    summary: 'Ishlab chiqarish korxonasi uchun ERP',
    year: 2025,
    tags: ['ERP', 'Ishlab chiqarish'],
    awards: ['Ombor 100% raqamli'],
    palette: ['#ff6b3d', '#2b0f06'],
    description:
      'Xomashyo kirimidan tayyor mahsulot chiqishigacha: ombor, ishlab chiqarish rejalari, tannarx hisob-kitobi va rahbariyat uchun kunlik hisobotlar.',
    stack: ['Nuxt', 'Go', 'PostgreSQL']
  },
  {
    slug: 'yuk-track',
    title: 'YukTrack',
    summary: 'Logistika kompaniyasi uchun yuk kuzatuv platformasi',
    year: 2024,
    tags: ['Logistika', 'Web-ilova'],
    awards: ['Mijoz qo‘ng‘iroqlari −60%'],
    palette: ['#5ad1ff', '#06202b'],
    description:
      'Haydovchilar uchun mobil ilova, dispetcher paneli va mijozlar yukini onlayn kuzatadigan kabinet. GPS ma’lumotlari va hujjatlar bir joyda.',
    stack: ['Nuxt', 'Flutter', 'Node.js']
  },
  {
    slug: 'shifo-navbat',
    title: 'ShifoNavbat',
    summary: 'Klinikalar tarmog‘i uchun onlayn navbat va elektron karta',
    year: 2024,
    tags: ['Tibbiyot', 'Avtomatlashtirish'],
    awards: ['Navbat kutish −40%'],
    palette: ['#ffd25a', '#2b2106'],
    description:
      'Shifokorga onlayn yozilish, eslatmalar, bemorning elektron kartasi va klinika bo‘yicha yuklama tahlili. Telegram bot orqali ham yozilish mumkin.',
    stack: ['Vue', 'Laravel', 'Telegram API']
  },
  {
    slug: 'bozor-hub',
    title: 'BozorHub',
    summary: 'Ulgurji savdo uchun B2B onlayn platforma',
    year: 2023,
    tags: ['E-commerce', 'Integratsiya'],
    awards: ['Buyurtmalar 24/7'],
    palette: ['#ff4d6d', '#2b060d'],
    description:
      'Dilerlar uchun shaxsiy kabinet, individual narxlar, qoldiqlar va buyurtmalar 1C bilan sinxron. Menejerlar qo‘lda kiritish o‘rniga mijozlar bilan ishlaydi.',
    stack: ['Nuxt', '1C', 'Elastic']
  }
]

export const serviceTabs = [
  { title: 'Raqamlashtirish', text: 'Jarayonlaringizni o‘rganib, ularni tizimga aylantiramiz', items: ['Audit', 'CRM / ERP', 'Hujjat aylanishi', 'Botlar'] },
  { title: 'Ishlab chiqish', text: 'Web, mobil va backend — bitta jamoada', items: ['Nuxt / Vue', 'Node.js / Laravel', 'Flutter', 'PostgreSQL'] },
  { title: 'Integratsiya', text: 'Mavjud dasturlaringizni bir-biriga ulaymiz', items: ['1C', 'Payme / Click', 'Telegram', 'API'] },
  { title: 'Marketing', text: 'Tizim tayyor — endi mijoz oqimi kerak', items: ['SEO', 'SMM', 'Google Ads', 'Yandex Direct'] },
  { title: 'Qo‘llab-quvvatlash', text: 'Relizdan keyin ham yoningizdamiz', items: ['Monitoring', 'SLA', 'O‘qitish', 'Rivojlantirish'] }
]

export const stack = ['Nuxt / Vue', 'Node.js', 'Laravel', 'PostgreSQL', '1C integratsiya', 'Telegram API', 'Docker / DevOps', 'three.js']

// PLACEHOLDER client names — replace with real clients (with their permission)
export const clients = ['Northwind', 'Atlas Bank', 'Orbita', 'Bellavia', 'Kometa', 'Zenith Motors', 'Oqtosh', 'Solaris']

export const process = [
  { title: 'Audit', text: 'Jarayonlaringizni o‘rganamiz: qayerda vaqt va pul yo‘qolayotganini aniqlaymiz' },
  { title: 'Loyihalash', text: 'Texnik topshiriq, tizim arxitekturasi va interfeys prototipi' },
  { title: 'Ishlab chiqish', text: 'Bosqichma-bosqich ishlab chiqamiz, har 2 haftada natijani ko‘rsatamiz' },
  { title: 'Joriy etish', text: 'Ma’lumotlarni ko‘chirish, mavjud dasturlar bilan integratsiya, testlash' },
  { title: 'O‘qitish', text: 'Xodimlaringizni o‘qitamiz, yo‘riqnomalar tayyorlaymiz' },
  { title: 'Qo‘llab-quvvatlash', text: 'Monitoring, xatolarni tuzatish va tizimni rivojlantirish' }
]

export const pricing = [
  { label: 'Jarayonlar auditi va konsultatsiya', value: 'bepul' },
  { label: 'Loyiha narxi', value: 'individual smeta' }
]

export const faq = [
  {
    q: 'Bizda hamma narsa Excel’da. Qayerdan boshlash kerak?',
    a: 'Bepul auditdan. Jarayonlaringizni o‘rganib, nimani birinchi navbatda avtomatlashtirish eng ko‘p foyda berishini ko‘rsatamiz.'
  },
  {
    q: 'Tayyor dastur olgan yaxshimi yoki o‘zimizga moslab yozganmi?',
    a: 'Ikkalasini ham taklif qilamiz. Tayyor tizim (masalan, CRM) yetarli bo‘lsa — sozlab beramiz; jarayonlaringiz o‘ziga xos bo‘lsa — individual ishlab chiqamiz.'
  },
  {
    q: 'Mavjud 1C yoki boshqa dasturlarimiz bilan ishlaydimi?',
    a: 'Ha. 1C, to‘lov tizimlari (Payme, Click), Telegram va boshqa servislar bilan integratsiya qilamiz — ma’lumot qo‘lda ikki marta kiritilmaydi.'
  },
  {
    q: 'Ishga tushgandan keyin kim qo‘llab-quvvatlaydi?',
    a: 'Biz. Xodimlaringizni o‘qitamiz, monitoring qilamiz va oylik qo‘llab-quvvatlash shartnomasi asosida tizimni rivojlantiramiz.'
  }
]

export const budgets = ['$3k gacha', '$3–10k', '$10–30k', '$30–100k', '$100k+']
