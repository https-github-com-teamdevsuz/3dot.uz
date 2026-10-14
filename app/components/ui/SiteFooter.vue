<script setup lang="ts">
import { site } from '~/data/site'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="footer">
    <div class="container">
      <div class="footer__top">
        <nav class="footer__nav" aria-label="Footer">
          <NuxtLink v-for="item in site.nav" :key="item.href" :to="item.href">{{ item.label }}</NuxtLink>
        </nav>
        <div class="footer__contacts">
          <a :href="`tel:${site.phone.replace(/\s/g, '')}`">{{ site.phone }}</a>
          <a :href="`mailto:${site.email}`">{{ site.email }}</a>
          <span class="dim">{{ site.city }}</span>
        </div>
        <ul class="footer__socials">
          <li v-for="s in site.socials" :key="s.label">
            <a :href="s.href" target="_blank" rel="noopener">{{ s.label }} ↗</a>
          </li>
        </ul>
      </div>
      <div class="footer__brand" aria-hidden="true"><BrandLogo /></div>
      <div class="footer__bottom mono dim">
        <span>© {{ year }} {{ site.brand }}</span>
        <span>{{ site.tagline.join(' ') }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  position: relative;
  z-index: 1;
  padding-top: 80px;
  border-top: 1px solid var(--line);
  background: linear-gradient(to bottom, transparent, var(--bg) 40%);
}
.footer__top {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}
.footer__nav,
.footer__contacts,
.footer__socials {
  display: grid;
  gap: 10px;
  align-content: start;
}
.footer__nav a,
.footer__contacts a,
.footer__socials a {
  transition: color 0.3s;
}
.footer__nav a:hover,
.footer__contacts a:hover,
.footer__socials a:hover {
  color: var(--accent);
}
.footer__brand {
  margin-top: 64px;
  color: var(--fg);
  /* logo spans the container width */
  font-size: calc((min(100vw, 1920px) - 2 * var(--gutter)) * 0.244);
  max-width: 100%;
  -webkit-mask-image: linear-gradient(180deg, #000 35%, rgba(0, 0, 0, 0.12));
  mask-image: linear-gradient(180deg, #000 35%, rgba(0, 0, 0, 0.12));
}
.footer__bottom {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  padding-block: 24px;
}
@media (max-width: 720px) {
  .footer__top {
    grid-template-columns: 1fr;
  }
  .footer__bottom {
    flex-direction: column;
  }
}
</style>
