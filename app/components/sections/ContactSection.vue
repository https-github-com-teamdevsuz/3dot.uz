<script setup lang="ts">
import gsap from 'gsap'
import { email, phone, telegram } from '~/data/site'

const t = useSite()
const root = ref<HTMLElement | null>(null)
const button = ref<HTMLElement | null>(null)
const { show } = useContactModal()
useReveal(root)

// magnetic CTA
let xTo: ((v: number) => void) | undefined
let yTo: ((v: number) => void) | undefined
onMounted(() => {
  xTo = gsap.quickTo(button.value, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
  yTo = gsap.quickTo(button.value, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.4)' })
})
const onMove = (e: PointerEvent) => {
  const r = button.value!.getBoundingClientRect()
  xTo?.((e.clientX - (r.left + r.width / 2)) * 0.35)
  yTo?.((e.clientY - (r.top + r.height / 2)) * 0.35)
}
const onLeave = () => {
  xTo?.(0)
  yTo?.(0)
}
</script>

<template>
  <section id="contact" ref="root" class="contact section" data-scene="contact">
    <div class="contact__inner container">
      <span class="eyebrow" data-reveal>{{ t.ui.contact.eyebrow }}</span>
      <h2 class="contact__title display" data-split>{{ t.ui.contact.title }}</h2>

      <div class="contact__magnet" @pointermove="onMove" @pointerleave="onLeave">
        <button ref="button" type="button" class="contact__btn" :data-cursor="t.ui.contact.cursor" @click="show">
          <span>{{ t.ui.contact.button }}</span>
        </button>
      </div>

      <div class="contact__links" data-reveal>
        <a :href="`mailto:${email}`">{{ email }}</a>
        <a :href="telegram" target="_blank" rel="noopener">Telegram ↗</a>
        <a :href="`tel:${phone.replace(/\s/g, '')}`">{{ phone }}</a>
      </div>
    </div>
  </section>
</template>

<style scoped>
.contact {
  min-height: 100vh;
  display: grid;
  align-items: center;
}
.contact__inner {
  display: grid;
  justify-items: center;
  text-align: center;
  gap: 40px;
}
.contact__title {
  font-size: var(--fs-h1);
  max-width: 12ch;
}
.contact__magnet {
  padding: 40px;
}
.contact__btn {
  width: clamp(140px, 14vw, 200px);
  aspect-ratio: 1;
  border-radius: 50%;
  background: var(--accent);
  color: var(--on-accent);
  font-family: var(--font-display);
  font-size: 1.15rem;
  box-shadow: 0 0 80px -10px var(--accent);
  transition: background-color 0.4s;
}
.contact__btn:hover {
  background: var(--fg);
}
.contact__links {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 16px 40px;
  font-size: 1.1rem;
}
.contact__links a {
  border-bottom: 1px solid var(--line);
  padding-bottom: 4px;
  transition: border-color 0.3s, color 0.3s;
}
.contact__links a:hover {
  color: var(--accent-ink);
  border-color: var(--accent-ink);
}
</style>
