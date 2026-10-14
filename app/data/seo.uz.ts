/** Uzbek (Latin) SEO copy — source of the `SeoCopy` shape (ru/en must match it, a missing key fails typecheck). */
const seo = {
  ogLocale: 'uz_UZ',
  home: {
    // ≤ 60 chars, keyword-led; e2e expects the word "raqamlashtirish"
    title: 'CRM, ERP tizimlari va raqamlashtirish Toshkentda | 3dot',
    // 140–160 chars
    description:
      'Toshkentdagi 3dot IT-studiyasi: CRM va ERP tizimlarini ishlab chiqish va joriy etish, biznes jarayonlarini avtomatlashtirish, web-ilovalar va saytlar yaratish.',
    keywords:
      'CRM tizimi Toshkent, ERP joriy etish, ERP tizimlari ishlab chiqish, biznesni avtomatlashtirish, raqamlashtirish, elektron hujjat aylanishi, web-ilova ishlab chiqish, sayt yaratish Toshkent, 1C integratsiya'
  },
  project: {
    keywords: 'keys, IT loyiha, raqamlashtirish'
  },
  breadcrumbHome: 'Bosh sahifa',
  orgDescription: 'Biznes va davlat tashkilotlari uchun CRM, ERP, avtomatlashtirish va web-yechimlar'
}

export type SeoCopy = typeof seo
export default seo
