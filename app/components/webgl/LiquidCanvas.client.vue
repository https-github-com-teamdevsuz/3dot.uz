<script setup lang="ts">
import type { LiquidScene } from '~/webgl/LiquidScene'

const canvas = ref<HTMLCanvasElement | null>(null)
const failed = ref(false)
const active = useActiveScene()
const { $lenis, $reducedMotion } = useNuxtApp()
const { theme } = useTheme()

let scene: LiquidScene | null = null
let disposed = false
let resizeObserver: ResizeObserver | null = null

const onPointer = (e: PointerEvent) => {
  scene?.setPointer((e.clientX / window.innerWidth) * 2 - 1, -((e.clientY / window.innerHeight) * 2 - 1))
}
const onVisibility = () => (document.hidden ? scene?.stop() : scene?.start())
const onScroll = ({ velocity }: { velocity: number }) => scene?.setVelocity(velocity)

onMounted(async () => {
  // during hydration Nuxt's client-only wrapper mounts a placeholder first and swaps in
  // the real template on the next tick, so the canvas ref is still null here
  await nextTick()
  const el = canvas.value
  if (!el || disposed) return
  try {
    // three.js is code-split: it never blocks first paint
    const { LiquidScene } = await import('~/webgl/LiquidScene')
    if (disposed) return // unmounted while three.js was loading
    // DOM attribute is the source of truth until theme.client.ts syncs state on app:mounted
    const initialTheme = document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'
    scene = new LiquidScene(el, { reducedMotion: !!$reducedMotion, theme: initialTheme })
    scene.setSection(active.value)
    scene.start()
  } catch (err) {
    console.warn('[LiquidCanvas] WebGL unavailable, falling back to static gradient', err)
    failed.value = true
    return
  }

  resizeObserver = new ResizeObserver(() => scene?.resize())
  resizeObserver.observe(el)
  window.addEventListener('pointermove', onPointer, { passive: true })
  document.addEventListener('visibilitychange', onVisibility)
  $lenis?.on('scroll', onScroll)
})

watch(active, (name) => scene?.setSection(name))
watch(theme, (t) => scene?.setTheme(t))

onBeforeUnmount(() => {
  disposed = true
  window.removeEventListener('pointermove', onPointer)
  document.removeEventListener('visibilitychange', onVisibility)
  $lenis?.off('scroll', onScroll)
  resizeObserver?.disconnect()
  scene?.dispose()
  scene = null
})
</script>

<template>
  <div class="webgl" :class="{ 'webgl--fallback': failed }" aria-hidden="true">
    <canvas ref="canvas" class="webgl__canvas" />
  </div>
</template>

<style scoped>
.webgl {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}
.webgl::before {
  /* soft glow that sits behind the chrome */
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(40vmax 30vmax at 70% 40%, rgba(123, 92, 255, 0.12), transparent 70%),
    radial-gradient(30vmax 24vmax at 30% 70%, rgba(200, 255, 90, 0.06), transparent 70%);
}
.webgl__canvas {
  width: 100%;
  height: 100%;
}
.webgl--fallback::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 60%;
  width: 46vmin;
  aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff, #8d93a3 35%, #1a1c22 70%, #c8ff5a 100%);
  filter: blur(1px);
}
:root[data-theme='light'] .webgl::before {
  background:
    radial-gradient(40vmax 30vmax at 70% 40%, rgba(123, 92, 255, 0.1), transparent 70%),
    radial-gradient(30vmax 24vmax at 30% 70%, rgba(77, 107, 0, 0.08), transparent 70%);
}
:root[data-theme='light'] .webgl--fallback::after {
  background: radial-gradient(circle at 35% 30%, #fff, #9ea3ad 30%, #2a2d35 68%, #4d6b00 100%);
}
</style>
