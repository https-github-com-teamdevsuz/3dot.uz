<script setup lang="ts">
import gsap from 'gsap'

const t = useSite()

const root = ref<HTMLElement | null>(null)
const line = ref<HTMLElement | null>(null)
useReveal(root)

let tween: gsap.core.Tween | undefined
onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  tween = gsap.fromTo(
    line.value,
    { scaleY: 0 },
    {
      scaleY: 1,
      ease: 'none',
      scrollTrigger: { trigger: root.value!.querySelector('.process__list'), start: 'top 70%', end: 'bottom 70%', scrub: true }
    }
  )
})
onBeforeUnmount(() => {
  tween?.scrollTrigger?.kill()
  tween?.kill()
})
</script>

<template>
  <section ref="root" class="process section" data-scene="process">
    <div class="process__grid container">
      <header class="process__head">
        <span class="eyebrow" data-reveal>{{ t.ui.process.eyebrow }}</span>
        <h2 class="h2" data-split>{{ t.ui.process.title }}</h2>
        <p class="dim" data-reveal>
          {{ t.ui.process.text }}
        </p>
      </header>

      <div class="process__list">
        <span ref="line" class="process__line" aria-hidden="true" />
        <ol>
        <li v-for="(step, i) in t.process" :key="step.title" class="process__step" data-reveal>
          <span class="process__num display">0{{ i + 1 }}</span>
          <div>
            <h3 class="process__title">{{ step.title }}</h3>
            <p class="dim">{{ step.text }}</p>
          </div>
        </li>
        </ol>
        <SectionCta class="process__cta" :text="t.ui.sectionCta.process" />
      </div>
    </div>
  </section>
</template>

<style scoped>
.process__grid {
  display: grid;
  grid-template-columns: 1fr 1.6fr;
  gap: 64px;
}
.process__head {
  position: sticky;
  top: 120px;
  align-self: start;
  display: grid;
  gap: 24px;
}
.process__head p {
  max-width: 34ch;
}
.process__list {
  position: relative;
  display: grid;
  padding-left: 40px;
}
.process__list::before,
.process__line {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: var(--line);
}
.process__line {
  background: var(--accent-ink);
  transform-origin: top;
  box-shadow: var(--glow);
}
.process__cta {
  justify-self: start;
  margin-top: clamp(48px, 8vh, 96px);
}
.process__step {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 24px;
  padding-block: 36px;
  border-bottom: 1px solid var(--line);
}
.process__num {
  font-size: clamp(2.4rem, 4vw, 3.6rem);
  color: transparent;
  -webkit-text-stroke: 1px var(--fg-dim);
}
.process__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--fs-h3);
  letter-spacing: -0.03em;
  margin-bottom: 10px;
}
@media (max-width: 900px) {
  .process__grid {
    grid-template-columns: 1fr;
  }
  .process__head {
    position: static;
  }
  .process__step {
    grid-template-columns: 1fr;
    gap: 8px;
  }
}
</style>
