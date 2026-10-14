<script setup lang="ts">
import gsap from 'gsap'

const t = useSite()
const root = ref<HTMLElement | null>(null)
const counter = ref(0)
const done = ref(false)
const preloaded = usePreloaded()

onMounted(() => {
  const lenis = useNuxtApp().$lenis
  lenis?.stop()
  const state = { v: 0 }
  const tl = gsap.timeline({
    onComplete: () => {
      done.value = true
      lenis?.start()
    }
  })
  tl.to(state, { v: 100, duration: 1.6, ease: 'power2.inOut', onUpdate: () => (counter.value = Math.round(state.v)) })
    .to(root.value!.querySelector('.preloader__brand'), { yPercent: -110, duration: 0.7, ease: 'expo.in' }, '-=0.15')
    .add(() => {
      preloaded.value = true
    }, '-=0.1')
    .to(root.value, { clipPath: 'inset(0 0 100% 0)', duration: 1, ease: 'expo.inOut' }, '-=0.2')
})
</script>

<template>
  <div v-if="!done" ref="root" class="preloader" aria-hidden="true">
    <div class="preloader__mask">
      <div class="preloader__brand"><BrandLogo /></div>
    </div>
    <div class="preloader__meta container">
      <span class="mono dim">{{ t.site.tagline.join(' ') }}</span>
      <span class="preloader__count display">{{ String(counter).padStart(3, '0') }}</span>
    </div>
  </div>
</template>

<style scoped>
.preloader {
  position: fixed;
  inset: 0;
  z-index: 150;
  display: grid;
  place-items: center;
  background: var(--bg);
  clip-path: inset(0 0 0 0);
}
.preloader__mask {
  overflow: hidden;
}
.preloader__brand {
  font-size: clamp(3rem, 10vw, 8rem); /* = logo height */
  color: var(--fg);
}
.preloader__meta {
  position: absolute;
  bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.preloader__count {
  font-size: clamp(2.5rem, 6vw, 5rem);
  color: var(--accent-ink);
  font-variant-numeric: tabular-nums;
}
</style>
