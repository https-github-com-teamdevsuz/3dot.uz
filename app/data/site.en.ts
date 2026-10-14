import type { SiteCopy } from './site'

// English (US) — edited by the linguist from site.uz.ts (glossary: docs/sdlc/2026-10-i18n-theme/10-localization.md).
export default {
  site: {
    tagline: ['One system', 'instead of Excel.'],
    role: 'digital solutions',
    city: 'Tashkent',
    heroLead: 'CRM and ERP for sales, inventory and documents. We review your processes for free and show you what’s worth automating.',
    intro:
      'We digitize how businesses and government agencies work: from paper and Excel sheets to orderly, automated systems. Every solution is built around the way you actually work.',
    nav: [
      { label: 'Services', hash: '#services' },
      { label: 'Projects', hash: '#projects' },
      { label: 'Pricing', hash: '#pricing' },
      { label: 'Contact', hash: '#contact' }
    ]
  },
  servicesTitle: 'Which process should we streamline?',
  services: [
    { title: 'CRM', sub: 'Customers and sales in one place, not in Excel.', bullets: ['Lead and deal pipeline', 'Reminders and tasks', 'Sales reports'] },
    { title: 'ERP and inventory', sub: 'Stock, purchasing and orders in real time.', bullets: ['Live stock levels', 'Purchase and order control', 'Stocktaking'] },
    { title: 'Document management', sub: 'Digital approvals and tracking instead of paper.', bullets: ['Digital approvals', 'Deadline and execution control', 'Document archive'] },
    { title: 'Integrations', sub: '1C, Payme, Click and Telegram share data on their own, with no manual entry.', bullets: ['Data exchange with 1C', 'Payme and Click payments', 'Telegram notifications'] }
  ],
  stats: {
    numbers: ['Systems delivered', 'Years in business']
  },
  process: [
    { title: 'Audit', text: 'We study your processes and find where time and money leak' },
    { title: 'Design', text: 'Technical specification, system architecture and a UI prototype' },
    { title: 'Development', text: 'We build in stages and demo progress every two weeks' },
    { title: 'Rollout', text: 'Data migration, integration with your existing software, testing' },
    { title: 'Training', text: 'We train your team and write the user guides' },
    { title: 'Support', text: 'Monitoring, bug fixes and ongoing improvements' }
  ],
  pricing: {
    audit: { label: 'Process audit', value: 'free, 1–2 days' },
    project: { label: 'Project cost', from: (p: string) => `from ${p}`, note: 'Final price follows the free audit.' }
  },
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
    cta: { label: 'Get a free audit', telegram: 'Message us on Telegram' },
    sectionCta: { projects: 'Need a system like this?', process: 'Step one: a free audit.', faq: 'More questions? Ask us at the audit.', project: 'Need a system like this?' },
    header: {
      logoAria: '3dot — home',
      navAria: 'Main menu',
      menuOpen: 'Open menu',
      menuClose: 'Close menu'
    },
    modal: {
      close: 'Close',
      title: 'Book your free audit',
      note: 'We’ll get back to you within one business day. No obligation.',
      name: 'Your name',
      contact: 'Phone, email or @telegram',
      budget: 'Rough budget (optional)',
      message: 'Message (optional)',
      consent: 'I agree to the processing of my personal data',
      send: 'Book the audit',
      sending: 'Sending…',
      doneTitle: 'Thank you!',
      doneText: 'We’ll review your request and get back to you shortly.',
      error: 'We couldn’t send your request. Message us on Telegram or try again.',
      throttled: 'Request sent. Please wait 30 seconds before sending another.',
      telegram: 'Message us on Telegram',
      errName: 'Enter your name',
      errContact: 'Enter a phone, email or @telegram',
      errConsent: 'Please give consent to continue',
      retry: 'Try again'
    },
    footer: { navAria: 'Footer navigation' },
    intro: { eyebrow: 'about the studio' },
    services: { eyebrow: 'services', also: 'Also: websites, mobile apps, BI' },
    projects: {
      eyebrow: 'selected work',
      title: 'Projects',
      count: (n: number) => `${n} ${n === 1 ? 'case study' : 'case studies'}`,
      cursor: 'View'
    },
    process: {
      eyebrow: 'process',
      title: 'How we work',
      text: 'Every stage ends with a concrete deliverable, so you always know where the project stands.'
    },
    faq: { integrations: 'Integrations', pricingEyebrow: 'pricing', pricingTitle: 'What does a project cost?', eyebrow: 'frequently asked questions' },
    contact: { eyebrow: 'let’s get to know each other', title: 'We’ll show you where your processes lose time — for free', button: 'Free audit', cursor: 'Audit' },
    project: {
      back: '← all projects',
      year: 'Year',
      stack: 'Stack',
      results: 'Results',
      next: 'next project',
      nextCursor: 'Next',
      nda: 'Client name under NDA'
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
