<script setup lang="ts">
import type { NuxtError } from '#app'

const props = defineProps<{ error: NuxtError }>()
const handle = () => clearError({ redirect: '/' })
</script>

<template>
  <main class="error container">
    <span class="mono dim">xato {{ props.error.statusCode }}</span>
    <h1 class="display">{{ props.error.statusCode === 404 ? 'Sahifa topilmadi' : 'Nimadir xato ketdi' }}</h1>
    <button class="btn btn--solid" type="button" @click="handle">Bosh sahifaga</button>
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
