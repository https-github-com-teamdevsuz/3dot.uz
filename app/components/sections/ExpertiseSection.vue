<script setup lang="ts">
import { clients } from '~/data/site'

const t = useSite()

const root = ref<HTMLElement | null>(null)
const active = ref(0)
useReveal(root)

const serviceTabs = computed(() => t.value.serviceTabs)
const current = computed(() => serviceTabs.value[active.value]!)
</script>

<template>
  <section ref="root" class="expertise section" data-scene="expertise">
    <div class="container">
      <header class="expertise__head">
        <span class="eyebrow" data-reveal>{{ t.ui.expertise.eyebrow }}</span>
        <h2 class="h2" data-split>{{ t.ui.expertise.title }}</h2>
      </header>

      <div class="tabs">
        <div class="tabs__list" role="tablist" :aria-label="t.ui.expertise.tabsAria">
          <button
            v-for="(tab, i) in serviceTabs"
            :id="`tab-${i}`"
            :key="tab.title"
            role="tab"
            type="button"
            class="tabs__tab"
            :class="{ 'is-active': active === i }"
            :aria-selected="active === i"
            :aria-controls="`panel-${i}`"
            :tabindex="active === i ? 0 : -1"
            @click="active = i"
            @keydown.right.prevent="active = (i + 1) % serviceTabs.length"
            @keydown.left.prevent="active = (i - 1 + serviceTabs.length) % serviceTabs.length"
          >
            <span class="mono dim">0{{ i + 1 }}</span>
            {{ tab.title }}
          </button>
        </div>

        <Transition name="panel" mode="out-in">
          <div :id="`panel-${active}`" :key="active" class="tabs__panel" role="tabpanel" :aria-labelledby="`tab-${active}`">
            <p class="lead">{{ current.text }}</p>
            <ul class="tabs__items">
              <li v-for="item in current.items" :key="item">{{ item }}</li>
            </ul>
          </div>
        </Transition>
      </div>

      <div class="expertise__stack">
        <span class="mono dim" data-reveal>{{ t.ui.expertise.stackLabel }}</span>
        <ul>
          <li v-for="(s, i) in t.stack" :key="s" data-reveal>
            <span class="mono dim">[{{ String(i + 1).padStart(2, '0') }}]</span>{{ s }}
          </li>
        </ul>
      </div>
    </div>

    <div class="clients" :aria-label="t.ui.expertise.clientsAria">
      <div class="clients__track">
        <span v-for="n in 2" :key="n" class="clients__group" :aria-hidden="n === 2">
          <span v-for="c in clients" :key="c" class="clients__item display">{{ c }}<i>✦</i></span>
        </span>
      </div>
    </div>
  </section>
</template>

<style scoped>
.expertise__head {
  display: grid;
  gap: 24px;
  max-width: 900px;
  margin-bottom: 64px;
}
.tabs {
  display: grid;
  grid-template-columns: 1fr 1.4fr;
  gap: 48px;
  min-height: 340px;
}
.tabs__list {
  display: grid;
  align-content: start;
}
.tabs__tab {
  display: flex;
  align-items: baseline;
  gap: 18px;
  padding: 18px 0;
  text-align: left;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-display);
  font-size: clamp(1.3rem, 2.4vw, 2.2rem);
  letter-spacing: -0.03em;
  color: var(--fg-dim);
  transition: color 0.4s, padding 0.5s var(--ease-out);
}
.tabs__tab:hover,
.tabs__tab.is-active {
  color: var(--fg);
}
.tabs__tab.is-active {
  padding-left: 16px;
  border-color: var(--accent-ink);
}
.tabs__panel {
  align-self: start;
  padding: clamp(28px, 4vw, 56px);
  border-radius: var(--radius);
  border: 1px solid var(--line);
  background: color-mix(in srgb, var(--bg-2) 60%, transparent);
  backdrop-filter: blur(18px);
}
.tabs__items {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 40px;
}
.tabs__items li {
  padding: 10px 18px;
  border-radius: 999px;
  border: 1px solid var(--line);
}
.panel-enter-active,
.panel-leave-active {
  transition: opacity 0.35s, transform 0.5s var(--ease-out);
}
.panel-enter-from {
  opacity: 0;
  transform: translateY(16px);
}
.panel-leave-to {
  opacity: 0;
  transform: translateY(-16px);
}
.expertise__stack {
  margin-top: clamp(80px, 12vh, 140px);
  display: grid;
  gap: 24px;
}
.expertise__stack ul {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--line);
}
.expertise__stack li {
  display: flex;
  gap: 12px;
  align-items: baseline;
  padding: 22px 0;
  border-bottom: 1px solid var(--line);
  font-size: 1.2rem;
}
.clients {
  margin-top: clamp(80px, 12vh, 140px);
  overflow: hidden;
  border-block: 1px solid var(--line);
  padding-block: 28px;
}
.clients__track {
  display: flex;
  width: max-content;
  animation: marquee 30s linear infinite;
}
.clients:hover .clients__track {
  animation-play-state: paused;
}
.clients__group {
  display: flex;
}
.clients__item {
  display: inline-flex;
  align-items: center;
  gap: 40px;
  padding-right: 40px;
  font-size: clamp(1.8rem, 4vw, 3.6rem);
  color: var(--fg-dim);
  transition: color 0.3s;
}
.clients__item:hover {
  color: var(--fg);
}
.clients__item i {
  font-style: normal;
  font-size: 0.5em;
  color: var(--accent-ink);
}
@keyframes marquee {
  to {
    transform: translateX(-50%);
  }
}
@media (max-width: 900px) {
  .tabs {
    grid-template-columns: 1fr;
  }
  .expertise__stack ul {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
