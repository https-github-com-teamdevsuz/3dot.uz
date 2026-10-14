import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'

/**
 * Smooth scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger and the
 * WebGL scene read exactly the same scroll position every frame.
 */
export default defineNuxtPlugin((nuxtApp) => {
  gsap.registerPlugin(ScrollTrigger)

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const lenis = reducedMotion
    ? null
    : new Lenis({
        duration: 1.15,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
        wheelMultiplier: 0.95,
        touchMultiplier: 1.4
      })

  if (lenis) {
    lenis.on('scroll', ScrollTrigger.update)
    gsap.ticker.add((time) => lenis.raf(time * 1000))
    gsap.ticker.lagSmoothing(0)
  }

  const scrollTo = (target: string | number | HTMLElement, offset = 0) => {
    if (lenis) lenis.scrollTo(target, { offset, duration: 1.4 })
    else if (typeof target === 'number') window.scrollTo({ top: target })
    else {
      const el = typeof target === 'string' ? document.querySelector(target) : target
      el?.scrollIntoView()
    }
  }

  // after each page swap: reset scroll and let ScrollTrigger re-measure
  nuxtApp.hook('page:finish', () => {
    const hash = window.location.hash
    if (lenis) lenis.scrollTo(0, { immediate: true })
    else window.scrollTo(0, 0)
    requestAnimationFrame(() => ScrollTrigger.refresh())

    if (!hash) return
    if (document.querySelector(hash)) scrollTo(hash)
    // with out-in page transitions the target may only exist once the enter animation is done
    else nuxtApp.hooks.hookOnce('page:transition:finish', () => document.querySelector(hash) && scrollTo(hash))
  })

  return {
    provide: {
      lenis,
      scrollTo,
      reducedMotion
    }
  }
})
