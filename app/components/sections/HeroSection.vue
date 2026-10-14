<script setup lang="ts">
import gsap from 'gsap'

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
      <span class="mono dim hero__index" data-hero-fade>{{ t.ui.hero.index }}</span>
    </div>

    <h1 id="hero-title" class="hero__title display container">
      <span v-for="(word, i) in t.site.tagline" :key="word" class="hero__line" :class="`hero__line--${i}`">
        <span class="hero__line-inner">{{ word }}</span>
      </span>
    </h1>

    <div class="hero__bottom container">
      <div class="hero__scroll mono" data-hero-fade>
        <span class="hero__scroll-dot" />
        {{ t.ui.hero.scroll }}
      </div>
      <ul class="hero__awards" data-hero-fade>
        <li v-for="a in t.stats.awards.slice(0, 3)" :key="a.name">
          <span class="mono dim">{{ a.name }}</span>
          <strong>{{ a.count }}+</strong>
        </li>
      </ul>
      <div class="hero__cta" data-hero-fade>
        <p class="dim">{{ t.site.heroLead }}</p>
        <button class="btn btn--solid" type="button" @click="show">{{ t.ui.hero.cta }} <span aria-hidden="true">→</span></button>
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
.hero__top {
  display: flex;
  justify-content: space-between;
}
.hero__title {
  align-self: center;
  font-size: var(--fs-hero);
  display: flex;
  flex-direction: column;
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
.hero__line--2 {
  text-align: right;
}
.hero__bottom {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
  gap: 32px;
}
.hero__scroll {
  display: inline-flex;
  align-items: center;
  gap: 12px;
}
.hero__scroll-dot {
  width: 22px;
  height: 36px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
  position: relative;
}
.hero__scroll-dot::after {
  content: '';
  position: absolute;
  left: 50%;
  top: 7px;
  width: 4px;
  height: 7px;
  translate: -50% 0;
  border-radius: 2px;
  background: var(--accent-ink);
  animation: scroll-dot 1.8s var(--ease-in-out) infinite;
}
@keyframes scroll-dot {
  0% { transform: translateY(0); opacity: 1; }
  70% { transform: translateY(14px); opacity: 0; }
  100% { transform: translateY(0); opacity: 0; }
}
.hero__awards {
  display: flex;
  gap: 28px;
}
.hero__awards li {
  display: grid;
  gap: 2px;
}
.hero__awards strong {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: 1.6rem;
}
.hero__cta {
  justify-self: end;
  display: grid;
  gap: 20px;
  max-width: 340px;
}
@media (max-width: 900px) {
  .hero__bottom {
    grid-template-columns: 1fr;
  }
  .hero__cta {
    justify-self: start;
  }
  .hero__line--1 {
    padding-left: 8%;
  }
  .hero__index {
    display: none;
  }
}
</style>
