<script setup lang="ts">
const t = useSite()

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <section id="intro" ref="root" class="intro section" data-scene="intro">
    <div class="intro__grid container">
      <span class="eyebrow" data-reveal>{{ t.ui.intro.eyebrow }}</span>
      <p class="intro__text lead" data-scrub-words>{{ t.site.intro }}</p>
      <dl class="intro__numbers">
        <div v-for="n in t.stats.numbers" :key="n.label" data-reveal>
          <dt class="display" data-placeholder><CountUp :to="n.value" :suffix="n.suffix" /></dt>
          <dd class="dim">{{ n.label }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>

<style scoped>
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
