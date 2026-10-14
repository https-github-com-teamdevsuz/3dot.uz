<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const t = useSite()
const localePath = useLocalePath()
const handle = () => clearError({ redirect: localePath('/') })
</script>

<template>
  <main class="error container">
    <span class="mono dim">{{ t.ui.error.code }} {{ props.error.statusCode }}</span>
    <h1 class="display">{{ props.error.statusCode === 404 ? t.ui.error.notFound : t.ui.error.generic }}</h1>
    <button class="btn btn--solid" type="button" @click="handle">{{ t.ui.error.home }}</button>
  </main>
</template>

<style scoped>
.error {
  min-height: 100vh;
  display: grid;
  align-content: center;
  justify-items: start;
  gap: 32px;
}
.error h1 {
  font-size: var(--fs-h1);
}
</style>
