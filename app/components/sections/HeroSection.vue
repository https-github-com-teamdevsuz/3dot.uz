<script setup lang="ts">
import gsap from 'gsap'
import { telegram } from '~/data/site'

const t = useSite()

const root = ref<HTMLElement | null>(null)
const preloaded = usePreloaded()
const { show } = useContactModal()
let ctx: gsap.Context | undefined

const playIntro = () => {
  if (!root.value) return
  ctx = gsap.context(() => {
    gsap.from('.hero__line-inner', { yPercent: 110, rotate: 3, duration: 1.4, ease: 'expo.out', stagger: 0.09 })
    gsap.from('[data-hero-fade]', { autoAlpha: 0, y: 24, duration: 1.2, ease: 'expo.out', stagger: 0.08, delay: 0.5 })

    // scroll away: headline drifts up and dissolves
    gsap.to('.hero__title', {
      yPercent: -18,
      autoAlpha: 0.15,
      ease: 'none',
      scrollTrigger: { trigger: root.value, start: 'top top', end: 'bottom top', scrub: true }
    })
  }, root.value)
}

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  if (preloaded.value) playIntro()
  else {
    gsap.set(root.value!.querySelectorAll('.hero__line-inner, [data-hero-fade]'), { autoAlpha: 0 })
    const stop = watch(preloaded, (v) => {
      if (!v) return
      stop()
      gsap.set(root.value!.querySelectorAll('.hero__line-inner, [data-hero-fade]'), { autoAlpha: 1 })
      playIntro()
    })
  }
})
onBeforeUnmount(() => ctx?.revert())
</script>

<template>
  <section ref="root" class="hero" data-scene="hero" aria-labelledby="hero-title">
    <div class="hero__top container">
      <span class="eyebrow" data-hero-fade>{{ t.site.role }} — {{ t.site.city }}</span>
    </div>

    <h1 id="hero-title" class="hero__title display container">
      <span v-for="(word, i) in t.site.tagline" :key="word" class="hero__line" :class="`hero__line--${i}`">
        <span class="hero__line-inner">{{ word }}</span>
      </span>
    </h1>

    <div class="hero__bottom container">
      <div class="hero__cta" data-hero-fade>
        <p>{{ t.site.heroLead }}</p>
        <div class="hero__actions">
          <button class="btn btn--solid" type="button" data-cta="hero" @click="show">{{ t.ui.cta.label }} <span aria-hidden="true">→</span></button>
          <a class="hero__tg" :href="telegram" target="_blank" rel="noopener" data-cta="telegram">
            {{ t.ui.cta.telegram }} <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero {
  position: relative;
  min-height: 100svh;
  display: grid;
  grid-template-rows: auto 1fr auto;
  padding-top: 110px;
  padding-bottom: 36px;
}
.hero__title {
  align-self: center;
  font-size: var(--fs-h1);
  display: flex;
  flex-direction: column;
  text-wrap: balance;
  will-change: transform;
}
.hero__line {
  display: block;
  overflow: hidden;
  padding-bottom: 0.04em;
}
.hero__line-inner {
  display: inline-block;
}
.hero__line--1 {
  padding-left: 18%;
  color: transparent;
  -webkit-text-stroke: 1.5px var(--fg);
}
.hero__bottom {
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: end;
  gap: 32px;
}
.hero__cta {
  justify-self: end;
  display: grid;
  gap: 20px;
  max-width: 440px;
}
.hero__cta p {
  max-width: 44ch;
  text-wrap: pretty;
}
.hero__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 24px;
}
.hero__actions .btn {
  height: 56px;
  padding: 0 28px;
}
.hero__tg {
  font-weight: 600;
  padding-block: 12px;
  border-bottom: 1px solid var(--line-strong);
  transition: color 0.3s var(--ease-out), border-color 0.3s var(--ease-out);
}
.hero__tg:hover {
  color: var(--accent-ink);
  border-color: var(--accent-ink);
}
@media (max-width: 900px) {
  .hero__bottom {
    grid-template-columns: 1fr;
  }
  .hero__cta {
    justify-self: start;
    order: -1;
  }
  .hero__line--1 {
    padding-left: 8%;
  }
}
@media (max-width: 560px) {
  .hero__line--1 {
    padding-left: 0;
  }
  .hero__actions {
    flex-direction: column;
    align-items: stretch;
    gap: 8px;
  }
  .hero__tg {
    text-align: center;
    border-bottom: 0;
    min-height: 44px;
  }
}
</style>
