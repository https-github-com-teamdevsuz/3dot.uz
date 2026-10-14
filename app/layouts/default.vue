<script setup lang="ts">
useSceneSections()
</script>

<template>
  <div class="app">
    <a class="skip-link" href="#main">Asosiy kontentga o‘tish</a>
    <SitePreloader />
    <LiquidCanvas />
    <SiteHeader />
    <main id="main" class="app__main">
      <slot />
    </main>
    <SiteFooter />
    <ContactModal />
    <CustomCursor />
    <div class="grain" aria-hidden="true" />
  </div>
</template>

<style scoped>
.app__main {
  position: relative;
  z-index: 1;
}
.skip-link {
  position: fixed;
  top: 12px;
  left: 12px;
  z-index: 200;
  padding: 10px 16px;
  border-radius: 999px;
  background: var(--accent);
  color: #000;
  transform: translateY(-200%);
}
.skip-link:focus {
  transform: none;
}
</style>
