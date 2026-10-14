<script setup lang="ts">
import { projects, site } from '~/data/site'

// remount per project so split-text reveals run again
definePageMeta({ key: (r) => r.fullPath })

const route = useRoute()
const index = computed(() => projects.findIndex((p) => p.slug === route.params.slug))
const project = computed(() => projects[index.value])
const next = computed(() => projects[(index.value + 1) % projects.length]!)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: 'Loyiha topilmadi', fatal: true })
}

useSeoMeta({
  title: () => `${project.value?.title} — ${site.brand}`,
  description: () => project.value?.summary
})

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <article v-if="project" ref="root" class="case">
    <header class="case__hero container" data-scene="detail">
      <NuxtLink to="/#projects" class="mono dim case__back">← barcha loyihalar</NuxtLink>
      <span class="eyebrow" data-reveal>{{ project.year }} · {{ project.tags.join(' / ') }}</span>
      <h1 class="case__title display" data-split>{{ project.title }}</h1>
      <p class="lead dim case__summary" data-reveal>{{ project.summary }}</p>
    </header>

    <div class="case__cover container" data-reveal>
      <div class="case__cover-frame">
        <ProjectCover :palette="project.palette" :seed="index + 1" :title="project.title" />
      </div>
    </div>

    <section class="case__body container section" data-scene="intro">
      <dl class="case__facts">
        <div>
          <dt class="mono dim">Yil</dt>
          <dd>{{ project.year }}</dd>
        </div>
        <div>
          <dt class="mono dim">Stek</dt>
          <dd>{{ project.stack.join(', ') }}</dd>
        </div>
        <div>
          <dt class="mono dim">Natijalar</dt>
          <dd>{{ project.awards.join(' · ') }}</dd>
        </div>
      </dl>
      <p class="lead" data-scrub-words>{{ project.description }}</p>
    </section>

    <NuxtLink :to="`/projects/${next.slug}`" class="case__next" data-scene="contact" data-cursor="Keyingi">
      <span class="mono dim">keyingi loyiha</span>
      <span class="case__next-title display">{{ next.title }}</span>
    </NuxtLink>
  </article>
</template>

<style scoped>
.case__hero {
  min-height: 80vh;
  display: grid;
  align-content: end;
  gap: 24px;
  padding-top: 140px;
  padding-bottom: 64px;
}
.case__back {
  margin-bottom: auto;
  transition: color 0.3s;
}
.case__back:hover {
  color: var(--accent);
}
.case__title {
  font-size: var(--fs-h1);
}
.case__summary {
  max-width: 24ch;
}
.case__cover-frame {
  aspect-ratio: 16 / 9;
  border-radius: var(--radius);
  overflow: hidden;
  border: 1px solid var(--line);
}
.case__body {
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 64px;
}
.case__facts {
  display: grid;
  gap: 24px;
  align-content: start;
}
.case__facts dd {
  margin-top: 6px;
  font-size: 1.1rem;
}
.case__next {
  display: grid;
  justify-items: center;
  gap: 12px;
  padding-block: clamp(96px, 20vh, 220px);
  border-top: 1px solid var(--line);
  text-align: center;
}
.case__next-title {
  font-size: var(--fs-h1);
  transition: color 0.4s;
}
.case__next:hover .case__next-title {
  color: var(--accent);
}
@media (max-width: 900px) {
  .case__body {
    grid-template-columns: 1fr;
  }
}
</style>
