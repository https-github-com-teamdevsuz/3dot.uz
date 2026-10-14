// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // <HeroSection/> instead of <SectionsHeroSection/>
  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      htmlAttrs: { lang: 'uz' },
      title: '3dot — raqamlashtirish va IT-yechimlar',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'description', content: '3dot — biznes va davlat tashkilotlari uchun raqamlashtirish: CRM, ERP, avtomatlashtirish, web-ilovalar va saytlar.' },
        { name: 'theme-color', content: '#050505' },
        { property: 'og:title', content: '3dot — raqamlashtirish va IT-yechimlar' },
        { property: 'og:type', content: 'website' }
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Unbounded:wght@300;400;600&family=Manrope:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap'
        }
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' }
  },

  // three.js is heavy: keep it in its own chunk, loaded only on the client
  vite: {
    $client: {
      build: {
        rollupOptions: {
          output: {
            manualChunks(id: string) {
              if (id.includes('node_modules/three')) return 'three'
              if (id.includes('node_modules/gsap') || id.includes('node_modules/lenis')) return 'motion'
            }
          }
        }
      }
    }
  },

  nitro: {
    prerender: { routes: ['/'], crawlLinks: true }
  },

  typescript: { strict: true }
})
