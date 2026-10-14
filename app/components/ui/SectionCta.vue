<script setup lang="ts">
withDefaults(defineProps<{ text?: string; variant?: 'bar' | 'card' }>(), { text: '', variant: 'bar' })
const t = useSite()
const { show } = useContactModal()
</script>

<template>
  <div class="cta" data-reveal :class="`cta--${variant}`">
    <p v-if="text" class="cta__text display">{{ text }}</p>
    <button class="btn btn--solid section-cta" type="button" data-cta="section" @click="show">
      {{ t.ui.cta.label }} <span aria-hidden="true">→</span>
    </button>
  </div>
</template>

<style scoped>
.cta {
  display: flex;
  align-items: center;
  gap: 16px 32px;
}
.cta__text {
  font-size: clamp(1.2rem, 2vw, 1.9rem);
  letter-spacing: -0.03em;
}
.cta--bar {
  flex-wrap: wrap;
  justify-content: space-between;
  padding: 24px 0;
  border-top: 1px solid var(--line);
}
.cta--card {
  flex-direction: column;
  align-items: flex-start;
}
</style>
