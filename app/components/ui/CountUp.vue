<script setup lang="ts">
import gsap from 'gsap'

const props = withDefaults(defineProps<{ to: number; suffix?: string; duration?: number }>(), {
  suffix: '',
  duration: 2
})

const el = ref<HTMLElement | null>(null)
const value = ref(props.to) // SSR renders the final number (good for SEO / no-JS)
let tween: gsap.core.Tween | undefined

onMounted(() => {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  value.value = 0
  const state = { v: 0 }
  tween = gsap.to(state, {
    v: props.to,
    duration: props.duration,
    ease: 'power3.out',
    onUpdate: () => (value.value = Math.round(state.v)),
    scrollTrigger: { trigger: el.value, start: 'top 85%', once: true }
  })
})
onBeforeUnmount(() => {
  tween?.scrollTrigger?.kill()
  tween?.kill()
})
</script>

<template>
  <span ref="el" class="count">{{ value }}{{ suffix }}</span>
</template>

<style scoped>
.count {
  font-variant-numeric: tabular-nums;
}
</style>
