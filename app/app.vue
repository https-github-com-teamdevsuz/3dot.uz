<script setup lang="ts">
useSeo()
if (useRuntimeConfig().public.showPlaceholders) useHead({ htmlAttrs: { 'data-show-placeholders': '' } })
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
