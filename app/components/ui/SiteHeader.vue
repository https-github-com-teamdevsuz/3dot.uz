<script setup lang="ts">
import { site } from '~/data/site'

const { show } = useContactModal()
const route = useRoute()
const nuxtApp = useNuxtApp()
const menuOpen = ref(false)
const hidden = ref(false)
const scrolled = ref(false)

const go = (href: string) => {
  menuOpen.value = false
  const hash = href.split('#')[1]
  if (hash && route.path === '/') {
    nuxtApp.$scrollTo(`#${hash}`)
  } else {
    navigateTo(href)
  }
}

let last = 0
const onScroll = () => {
  const y = window.scrollY
  scrolled.value = y > 40
  hidden.value = y > 300 && y > last && !menuOpen.value
  last = y
}
onMounted(() => window.addEventListener('scroll', onScroll, { passive: true }))
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

watch(menuOpen, (open) => {
  const lenis = nuxtApp.$lenis
  if (open) lenis?.stop()
  else lenis?.start()
})
</script>

<template>
  <header class="header" :class="{ 'header--hidden': hidden, 'header--scrolled': scrolled, 'header--open': menuOpen }">
    <div class="header__inner container">
      <NuxtLink to="/" class="header__logo" aria-label="3dot — bosh sahifa">
        <BrandLogo />
      </NuxtLink>

      <nav class="header__nav" aria-label="Asosiy menyu">
        <a v-for="item in site.nav" :key="item.href" :href="item.href" class="header__link" @click.prevent="go(item.href)">
          <span class="header__link-text" :data-text="item.label">{{ item.label }}</span>
        </a>
      </nav>

      <button class="btn header__cta" type="button" @click="show">Loyihani muhokama qilish</button>

      <button
        class="header__burger"
        type="button"
        :aria-expanded="menuOpen"
        aria-controls="mobile-menu"
        :aria-label="menuOpen ? 'Menyuni yopish' : 'Menyuni ochish'"
        @click="menuOpen = !menuOpen"
      >
        <span /><span />
      </button>
    </div>

    <Transition name="menu">
      <div v-if="menuOpen" id="mobile-menu" class="menu">
        <nav class="menu__nav container">
          <a v-for="(item, i) in site.nav" :key="item.href" :href="item.href" class="menu__link" :style="{ '--i': i }" @click.prevent="go(item.href)">
            <span class="mono dim">0{{ i + 1 }}</span>{{ item.label }}
          </a>
        </nav>
        <div class="menu__footer container">
          <a :href="`mailto:${site.email}`">{{ site.email }}</a>
          <button class="btn btn--solid" type="button" @click="menuOpen = false; show()">Loyihani muhokama qilish</button>
        </div>
      </div>
    </Transition>
  </header>
</template>

<style scoped>
.header {
  position: fixed;
  inset: 0 0 auto;
  z-index: 50;
  transition: transform 0.6s var(--ease-out), background-color 0.6s;
}
.header--hidden {
  transform: translateY(-110%);
}
.header--scrolled:not(.header--open) {
  background: linear-gradient(to bottom, rgba(5, 5, 5, 0.85), rgba(5, 5, 5, 0));
}
.header__inner {
  display: flex;
  align-items: center;
  gap: 32px;
  height: 88px;
}
.header__logo {
  font-size: 26px; /* = logo height */
  margin-right: auto;
  position: relative;
  z-index: 2;
  color: var(--fg);
}
.header__nav {
  display: flex;
  gap: 36px;
}
.header__link {
  position: relative;
  display: inline-block;
  overflow: hidden;
  height: 1.5em;
  font-weight: 500;
}
.header__link-text {
  display: inline-block;
  transition: transform 0.55s var(--ease-out);
}
.header__link-text::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 100%;
  color: var(--accent);
}
.header__link:hover .header__link-text {
  transform: translateY(-100%);
}
.header__cta {
  height: 46px;
  padding: 0 22px;
  font-size: 0.92rem;
}
.header__burger {
  display: none;
  position: relative;
  z-index: 2;
  width: 46px;
  height: 46px;
  border-radius: 50%;
  border: 1px solid var(--line);
}
.header__burger span {
  position: absolute;
  left: 13px;
  right: 13px;
  height: 1.5px;
  background: currentColor;
  transition: transform 0.5s var(--ease-out);
}
.header__burger span:first-child {
  top: 19px;
}
.header__burger span:last-child {
  top: 26px;
}
.header--open .header__burger span:first-child {
  transform: translateY(3.5px) rotate(45deg);
}
.header--open .header__burger span:last-child {
  transform: translateY(-3.5px) rotate(-45deg);
}

.menu {
  position: fixed;
  inset: 0;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 120px 0 32px;
  background: var(--bg);
}
.menu__link {
  display: flex;
  align-items: baseline;
  gap: 16px;
  padding-block: 12px;
  border-bottom: 1px solid var(--line);
  font-family: var(--font-display);
  font-size: clamp(2rem, 9vw, 3.4rem);
  letter-spacing: -0.04em;
}
.menu__footer {
  display: flex;
  flex-direction: column;
  gap: 20px;
  align-items: flex-start;
}
.menu-enter-active,
.menu-leave-active {
  transition: clip-path 0.7s var(--ease-in-out);
}
.menu-enter-from,
.menu-leave-to {
  clip-path: inset(0 0 100% 0);
}

@media (max-width: 900px) {
  .header__nav,
  .header__cta {
    display: none;
  }
  .header__burger {
    display: block;
  }
  .header__inner {
    height: 72px;
  }
}
</style>
