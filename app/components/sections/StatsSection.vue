<script setup lang="ts">
const t = useSite()
const maxCount = computed(() => Math.max(...t.value.stats.awards.map((a) => a.count)))

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <section ref="root" class="stats section" data-scene="stats">
    <div class="stats__grid container">
      <div class="stats__left">
        <span class="eyebrow" data-reveal>{{ t.ui.stats.eyebrow }}</span>
        <h2 class="h2" data-split>{{ t.stats.headline }}</h2>
      </div>

      <div class="stats__big">
        <div class="stats__number display"><CountUp :to="t.stats.total" suffix="+" /></div>
        <p class="dim" data-reveal>{{ t.stats.caption }}</p>
      </div>

      <ul class="stats__list">
        <li v-for="a in t.stats.awards" :key="a.name" class="stats__row" data-reveal>
          <span class="stats__name">{{ a.name }}</span>
          <span class="stats__bar" :style="{ '--w': `${(a.count / maxCount) * 100}%` }" />
          <span class="stats__count display">{{ a.count }}</span>
        </li>
      </ul>
    </div>
  </section>
</template>

<style scoped>
.stats__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px 48px;
}
.stats__left {
  display: grid;
  gap: 24px;
  align-content: start;
}
.stats__left .h2 {
  max-width: 14ch;
}
.stats__big {
  grid-row: span 2;
  align-self: center;
}
.stats__number {
  font-size: clamp(7rem, 22vw, 22rem);
  line-height: 0.8;
  background: linear-gradient(120deg, var(--fg), var(--accent-ink) 60%, var(--violet));
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
}
.stats__big p {
  max-width: 34ch;
  margin-top: 24px;
}
.stats__row {
  display: grid;
  grid-template-columns: 170px 1fr auto;
  align-items: center;
  gap: 24px;
  padding-block: 18px;
  border-bottom: 1px solid var(--line);
}
.stats__bar {
  height: 2px;
  background: var(--line);
  position: relative;
}
.stats__bar::after {
  content: '';
  position: absolute;
  inset: 0 auto 0 0;
  width: var(--w);
  background: var(--accent-ink);
}
.stats__count {
  font-size: 1.8rem;
}
@media (max-width: 900px) {
  .stats__grid {
    grid-template-columns: 1fr;
  }
  .stats__big {
    grid-row: auto;
  }
  .stats__row {
    grid-template-columns: 110px 1fr auto;
  }
}
</style>
