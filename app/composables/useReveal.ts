import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import type { Ref } from 'vue'

/** Wrap every word of an element in a masked span so it can slide up. Idempotent. */
export function splitWords(el: HTMLElement): HTMLElement[] {
  if (el.dataset.splitDone) return Array.from(el.querySelectorAll<HTMLElement>('.split-inner'))
  const text = el.textContent ?? ''
  el.setAttribute('aria-label', text.trim())
  el.textContent = ''
  const inners: HTMLElement[] = []
  text.split(/(\s+)/).forEach((chunk) => {
    if (!chunk) return
    if (/^\s+$/.test(chunk)) {
      el.appendChild(document.createTextNode(' '))
      return
    }
    const line = document.createElement('span')
    line.className = 'split-line split-word'
    line.setAttribute('aria-hidden', 'true')
    const inner = document.createElement('span')
    inner.className = 'split-inner'
    inner.textContent = chunk
    line.appendChild(inner)
    el.appendChild(line)
    inners.push(inner)
  })
  el.dataset.splitDone = '1'
  return inners
}

/**
 * Scroll-triggered reveals inside `root`:
 *  - [data-split]        words slide up from a mask
 *  - [data-reveal]       fade + rise (value = delay in seconds, optional)
 *  - [data-scrub-words]  words light up one by one while scrolling
 *  - [data-parallax]     moves at a different speed (value = strength, e.g. 0.2)
 */
export function useReveal(root: Ref<HTMLElement | null | undefined>) {
  let ctx: gsap.Context | undefined

  onMounted(() => {
    if (!root.value) return
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    ctx = gsap.context(() => {
      root.value!.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => {
        const words = splitWords(el)
        if (reduced) return
        gsap.from(words, {
          yPercent: 115,
          rotate: 4,
          duration: 1.15,
          ease: 'expo.out',
          stagger: 0.035,
          delay: Number(el.dataset.split) || 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true }
        })
      })

      root.value!.querySelectorAll<HTMLElement>('[data-reveal]').forEach((el) => {
        if (reduced) return
        gsap.from(el, {
          autoAlpha: 0,
          y: 48,
          duration: 1.2,
          ease: 'expo.out',
          delay: Number(el.dataset.reveal) || 0,
          scrollTrigger: { trigger: el, start: 'top 90%', once: true }
        })
      })

      root.value!.querySelectorAll<HTMLElement>('[data-scrub-words]').forEach((el) => {
        const words = splitWords(el)
        if (reduced) return
        gsap.fromTo(
          words,
          { opacity: 0.16 },
          {
            opacity: 1,
            ease: 'none',
            stagger: 0.08,
            scrollTrigger: { trigger: el, start: 'top 80%', end: 'bottom 45%', scrub: true }
          }
        )
      })

      root.value!.querySelectorAll<HTMLElement>('[data-parallax]').forEach((el) => {
        if (reduced) return
        const strength = Number(el.dataset.parallax) || 0.15
        gsap.fromTo(
          el,
          { yPercent: -strength * 100 },
          {
            yPercent: strength * 100,
            ease: 'none',
            scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true }
          }
        )
      })
    }, root.value)
  })

  onBeforeUnmount(() => ctx?.revert())

  return {
    refresh: () => ScrollTrigger.refresh()
  }
}
