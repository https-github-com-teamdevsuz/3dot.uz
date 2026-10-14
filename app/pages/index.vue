<script setup lang="ts">
const t = useSite()

useSeoMeta({
  title: () => t.value.meta.title,
  description: () => t.value.meta.description,
  ogTitle: () => t.value.meta.title,
  ogDescription: () => t.value.meta.description
})
</script>

<template>
  <div>
    <HeroSection />
    <IntroSection />
    <ServicesGrid />
    <StatsSection />
    <ProjectsSection />
    <ExpertiseSection />
    <ProcessSection />
    <FaqSection />
    <ContactSection />
  </div>
</template>
