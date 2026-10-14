<script setup lang="ts">
import gsap from 'gsap'

import { brand } from '~/data/site'
const t = useSite()

const root = ref<HTMLElement | null>(null)
const marquee = ref<HTMLElement | null>(null)
useReveal(root)

let tween: gsap.core.Tween | undefined
onMounted(() => {
  if (!marquee.value || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  tween = gsap.to(marquee.value, {
    xPercent: -50,
    ease: 'none',
    scrollTrigger: { trigger: root.value, start: 'top bottom', end: 'bottom top', scrub: 0.6 }
  })
})
onBeforeUnmount(() => {
  tween?.scrollTrigger?.kill()
  tween?.kill()
})
</script>

<template>
  <section id="intro" ref="root" class="intro section" data-scene="intro">
    <div class="intro__marquee" aria-hidden="true">
      <div ref="marquee" class="intro__track display">
        <span v-for="n in 4" :key="n">{{ brand }} <em>{{ t.site.role }}</em> —&nbsp;</span>
      </div>
    </div>

    <div class="intro__grid container">
      <span class="eyebrow" data-reveal>{{ t.ui.intro.eyebrow }}</span>
      <p class="intro__text lead" data-scrub-words>{{ t.site.intro }}</p>
      <dl class="intro__numbers">
        <div v-for="n in t.stats.numbers" :key="n.label" data-reveal>
          <dt class="display"><CountUp :to="n.value" :suffix="n.suffix" /></dt>
          <dd class="dim">{{ n.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
.intro__marquee {
  overflow: hidden;
  margin-bottom: clamp(64px, 12vh, 140px);
}
.intro__track {
  display: flex;
  width: max-content;
  font-size: clamp(4rem, 14vw, 14rem);
  white-space: nowrap;
}
.intro__track em {
  font-style: normal;
  color: transparent;
  -webkit-text-stroke: 1px var(--fg-dim);
}
.intro__grid {
  display: grid;
  grid-template-columns: 1fr 2.4fr;
  gap: 48px 32px;
}
.intro__text {
  max-width: 28ch;
}
.intro__numbers {
  grid-column: 2;
  display: flex;
  gap: clamp(32px, 8vw, 120px);
  border-top: 1px solid var(--line);
  padding-top: 32px;
}
.intro__numbers dt {
  font-size: clamp(3rem, 7vw, 6.5rem);
}
@media (max-width: 900px) {
  .intro__grid {
    grid-template-columns: 1fr;
  }
  .intro__numbers {
    grid-column: 1;
  }
}
</style>
