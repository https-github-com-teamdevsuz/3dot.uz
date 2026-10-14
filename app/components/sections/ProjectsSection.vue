<script setup lang="ts">
import gsap from 'gsap'
import { projects, stats } from '~/data/site'

const root = ref<HTMLElement | null>(null)
const track = ref<HTMLElement | null>(null)
const progress = ref<HTMLElement | null>(null)
useReveal(root)

let mm: gsap.MatchMedia | undefined
const nuxtApp = useNuxtApp()

onMounted(() => {
  mm = gsap.matchMedia()
  // horizontal, pinned scroll on desktop only — mobile gets a natural vertical list
  mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)', () => {
    const el = track.value!
    const distance = () => el.scrollWidth - window.innerWidth
    gsap.to(el, {
      x: () => -distance(),
      ease: 'none',
      scrollTrigger: {
        trigger: root.value,
        start: 'top top',
        end: () => `+=${distance()}`,
        pin: true,
        scrub: 0.8,
        invalidateOnRefresh: true,
        onUpdate: (self) => progress.value && (progress.value.style.transform = `scaleX(${self.progress})`)
      }
    })

    // cards tilt slightly as they travel
    root.value!.querySelectorAll<HTMLElement>('.project-card').forEach((card) => {
      gsap.fromTo(
        card.querySelector('.project-card__media'),
        { rotateY: -8 },
        { rotateY: 8, ease: 'none', scrollTrigger: { trigger: root.value, start: 'top top', end: () => `+=${distance()}`, scrub: true } }
      )
    })
  }, root.value!)
})
// keep the pin until the page leave animation is over, otherwise the section jumps mid-fade
onBeforeUnmount(() => {
  const revert = () => {
    mm?.revert()
    mm = undefined
  }
  nuxtApp.hooks.hookOnce('page:transition:finish', revert)
  setTimeout(revert, 1200) // fallback when no transition runs
})
</script>

<template>
  <section id="projects" ref="root" class="projects" data-scene="projects">
    <div class="projects__head container">
      <span class="eyebrow" data-reveal>tanlangan ishlar</span>
      <h2 class="h2" data-split>Loyihalar</h2>
      <span class="mono dim" data-reveal>{{ String(projects.length).padStart(2, '0') }} ta keys</span>
    </div>

    <div class="projects__viewport">
      <div ref="track" class="projects__track">
        <NuxtLink
          v-for="(p, i) in projects"
          :key="p.slug"
          :to="`/projects/${p.slug}`"
          class="project-card"
          data-cursor="Ko‘rish"
        >
          <div class="project-card__media">
            <ProjectCover :palette="p.palette" :seed="i + 1" :title="p.title" />
          </div>
          <div class="project-card__meta">
            <span class="mono dim">{{ i + 1 }}—{{ projects.length }}</span>
            <h3 class="project-card__title">{{ p.title }}</h3>
            <p class="dim">{{ p.summary }}</p>
            <ul class="project-card__awards">
              <li v-for="a in p.awards" :key="a" class="mono">{{ a }}</li>
            </ul>
          </div>
        </NuxtLink>

        <div class="projects__all">
          <span class="display">{{ stats.numbers[0]?.value }}{{ stats.numbers[0]?.suffix }}</span>
          <p class="dim">{{ stats.numbers[0]?.label.toLowerCase() }}</p>
        </div>
      </div>
    </div>

    <div class="projects__progress container" aria-hidden="true">
      <div class="projects__progress-bar"><span ref="progress" /></div>
    </div>
  </section>
</template>

<style scoped>
.projects {
  position: relative;
  padding-top: clamp(96px, 14vh, 160px);
  padding-bottom: 48px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}
.projects__head {
  display: flex;
  align-items: baseline;
  gap: 32px;
  margin-bottom: 48px;
}
.projects__head .h2 {
  font-size: var(--fs-h1);
}
.projects__head .mono {
  margin-left: auto;
}
.projects__viewport {
  overflow: hidden;
  perspective: 1400px;
}
.projects__track {
  display: flex;
  gap: clamp(20px, 3vw, 48px);
  width: max-content;
  padding-inline: var(--gutter);
}
.project-card {
  display: grid;
  gap: 20px;
  width: clamp(320px, 38vw, 620px);
}
.project-card__media {
  aspect-ratio: 4 / 3;
  border-radius: var(--radius);
  overflow: hidden;
  transform-style: preserve-3d;
  border: 1px solid var(--line);
}
.project-card__meta {
  display: grid;
  gap: 6px;
}
.project-card__title {
  font-family: var(--font-display);
  font-weight: 400;
  font-size: clamp(1.6rem, 2.6vw, 2.6rem);
  letter-spacing: -0.04em;
  transition: color 0.4s;
}
.project-card:hover .project-card__title {
  color: var(--accent);
}
.project-card__awards {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.project-card__awards li {
  padding: 6px 12px;
  border: 1px solid var(--line);
  border-radius: 999px;
}
.projects__all {
  display: grid;
  align-content: center;
  width: clamp(260px, 26vw, 420px);
  padding-left: 48px;
  border-left: 1px solid var(--line);
}
.projects__all .display {
  font-size: clamp(4rem, 8vw, 8rem);
}
.projects__progress {
  margin-top: auto;
  padding-top: 40px;
}
.projects__progress-bar {
  height: 1px;
  background: var(--line);
}
.projects__progress-bar span {
  display: block;
  height: 100%;
  background: var(--accent);
  transform: scaleX(0);
  transform-origin: left;
}
@media (max-width: 900px) {
  .projects {
    min-height: 0;
  }
  .projects__track {
    flex-direction: column;
    width: 100%;
  }
  .project-card,
  .projects__all {
    width: 100%;
  }
  .projects__all {
    padding: 32px 0 0;
    border-left: 0;
    border-top: 1px solid var(--line);
  }
  .projects__progress {
    display: none;
  }
}
</style>
