import type { SiteCopy } from './site'

// English (US) — edited by the linguist from site.uz.ts (glossary: docs/sdlc/2026-10-i18n-theme/10-localization.md).
export default {
  meta: {
    title: '3dot — digitalization and IT solutions',
    description:
      'We digitize how businesses and government agencies work: CRM, ERP, automation, web apps and websites.',
    ogLocale: 'en_US'
  },
  site: {
    tagline: ['digital.', 'systems.', 'growth'],
    role: 'digital solutions',
    city: 'Tashkent',
    heroLead: 'One system instead of paper, spreadsheets and scattered apps. CRM, ERP and process automation.',
    intro:
      'We digitize how businesses and government agencies work: from paper and Excel sheets to orderly, automated systems. Every solution is built around the way you actually work.',
    nav: [
      { label: 'Company', hash: '#intro' },
      { label: 'Projects', hash: '#projects' },
      { label: 'Services', hash: '#services' },
      { label: 'Contact', hash: '#contact' }
    ]
  },
  servicesTitle: 'Digital solutions',
  services: [
    { title: 'CRM systems', sub: 'Customers / Sales / Pipeline' },
    { title: 'ERP and inventory', sub: 'Production / Inventory / Finance' },
    { title: 'Automation', sub: 'Business processes / Bots' },
    { title: 'Document management', sub: 'E-documents / Assignment tracking' },
    { title: 'Web applications', sub: 'Client portals / Intranets / SaaS' },
    { title: 'Websites', sub: 'Corporate / Landing pages / 3D' },
    { title: 'E-commerce', sub: 'Online stores / Payments' },
    { title: 'Integrations', sub: '1C / API / Payme / Click' },
    { title: 'Mobile apps', sub: 'iOS / Android' },
    { title: 'Analytics and BI', sub: 'Dashboards / Reports' },
    { title: 'SEO and SMM', sub: 'Traffic / Content / Ads' },
    { title: 'Support', sub: 'Monitoring / SLA / Enhancements' }
  ],
  stats: {
    headline: 'Proven at rolling out complex systems',
    caption: 'business processes automated',
    awards: ['Public sector', 'Retail', 'Manufacturing', 'Logistics'],
    numbers: ['Systems delivered', 'Years in business']
  },
  serviceTabs: [
    { title: 'Digitalization', text: 'We map your processes and turn them into a system', items: ['Audit', 'CRM / ERP', 'Document management', 'Bots'] },
    { title: 'Development', text: 'Web, mobile and backend — one team', items: ['Nuxt / Vue', 'Node.js / Laravel', 'Flutter', 'PostgreSQL'] },
    { title: 'Integration', text: 'We connect the software you already use', items: ['1C', 'Payme / Click', 'Telegram', 'API'] },
    { title: 'Marketing', text: 'The system is live — now bring in the customers', items: ['SEO', 'SMM', 'Google Ads', 'Yandex Direct'] },
    { title: 'Support', text: 'We stay with you after launch', items: ['Monitoring', 'SLA', 'Training', 'Enhancements'] }
  ],
  stack: ['Nuxt / Vue', 'Node.js', 'Laravel', 'PostgreSQL', '1C integration', 'Telegram API', 'Docker / DevOps', 'three.js'],
  process: [
    { title: 'Audit', text: 'We study your processes and find where time and money leak' },
    { title: 'Design', text: 'Technical specification, system architecture and a UI prototype' },
    { title: 'Development', text: 'We build in stages and demo progress every two weeks' },
    { title: 'Rollout', text: 'Data migration, integration with your existing software, testing' },
    { title: 'Training', text: 'We train your team and write the user guides' },
    { title: 'Support', text: 'Monitoring, bug fixes and ongoing improvements' }
  ],
  pricing: [
    { label: 'Process audit and consultation', value: 'free' },
    { label: 'Project cost', value: 'custom quote' }
  ],
  faq: [
    {
      q: 'We run everything in Excel. Where do we start?',
      a: 'With a free audit. We study your processes and show you what to automate first for the biggest payoff.'
    },
    {
      q: 'Off-the-shelf or custom-built — which is better?',
      a: 'We do both. If an off-the-shelf system (a CRM, say) covers your needs, we set it up. If your processes are unique, we build one around them.'
    },
    {
      q: 'Will it work with our 1C and other software?',
      a: 'Yes. We integrate 1C, payment systems (Payme, Click), Telegram and other services, so no one has to enter the same data twice.'
    },
    {
      q: 'Who supports the system after launch?',
      a: 'We do. We train your team, monitor the system and keep improving it under a monthly support contract.'
    }
  ],
  budgets: ['up to $3k', '$3–10k', '$10–30k', '$30–100k', '$100k+'],
  projects: {
    'ijro-pro': {
      summary: 'Assignment tracking system for a government agency',
      tags: ['Public sector', 'Document management'],
      awards: ['−70% paper', '3 days → 1 day'],
      description:
        'Issue assignments, track deadlines and collect progress reports automatically. Executives see every department’s status on a single dashboard and get a Telegram alert the moment a deadline slips.'
    },
    'savdo-360': {
      summary: 'CRM and loyalty program for a retail chain',
      tags: ['CRM', 'Retail'],
      awards: ['+24% repeat purchases'],
      description:
        'Customer database, bonus cards, SMS and Telegram notifications, and sales analytics by store. Real-time integration with POS terminals and 1C.'
    },
    'zavod-erp': {
      summary: 'ERP for a manufacturer',
      tags: ['ERP', 'Manufacturing'],
      awards: ['100% digital warehouse'],
      description:
        'From raw-material intake to finished-goods shipping: inventory, production planning, cost accounting and daily reports for management.'
    },
    'yuk-track': {
      summary: 'Shipment tracking platform for a logistics company',
      tags: ['Logistics', 'Web app'],
      awards: ['−60% customer calls'],
      description:
        'A mobile app for drivers, a dispatcher console and a portal where customers track their shipments online. GPS data and paperwork in one place.'
    },
    'shifo-navbat': {
      summary: 'Online booking and e-health records for a clinic chain',
      tags: ['Healthcare', 'Automation'],
      awards: ['−40% waiting time'],
      description:
        'Online appointments, reminders, electronic patient records and clinic workload analytics. Patients can also book through a Telegram bot.'
    },
    'bozor-hub': {
      summary: 'B2B ordering platform for wholesale trade',
      tags: ['E-commerce', 'Integration'],
      awards: ['Orders 24/7'],
      description:
        'A dealer portal with custom pricing, stock levels and orders synced with 1C. Sales managers spend their time on customers, not on data entry.'
    }
  },
  ui: {
    skipLink: 'Skip to main content',
    header: {
      logoAria: '3dot — home',
      navAria: 'Main menu',
      cta: 'Discuss a project',
      menuOpen: 'Open menu',
      menuClose: 'Close menu'
    },
    modal: {
      close: 'Close',
      title: 'Hi! Let’s talk about your next project — and make it your best yet',
      name: 'Your name',
      contact: 'Phone, email or @telegram',
      budget: 'Budget',
      message: 'Message',
      consent: 'I agree to the processing of my personal data',
      send: 'Send',
      sending: 'Sending…',
      doneTitle: 'Thank you!',
      doneText: 'We’ll review your request and get back to you shortly.',
      telegram: 'Message us on Telegram'
    },
    footer: { navAria: 'Footer navigation' },
    hero: { scroll: 'scroll', index: '(IT solutions ’26)', cta: 'Discuss a project' },
    intro: { eyebrow: 'about the studio' },
    services: { eyebrow: 'services' },
    stats: { eyebrow: 'experience' },
    projects: {
      eyebrow: 'selected work',
      title: 'Projects',
      count: (n: number) => `${n} ${n === 1 ? 'case study' : 'case studies'}`,
      cursor: 'View'
    },
    expertise: {
      eyebrow: 'expertise',
      title: 'A tailored approach to every task',
      tabsAria: 'Service areas',
      stackLabel: 'our stack',
      clientsAria: 'Clients'
    },
    process: {
      eyebrow: 'process',
      title: 'How we work',
      text: 'Every stage ends with a concrete deliverable, so you always know where the project stands.'
    },
    faq: { pricingEyebrow: 'pricing', pricingTitle: 'Website development cost', eyebrow: 'frequently asked questions' },
    contact: { eyebrow: 'let’s get to know each other', title: 'Got a project in mind?', button: 'Get in touch', cursor: 'Write us' },
    project: {
      back: '← all projects',
      year: 'Year',
      stack: 'Stack',
      results: 'Results',
      next: 'next project',
      nextCursor: 'Next'
    },
    error: {
      code: 'error',
      notFound: 'Page not found',
      generic: 'Something went wrong',
      home: 'Back to home',
      projectNotFound: 'Project not found'
    },
    theme: {
      toLight: 'Switch to light theme',
      toDark: 'Switch to dark theme',
      nowLight: 'Light theme on',
      nowDark: 'Dark theme on',
      cursor: 'Theme'
    },
    lang: { nav: 'Language', uz: 'O‘zbekcha', ru: 'Русский', en: 'English' },
    coverLabel: (title: string) => `${title} project cover`
  }
} satisfies SiteCopy
