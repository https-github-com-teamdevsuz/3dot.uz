<script setup lang="ts">

const t = useSite()

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <section id="services" ref="root" class="services section" data-scene="services">
    <div class="container">
      <header class="services__head">
        <span class="eyebrow" data-reveal>{{ t.ui.services.eyebrow }}</span>
        <h2 class="h2" data-split>{{ t.servicesTitle }}</h2>
      </header>

      <ul class="services__grid">
        <li v-for="(s, i) in t.services" :key="s.title" class="services__item" :data-reveal="i * 0.06">
          <h3 class="services__title">{{ s.title }}</h3>
          <p>{{ s.sub }}</p>
          <ul class="services__bullets dim">
            <li v-for="b in s.bullets" :key="b">{{ b }}</li>
          </ul>
        </li>
      </ul>
      <p class="services__also dim">{{ t.ui.services.also }}</p>
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
  gap: 12px;
  align-content: start;
  min-height: clamp(220px, 18vw, 300px);
  padding: 28px;
  border-right: 1px solid var(--line);
  border-bottom: 1px solid var(--line);
  background: rgb(var(--bg-rgb) / 0.55);
  backdrop-filter: blur(14px);
  overflow: hidden;
  transition: background-color 0.5s var(--ease-out);
}
.services__item:hover {
  background: color-mix(in srgb, var(--bg-2) 80%, transparent);
}
.services__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.1rem, 1.55vw, 1.6rem);
  letter-spacing: -0.03em;
  hyphens: auto;
  overflow-wrap: anywhere;
}
.services__item p {
  color: var(--fg);
}
.services__bullets {
  display: grid;
  gap: 4px;
  font-size: 0.875rem;
}
.services__bullets li::before {
  content: '— ';
}
.services__also {
  margin-top: 32px;
}
@media (max-width: 1279px) {
  .services__grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 1100px) {
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
