<script setup lang="ts">
const t = useSite()
const { theme, toggle } = useTheme()
const announce = ref('')
let fadeTimer: ReturnType<typeof setTimeout> | undefined

const label = computed(() => (theme.value === 'dark' ? t.value.ui.theme.toLight : t.value.ui.theme.toDark))

const onClick = () => {
  const root = document.documentElement
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    root.classList.add('theme-anim')
    clearTimeout(fadeTimer)
    fadeTimer = setTimeout(() => root.classList.remove('theme-anim'), 600)
  }
  toggle()
  announce.value = theme.value === 'light' ? t.value.ui.theme.nowLight : t.value.ui.theme.nowDark
}
</script>

<template>
  <span class="theme-wrap">
    <button class="theme" type="button" :aria-label="label" :data-cursor="t.ui.theme.cursor" @click="onClick">
      <svg class="theme__icon" viewBox="0 0 20 20" width="20" height="20" aria-hidden="true">
        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M10 2a8 8 0 0 1 0 16z" fill="currentColor" />
      </svg>
    </button>
    <span class="visually-hidden" role="status">{{ announce }}</span>
  </span>
</template>

<style scoped>
.theme {
  display: grid;
  place-items: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1px solid var(--line-strong);
  transition: background-color 0.3s, transform 0.2s;
}
.theme:hover {
  background: var(--fg-faint);
}
.theme:active {
  transform: scale(0.94);
}
.theme__icon {
  transform: rotate(180deg); /* dark */
  transition: transform 0.5s var(--ease-out);
}
:root[data-theme='light'] .theme__icon {
  transform: rotate(0deg);
}
@media (max-width: 900px) {
  .theme {
    width: 44px;
    height: 44px;
  }
}
</style>
