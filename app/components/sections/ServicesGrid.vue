<script setup lang="ts">
import { services, servicesTitle } from '~/data/site'

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <section id="services" ref="root" class="services section" data-scene="services">
    <div class="container">
      <header class="services__head">
        <span class="eyebrow" data-reveal>xizmatlar</span>
        <h2 class="h2" data-split>{{ servicesTitle }}</h2>
      </header>

      <ul class="services__grid">
        <li v-for="(s, i) in services" :key="s.title" class="services__item" :data-reveal="(i % 4) * 0.06">
          <span class="mono dim">{{ String(i + 1).padStart(2, '0') }}</span>
          <h3 class="services__title">{{ s.title }}</h3>
          <p class="dim">{{ s.sub }}</p>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.services__head {
  display: grid;
  gap: 24px;
  margin-left: 33%;
  margin-bottom: clamp(48px, 8vh, 96px);
}
.services__grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line);
  border-left: 1px solid var(--line);
}
.services__item {
  position: relative;
  display: grid;
  gap: 10px;
  align-content: start;
  min-height: clamp(180px, 22vw, 260px);
  padding: 28px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: rgba(5, 5, 5, 0.55);
  backdrop-filter: blur(14px);
  overflow: hidden;
  transition: background-color 0.5s var(--ease-out);
}
.services__item::after {
  content: '';
  position: absolute;
  inset: auto 0 0;
  height: 2px;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.7s var(--ease-out);
}
.services__item:hover {
  background: rgba(20, 20, 22, 0.75);
}
.services__item:hover::after {
  transform: scaleX(1);
}
.services__title {
  margin-top: auto;
  font-family: var(--font-display);
  font-weight: 400;
  font-size: var(--fs-h3);
  letter-spacing: -0.03em;
  padding-top: 40px;
}
@media (max-width: 1100px) {
  .services__grid {
    grid-template-columns: repeat(2, 1fr);
  }
  .services__head {
    margin-left: 0;
  }
}
@media (max-width: 560px) {
  .services__grid {
    grid-template-columns: 1fr;
  }
  .services__item {
    min-height: 0;
  }
}
</style>
