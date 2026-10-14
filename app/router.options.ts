import type { RouterConfig } from '@nuxt/schema'

// Scrolling is handled by Lenis: cross-page navigation in plugins/motion.client.ts
// (page:finish hook), same-page hash links here.
export default <RouterConfig>{
  scrollBehavior(to, from) {
    if (import.meta.client && to.hash && to.path === from.path) {
      useNuxtApp().$scrollTo(to.hash)
    }
    return false
  }
}
