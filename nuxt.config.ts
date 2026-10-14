import { DEFAULT_LOCALE, LOCALES, PROJECT_SLUGS } from './app/data/site'

const prefixes = LOCALES.map((l) => (l === DEFAULT_LOCALE ? '' : `/${l}`))

// Runs before first paint: sets data-theme, and redirects to the stored ru/en locale (US-3).
const themeLocaleScript = `(function(){var d=document.documentElement,t,l,p=location.pathname;try{t=localStorage.getItem('3dot:theme');l=localStorage.getItem('3dot:locale')}catch(e){}d.dataset.theme=t==='light'||t==='dark'?t:(matchMedia('(prefers-color-scheme: light)').matches?'light':'dark');if((l==='ru'||l==='en')&&!/^\\/(ru|en)(\\/|$)/.test(p))location.replace('/'+l+(p==='/'?'':p)+location.search+location.hash)})()`

// client file names of the lazy ru/en copy chunks, filled by build:manifest, read at prerender
const copyChunks: Record<string, string> = {}
// app base/cdn/buildAssetsDir, captured from the resolved Nuxt options in the `ready` hook
let assetBase = '/_nuxt/'
let baseURL = '/'
const join = (...p: string[]) => p.join('/').replace(/(^|[^:])\/{2,}/g, '$1/')

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-01',
  devtools: { enabled: true },

  runtimeConfig: {
    public: { leadEndpoint: 'https://lead-relay.example.workers.dev/lead', showPlaceholders: '' }
  },

  css: ['~/assets/css/fonts.css', '~/assets/css/main.css'],

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
        // fonts are self-hosted (app/assets/css/fonts.css); preload only the above-the-fold display face
        { rel: 'preload', as: 'font', type: 'font/woff2', href: '/fonts/unbounded-latin.woff2', crossorigin: '' }
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
    ready(nuxt) {
      const { baseURL: b = '/', cdnURL, buildAssetsDir = '/_nuxt/' } = nuxt.options.app
      baseURL = b
      assetBase = join(cdnURL || b, buildAssetsDir, '/')
    },
    'pages:extend'(pages) {
      for (const p of [...pages]) {
        for (const l of LOCALES) {
          if (l === DEFAULT_LOCALE) continue
          pages.push({ ...p, name: p.name ? `${p.name}___${l}` : undefined, path: `/${l}${p.path === '/' ? '' : p.path}` })
        }
      }
    },
    'build:manifest'(manifest) {
      // remember the ru/en copy chunk names for the modulepreload injected at prerender (below)
      for (const [id, m] of Object.entries(manifest)) {
        const l = /data\/site\.(ru|en)\.ts$/.exec(id)?.[1]
        if (l) copyChunks[l] = m.file
      }
    }
  },

  nitro: {
    hooks: {
      // /ru and /en import their copy chunk in the locale middleware before hydration;
      // preload it with the entry instead of discovering it one round trip later
      'prerender:generate'(route) {
        const l = /^\/(ru|en)(\/|$)/.exec(route.route)?.[1]
        if (!l || !route.contents || !route.fileName?.endsWith('.html')) return
        if (!copyChunks[l]) console.warn(`[prerender] no ${l} copy chunk in manifest, modulepreload skipped for ${route.route}`)
        const links = [
          copyChunks[l] && `<link rel="modulepreload" as="script" crossorigin href="${join(assetBase, copyChunks[l])}">`,
          l === 'ru' && `<link rel="preload" as="font" type="font/woff2" crossorigin href="${join(baseURL, 'fonts/unbounded-cyrillic.woff2')}">`
        ].filter(Boolean).join('')
        route.contents = route.contents.replace('</head>', `${links}</head>`)
      }
    },
    prerender: {
      crawlLinks: true,
      autoSubfolderIndex: false, // /ru -> ru.html: served at the slash-less canonical, no Pages 301
      routes: prefixes.flatMap((x) => [x || '/', ...PROJECT_SLUGS.map((s) => `${x}/projects/${s}`)])
    }
  },

  typescript: { strict: true }
})
