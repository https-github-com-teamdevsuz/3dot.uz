import { DEFAULT_LOCALE, LOCALES, PROJECT_SLUGS } from './app/data/site'

const prefixes = LOCALES.map((l) => (l === DEFAULT_LOCALE ? '' : `/${l}`))

// Runs before first paint: sets data-theme, and redirects to the stored ru/en locale (US-3).
const themeLocaleScript = `(function(){var d=document.documentElement,t,l,p=location.pathname;try{t=localStorage.getItem('3dot:theme');l=localStorage.getItem('3dot:locale')}catch(e){}d.dataset.theme=t==='light'||t==='dark'?t:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if((l==='ru'||l==='en')&&!/^\\/(ru|en)(\\/|$)/.test(p))location.replace('/'+l+(p==='/'?'':p)+location.search+location.hash)})()`

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  css: ['~/assets/css/main.css'],

  // <HeroSection/> instead of <SectionsHeroSection/>
  components: [{ path: '~/components', pathPrefix: false }],

  app: {
    head: {
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, maximum-scale=5' },
        { name: 'theme-color', media: '(prefers-color-scheme: dark)', content: '#050505' },
        { name: 'theme-color', media: '(prefers-color-scheme: light)', content: '#f4f3ee' },
        { property: 'og:type', content: 'website' }
      ],
      script: [{ innerHTML: themeLocaleScript, tagPosition: 'head', tagPriority: 'critical' }],
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

  // every page is duplicated under /ru and /en (locale comes from the path prefix)
  hooks: {
    'pages:extend'(pages) {
      for (const p of [...pages]) {
        for (const l of LOCALES) {
          if (l === DEFAULT_LOCALE) continue
          pages.push({ ...p, name: p.name ? `${p.name}___${l}` : undefined, path: `/${l}${p.path === '/' ? '' : p.path}` })
        }
      }
    }
  },

  nitro: {
    prerender: {
      crawlLinks: true,
      autoSubfolderIndex: false, // /ru -> ru.html: served at the slash-less canonical, no Pages 301
      routes: prefixes.flatMap((x) => [x || '/', ...PROJECT_SLUGS.map((s) => `${x}/projects/${s}`)])
    }
  },

  typescript: { strict: true }
})
