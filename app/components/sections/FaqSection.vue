<script setup lang="ts">

const t = useSite()

const root = ref<HTMLElement | null>(null)
const open = ref<number | null>(0)
useReveal(root)

const toggle = (i: number) => (open.value = open.value === i ? null : i)
</script>

<template>
  <section ref="root" class="faq section" data-scene="faq">
    <div class="faq__grid container">
      <div class="faq__pricing">
        <span class="eyebrow" data-reveal>{{ t.ui.faq.pricingEyebrow }}</span>
        <h2 class="h2" data-split>{{ t.ui.faq.pricingTitle }}</h2>
        <dl>
          <div v-for="p in t.pricing" :key="p.label" class="faq__price" data-reveal>
            <dt class="dim">{{ p.label }}</dt>
            <dd class="display">{{ p.value }}</dd>
          </div>
        </dl>
      </div>

      <div class="faq__list">
        <span class="eyebrow" data-reveal>{{ t.ui.faq.eyebrow }}</span>
        <div v-for="(item, i) in t.faq" :key="item.q" class="faq__item" :class="{ 'is-open': open === i }" data-reveal>
          <h3>
            <button
              :id="`faq-q-${i}`"
              type="button"
              class="faq__q"
              :aria-expanded="open === i"
              :aria-controls="`faq-a-${i}`"
              @click="toggle(i)"
            >
              <span class="mono dim">0{{ i + 1 }}</span>
              <span class="faq__q-text">{{ item.q }}</span>
              <span class="faq__icon" aria-hidden="true" />
            </button>
          </h3>
          <div :id="`faq-a-${i}`" class="faq__a" role="region" :aria-labelledby="`faq-q-${i}`">
            <div class="faq__a-inner">
              <p class="dim">{{ item.a }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style scoped>
.faq__grid {
  display: grid;
  grid-template-columns: 1fr 1.3fr;
  gap: 80px;
}
.faq__pricing {
  display: grid;
  gap: 24px;
  align-content: start;
}
.faq__price {
  padding-block: 24px;
  border-bottom: 1px solid var(--line);
}
.faq__price dd {
  font-size: clamp(2rem, 4vw, 3.4rem);
  margin-top: 6px;
}
.faq__list {
  display: grid;
  gap: 0;
  align-content: start;
}
.faq__list .eyebrow {
  margin-bottom: 24px;
}
.faq__item {
  border-bottom: 1px solid var(--line);
}
.faq__q {
  display: grid;
  grid-template-columns: 48px 1fr 32px;
  align-items: center;
  width: 100%;
  gap: 12px;
  padding: 26px 0;
  text-align: left;
  font-size: clamp(1.05rem, 1.5vw, 1.35rem);
  font-weight: 500;
}
.faq__icon {
  position: relative;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  transition: background-color 0.4s, transform 0.5s var(--ease-out);
}
.faq__icon::before,
.faq__icon::after {
  content: '';
  position: absolute;
  inset: 50% 9px auto;
  height: 1.5px;
  background: currentColor;
  translate: 0 -50%;
}
.faq__icon::after {
  transform: rotate(90deg);
  transition: transform 0.5s var(--ease-out);
}
.is-open .faq__icon {
  background: var(--accent);
  color: var(--on-accent);
  border-color: var(--accent-ink);
}
.is-open .faq__icon::after {
  transform: rotate(0deg);
}
.faq__a {
  display: grid;
  grid-template-rows: 0fr;
  transition: grid-template-rows 0.6s var(--ease-out);
}
.is-open .faq__a {
  grid-template-rows: 1fr;
}
.faq__a-inner {
  overflow: hidden;
}
.faq__a p {
  padding: 0 44px 28px 60px;
  max-width: 60ch;
}
@media (max-width: 900px) {
  .faq__grid {
    grid-template-columns: 1fr;
    gap: 64px;
  }
  .faq__a p {
    padding-left: 0;
  }
}
</style>
