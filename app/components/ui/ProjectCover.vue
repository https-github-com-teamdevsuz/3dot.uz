<script setup lang="ts">
/**
 * Procedural cover art so the template works without image assets.
 * Swap for <NuxtImg>/<video> once real case-study media exists.
 */
const props = defineProps<{ palette: [string, string]; seed: number; title: string }>()

const style = computed(() => {
  const [a, b] = props.palette
  const s = props.seed
  const x = 30 + ((s * 37) % 40)
  const y = 25 + ((s * 53) % 45)
  return {
    '--a': a,
    '--b': b,
    '--x': `${x}%`,
    '--y': `${y}%`,
    '--r': `${(s * 47) % 360}deg`
  }
})
</script>

<template>
  <div class="cover" :style="style" role="img" :aria-label="`${title} loyihasi muqovasi`">
    <div class="cover__bg" />
    <div class="cover__orb" />
    <div class="cover__rings" />
    <span class="cover__mark display">{{ title.charAt(0) }}</span>
  </div>
</template>

<style scoped>
.cover {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;
  background: var(--b);
  isolation: isolate;
}
.cover__bg {
  position: absolute;
  inset: -20%;
  background:
    radial-gradient(60% 50% at var(--x) var(--y), color-mix(in srgb, var(--a) 70%, transparent), transparent 70%),
    conic-gradient(from var(--r) at 70% 60%, var(--b), color-mix(in srgb, var(--a) 35%, var(--b)), var(--b) 60%);
  filter: blur(20px);
  transition: transform 1.2s var(--ease-out);
}
.cover__orb {
  position: absolute;
  left: var(--x);
  top: var(--y);
  width: 42%;
  aspect-ratio: 1;
  translate: -50% -50%;
  border-radius: 50%;
  background: radial-gradient(circle at 32% 28%, #fff 0 4%, color-mix(in srgb, var(--a) 40%, #c9ccd6) 18%, #2a2c33 52%, color-mix(in srgb, var(--a) 70%, #000) 88%);
  box-shadow: 0 30px 80px -20px color-mix(in srgb, var(--a) 60%, transparent);
  transition: transform 1.2s var(--ease-out);
}
.cover__rings {
  position: absolute;
  inset: 0;
  background: repeating-radial-gradient(circle at var(--x) var(--y), transparent 0 38px, rgba(255, 255, 255, 0.05) 39px 40px);
}
.cover__mark {
  position: absolute;
  right: 6%;
  bottom: -4%;
  font-size: clamp(6rem, 16vw, 14rem);
  color: transparent;
  -webkit-text-stroke: 1px rgba(255, 255, 255, 0.25);
}
.cover:hover .cover__orb {
  transform: scale(1.12) translate(4%, -4%);
}
.cover:hover .cover__bg {
  transform: scale(1.08) rotate(4deg);
}
</style>
