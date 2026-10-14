<script setup lang="ts">
// remount per project so split-text reveals run again
definePageMeta({ key: (r) => r.fullPath })

const route = useRoute()
const t = useSite()
const localePath = useLocalePath()
const projects = computed(() => t.value.projects)
const index = computed(() => projects.value.findIndex((p) => p.slug === route.params.slug))
const project = computed(() => projects.value[index.value])
const next = computed(() => projects.value[(index.value + 1) % projects.value.length]!)

if (!project.value) {
  throw createError({ statusCode: 404, statusMessage: t.value.ui.error.projectNotFound, fatal: true })
}

const root = ref<HTMLElement | null>(null)
useReveal(root)
</script>

<template>
  <article v-if="project" ref="root" class="case">
    <header class="case__hero container" data-scene="detail">
      <NuxtLink :to="localePath('/') + '#projects'" class="mono dim case__back">{{ t.ui.project.back }}</NuxtLink>
      <span class="eyebrow" data-reveal>{{ project.year }} · {{ project.tags.join(' / ') }}</span>
      <span v-if="project.nda" class="badge badge--inline mono" data-reveal>{{ t.ui.project.nda }}</span>
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
          <dt class="mono dim">{{ t.ui.project.year }}</dt>
          <dd>{{ project.year }}</dd>
        </div>
        <div>
          <dt class="mono dim">{{ t.ui.project.stack }}</dt>
          <dd>{{ project.stack.join(', ') }}</dd>
        </div>
        <div>
          <dt class="mono dim">{{ t.ui.project.results }}</dt>
          <dd>{{ project.awards.join(' · ') }}</dd>
        </div>
      </dl>
      <p class="lead" data-scrub-words>{{ project.description }}</p>
    </section>

    <section class="case__cta container">
      <SectionCta :text="t.ui.sectionCta.project" />
    </section>

    <NuxtLink :to="localePath(`/projects/${next.slug}`)" class="case__next" data-scene="contact" :data-cursor="t.ui.project.nextCursor">
      <span class="mono dim">{{ t.ui.project.next }}</span>
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
  color: var(--accent-ink);
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
.case__cta {
  display: grid;
  justify-items: start;
  gap: 24px;
  padding-bottom: clamp(48px, 8vh, 96px);
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
  color: var(--accent-ink);
}
@media (max-width: 900px) {
  .case__body {
    grid-template-columns: 1fr;
  }
}
</style>
