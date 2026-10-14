/** Uzbek (Latin) SEO copy — source of the `SeoCopy` shape (ru/en must match it, a missing key fails typecheck). */
const seo = {
  ogLocale: 'uz_UZ',
  home: {
    // ≤ 60 chars, keyword-led; e2e TITLE expects "raqamlashtirish" (old) or "CRM" + "audit" (R7) — both present
    title: 'Bepul audit: CRM, ERP va raqamlashtirish Toshkentda | 3dot',
    // 140–160 chars
    description:
      'Excel o‘rniga yagona tizim: Toshkentda CRM va ERP joriy etish, biznes jarayonlarini avtomatlashtirish. Jarayonlaringizni bepul audit qilamiz va reja beramiz.',
    keywords:
      'CRM tizimi Toshkent, ERP joriy etish, ERP tizimi O‘zbekiston, biznes jarayonlarini avtomatlashtirish, biznes jarayonlari auditi, Excel o‘rniga CRM, raqamlashtirish, elektron hujjat aylanishi, 1C integratsiya',
    // OfferCatalog name in JSON-LD (the visible services title is a question)
    catalogName: 'CRM, ERP va avtomatlashtirish xizmatlari'
  },
  project: {
    keywords: 'keys, IT loyiha, raqamlashtirish'
  },
  breadcrumbHome: 'Bosh sahifa',
  orgDescription: 'Biznes va davlat tashkilotlari uchun CRM, ERP, avtomatlashtirish va web-yechimlar'
}

export type SeoCopy = typeof seo
export default seo
