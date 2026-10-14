import { ScrollTrigger } from 'gsap/ScrollTrigger'

/** Name of the section currently in view; the WebGL blob morphs toward its preset. */
export const useActiveScene = () => useState<string>('active-scene', () => 'hero')

/**
 * Watches every `[data-scene]` element on the current page and updates
 * `useActiveScene()` when one crosses the middle of the viewport.
 * Called once from the default layout; re-binds after every navigation.
 */
export function useSceneSections() {
  const active = useActiveScene()
  const nuxtApp = useNuxtApp()
  let triggers: ScrollTrigger[] = []

  const bind = () => {
    triggers.forEach((t) => t.kill())
    triggers = []
    const sections = document.querySelectorAll<HTMLElement>('[data-scene]')
    sections.forEach((el) => {
      triggers.push(
        ScrollTrigger.create({
          trigger: el,
          start: 'top 55%',
          end: 'bottom 55%',
          onToggle: (self) => {
            if (self.isActive) active.value = el.dataset.scene || 'hero'
          }
        })
      )
    })
    active.value = sections[0]?.dataset.scene || 'hero'
  }

  onMounted(() => {
    bind()
    nuxtApp.hook('page:finish', () => requestAnimationFrame(bind))
  })
  onBeforeUnmount(() => triggers.forEach((t) => t.kill()))

  return { active }
}
