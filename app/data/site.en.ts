import type { SiteCopy } from './site'

// DRAFT translation (English) — needs native-speaker review before launch.
export default {
  meta: {
    title: '3dot — digitalization and IT solutions',
    description:
      'We digitalize business and government processes: CRM, ERP, automation, web apps and websites.',
    ogLocale: 'en_US'
  },
  site: {
    tagline: ['digital.', 'systems.', 'growth'],
    role: 'digital solutions',
    city: 'Tashkent',
    heroLead: 'One system instead of paper, Excel and scattered tools. CRM, ERP and process automation.',
    intro:
      'We digitalize the processes of businesses and government bodies: from paper and Excel sheets to orderly, automated systems. Every solution is built around your own workflows.',
    nav: [
      { label: 'Company', hash: '#intro' },
      { label: 'Projects', hash: '#projects' },
      { label: 'Services', hash: '#services' },
      { label: 'Contact', hash: '#contact' }
    ]
  },
  servicesTitle: 'Digital solutions',
  services: [
    { title: 'CRM systems', sub: 'Clients / Sales / Funnel' },
    { title: 'ERP and warehouse', sub: 'Production / Warehouse / Finance' },
    { title: 'Automation', sub: 'Business processes / Bots' },
    { title: 'Electronic documents', sub: 'Document flow / Execution control' },
    { title: 'Web applications', sub: 'Portals / Dashboards / SaaS' },
    { title: 'Websites', sub: 'Corporate / Landing / 3D' },
    { title: 'E-commerce', sub: 'Online stores / Payment systems' },
    { title: 'Integrations', sub: '1C / API / Payme / Click' },
    { title: 'Mobile apps', sub: 'iOS / Android' },
    { title: 'Analytics and BI', sub: 'Dashboards / Reports' },
    { title: 'SEO and SMM', sub: 'Traffic / Content / Ads' },
    { title: 'Support', sub: 'Monitoring / SLA / Growth' }
  ],
  stats: {
    headline: 'Experience delivering complex systems',
    caption: 'business processes automated',
    awards: ['Public sector', 'Retail', 'Manufacturing', 'Logistics'],
    numbers: ['Systems delivered', 'Years on the market']
  },
  serviceTabs: [
    { title: 'Digitalization', text: 'We study your processes and turn them into a system', items: ['Audit', 'CRM / ERP', 'Document flow', 'Bots'] },
    { title: 'Development', text: 'Web, mobile and backend — in one team', items: ['Nuxt / Vue', 'Node.js / Laravel', 'Flutter', 'PostgreSQL'] },
    { title: 'Integration', text: 'We connect your existing software to each other', items: ['1C', 'Payme / Click', 'Telegram', 'API'] },
    { title: 'Marketing', text: 'The system is ready — now you need a flow of customers', items: ['SEO', 'SMM', 'Google Ads', 'Yandex Direct'] },
    { title: 'Support', text: 'We stay by your side after the release', items: ['Monitoring', 'SLA', 'Training', 'Growth'] }
  ],
  stack: ['Nuxt / Vue', 'Node.js', 'Laravel', 'PostgreSQL', '1C integration', 'Telegram API', 'Docker / DevOps', 'three.js'],
  process: [
    { title: 'Audit', text: 'We study your processes and find where time and money are being lost' },
    { title: 'Design', text: 'Technical specification, system architecture and an interface prototype' },
    { title: 'Development', text: 'We build in stages and show you the result every 2 weeks' },
    { title: 'Rollout', text: 'Data migration, integration with existing software, testing' },
    { title: 'Training', text: 'We train your staff and prepare user guides' },
    { title: 'Support', text: 'Monitoring, bug fixing and further development of the system' }
  ],
  pricing: [
    { label: 'Process audit and consultation', value: 'free' },
    { label: 'Project cost', value: 'custom estimate' }
  ],
  faq: [
    {
      q: 'Everything we have is in Excel. Where do we start?',
      a: 'With a free audit. We study your processes and show what to automate first for the biggest payoff.'
    },
    {
      q: 'Is it better to buy ready-made software or build a custom one?',
      a: 'We offer both. If a ready-made system (a CRM, for example) is enough, we configure it; if your processes are unique, we build a custom solution.'
    },
    {
      q: 'Do you work with our existing 1C and other software?',
      a: 'Yes. We integrate 1C, payment systems (Payme, Click), Telegram and other services, so nobody has to enter the same data twice.'
    },
    {
      q: 'Who supports the system after launch?',
      a: 'We do. We train your staff, monitor the system and keep developing it under a monthly support agreement.'
    }
  ],
  budgets: ['up to $3k', '$3–10k', '$10–30k', '$30–100k', '$100k+'],
  projects: {
    'ijro-pro': {
      summary: 'Execution control system for a government agency',
      tags: ['Public sector', 'Document flow'],
      awards: ['−70% paper', '3 days → 1 day'],
      description:
        'Assigning tasks, tracking deadlines and collecting execution reports automatically. Managers see the status of every department on a single dashboard and get a Telegram alert when a deadline is missed.'
    },
    'savdo-360': {
      summary: 'CRM and loyalty program for a retail chain',
      tags: ['CRM', 'Retail'],
      awards: ['+24% repeat purchases'],
      description:
        'Customer base, bonus cards, SMS and Telegram notifications, and sales analytics by branch. Real-time integration with cash registers and 1C.'
    },
    'zavod-erp': {
      summary: 'ERP for a manufacturing company',
      tags: ['ERP', 'Manufacturing'],
      awards: ['Warehouse 100% digital'],
      description:
        'From raw material intake to finished goods dispatch: warehouse, production plans, cost calculation and daily reports for management.'
    },
    'yuk-track': {
      summary: 'Cargo tracking platform for a logistics company',
      tags: ['Logistics', 'Web app'],
      awards: ['Customer calls −60%'],
      description:
        'A mobile app for drivers, a dispatcher panel and a portal where customers track their cargo online. GPS data and documents in one place.'
    },
    'shifo-navbat': {
      summary: 'Online queue and electronic records for a clinic network',
      tags: ['Healthcare', 'Automation'],
      awards: ['Waiting time −40%'],
      description:
        'Online doctor appointments, reminders, electronic patient records and clinic load analytics. Patients can also book through a Telegram bot.'
    },
    'bozor-hub': {
      summary: 'B2B online platform for wholesale trade',
      tags: ['E-commerce', 'Integration'],
      awards: ['Orders 24/7'],
      description:
        'A personal account for dealers, individual prices, stock levels and orders synced with 1C. Managers talk to customers instead of typing data by hand.'
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
      title: 'Hi! Let’s talk about your next best project',
      name: 'Your name',
      contact: 'Phone, e-mail or @telegram',
      budget: 'Budget',
      message: 'Message',
      consent: 'I agree to the processing of personal data',
      send: 'Send',
      sending: 'Sending…',
      doneTitle: 'Thank you!',
      doneText: 'We will review your request and get back to you soon.',
      telegram: 'Message us on Telegram'
    },
    footer: { navAria: 'Footer menu' },
    hero: { scroll: 'scroll', index: '(IT solutions ’26)', cta: 'Discuss a project' },
    intro: { eyebrow: 'about the studio' },
    services: { eyebrow: 'services' },
    stats: { eyebrow: 'experience' },
    projects: {
      eyebrow: 'selected work',
      title: 'Projects',
      count: (n: number) => `${n} case studies`,
      cursor: 'View'
    },
    expertise: {
      eyebrow: 'expertise',
      title: 'An individual approach to every task',
      tabsAria: 'Service areas',
      stackLabel: 'development tools',
      clientsAria: 'Clients'
    },
    process: {
      eyebrow: 'process',
      title: 'How we work',
      text: 'Every stage ends with a concrete result, so you always know where the project stands.'
    },
    faq: { pricingEyebrow: 'pricing', pricingTitle: 'Website development cost', eyebrow: 'frequently asked questions' },
    contact: { eyebrow: 'let’s get acquainted', title: 'Shall we discuss a project?', button: 'Write', cursor: 'Write' },
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
