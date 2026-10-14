<script setup lang="ts">
import { LOCALES } from '~/data/site'
import type { Locale } from '~/data/site'

defineProps<{ pills?: boolean }>()

const locale = useLocale()
const t = useSite()
const switchPath = useSwitchLocalePath()

const names = computed(() => t.value.ui.lang)
</script>

<template>
  <nav class="lang" :class="{ 'lang--pills': pills }" :aria-label="t.ui.lang.nav">
    <template v-for="(l, i) in LOCALES" :key="l">
      <span v-if="i && !pills" class="lang__sep" aria-hidden="true">/</span>
      <NuxtLink
        :to="switchPath(l)"
        class="lang__link mono"
        :class="{ 'is-active': locale === l }"
        :hreflang="l"
        :lang="l"
        :aria-current="locale === l ? 'true' : undefined"
        :data-cursor="locale === l ? '' : names[l as Locale]"
        @click="storeLocale(l)"
      >
        {{ l.toUpperCase() }}<span class="visually-hidden"> — {{ names[l as Locale] }}</span>
      </NuxtLink>
    </template>
  </nav>
</template>

<style scoped>
.lang {
  display: flex;
  align-items: center;
  white-space: nowrap;
}
.lang__sep {
  color: var(--line-strong);
}
.lang__link {
  position: relative;
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  min-width: 32px;
  justify-content: center;
  padding: 6px 8px;
  color: var(--fg-dim);
  transition: color 0.3s var(--ease-out), opacity 0.2s;
}
.lang__link::after {
  content: '';
  position: absolute;
  left: 8px;
  right: 8px;
  bottom: 2px;
  height: 1.5px;
  background: var(--accent-ink);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform 0.4s var(--ease-out);
}
.lang__link.is-active {
  color: var(--fg);
}
.lang__link.is-active::after {
  transform: scaleX(1);
}
.lang__link:active {
  opacity: 0.6;
}
@media (hover: hover) {
  .lang__link:hover {
    color: var(--fg);
  }
  .lang__link:hover::after {
    transform: scaleX(1);
  }
}

.lang--pills {
  gap: 8px;
}
.lang--pills .lang__link {
  min-width: 44px;
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid var(--line-strong);
  border-radius: 999px;
}
.lang--pills .lang__link::after {
  display: none;
}
.lang--pills .lang__link.is-active {
  background: var(--fg-faint);
  border-color: var(--fg);
}
</style>
