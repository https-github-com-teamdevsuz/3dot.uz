<script setup lang="ts">
import { site } from '~/data/site'

useSeoMeta({
  title: `${site.brand} — ${site.tagline.join(' ')}`,
  description: site.intro
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
