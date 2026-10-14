<script setup lang="ts">
import gsap from 'gsap'

/**
 * Custom cursor: a small dot + a lagging ring. Elements with `data-cursor="label"`
 * expand the ring and show the label (e.g. "Ko‘rish" over project cards).
 */
const dot = ref<HTMLElement | null>(null)
const ring = ref<HTMLElement | null>(null)
const label = ref('')
const hover = ref(false)
const enabled = ref(false)

let cleanup = () => {}

onMounted(() => {
  if (!window.matchMedia('(pointer: fine)').matches) return
  enabled.value = true
  document.documentElement.classList.add('has-cursor')

  nextTick(() => {
    const xDot = gsap.quickTo(dot.value, 'x', { duration: 0.08 })
    const yDot = gsap.quickTo(dot.value, 'y', { duration: 0.08 })
    const xRing = gsap.quickTo(ring.value, 'x', { duration: 0.45, ease: 'power3' })
    const yRing = gsap.quickTo(ring.value, 'y', { duration: 0.45, ease: 'power3' })

    const move = (e: PointerEvent) => {
      xDot(e.clientX)
      yDot(e.clientY)
      xRing(e.clientX)
      yRing(e.clientY)
      const target = (e.target as HTMLElement | null)?.closest<HTMLElement>('[data-cursor], a, button')
      hover.value = !!target
      label.value = target?.dataset.cursor ?? ''
    }
    window.addEventListener('pointermove', move, { passive: true })
    cleanup = () => window.removeEventListener('pointermove', move)
  })
})

onBeforeUnmount(() => {
  cleanup()
  document.documentElement.classList.remove('has-cursor')
})
</script>

<template>
  <div v-if="enabled" class="cursor" aria-hidden="true">
    <div ref="ring" class="cursor__ring" :class="{ 'is-hover': hover, 'has-label': !!label }">
      <span class="cursor__label mono">{{ label }}</span>
    </div>
    <div ref="dot" class="cursor__dot" />
  </div>
</template>

<style scoped>
.cursor {
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 120;
}
.cursor__dot,
.cursor__ring {
  position: fixed;
  top: 0;
  left: 0;
  border-radius: 50%;
  translate: -50% -50%;
  mix-blend-mode: difference;
}
.cursor__dot {
  width: 6px;
  height: 6px;
  background: #fff;
}
.cursor__ring {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border: 1px solid rgba(255, 255, 255, 0.6);
  transition: width 0.45s var(--ease-out), height 0.45s var(--ease-out), background-color 0.45s;
}
.cursor__ring.is-hover {
  width: 64px;
  height: 64px;
}
.cursor__ring.has-label {
  width: 110px;
  height: 110px;
  border-color: var(--accent);
  background: var(--accent);
  mix-blend-mode: normal;
}
.cursor__label {
  color: #000;
  opacity: 0;
  transition: opacity 0.3s;
}
.has-label .cursor__label {
  opacity: 1;
}
</style>

<style>
@media (pointer: fine) {
  html.has-cursor,
  html.has-cursor * {
    cursor: none !important;
  }
}
</style>
