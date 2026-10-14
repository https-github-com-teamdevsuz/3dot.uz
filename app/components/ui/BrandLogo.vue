<script setup lang="ts">
/**
 * 3Dot logo — "3dot" wordmark (Unbounded Bold, outlined) + chrome-lime sphere as the full stop.
 * Text uses currentColor, so set `color` on the parent to recolour it.
 * Source & other concepts: brand/ folder (SVG files).
 */
withDefaults(defineProps<{ variant?: 'wordmark' | 'icon'; label?: string }>(), {
  variant: 'wordmark',
  label: '3dot'
})
const gid = `dot-${useId()}`
</script>

<template>
  <svg
    v-if="variant === 'wordmark'"
    class="brand-logo"
    viewBox="0 0 321.8 78.6"
    role="img"
    :aria-label="label"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient :id="gid" cx="36%" cy="30%" r="78%">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset=".2" stop-color="#efffc8" />
        <stop offset=".5" stop-color="#c8ff5a" />
        <stop offset=".82" stop-color="#4d6b12" />
        <stop offset="1" stop-color="#2a3a08" />
      </radialGradient>
    </defs>
    <path fill="currentColor" d="M1.9 26.2Q2.4 19.1 7 13.2Q11.5 7.4 20 3.9Q28.5 0.4 40.7 0.4Q51.1 0.4 58.8 3Q66.5 5.6 70.8 10.3Q75.1 15.1 75.1 21.4Q75.1 27.1 71.2 31.6Q67.4 36.2 59 38.2Q67.4 39.7 72.1 44Q76.7 48.2 76.7 55.2Q76.7 62 72.3 67.3Q67.9 72.6 59.5 75.6Q51.1 78.6 39.1 78.6Q27.4 78.6 18.8 75.3Q10.1 72.1 5.2 66.2Q0.3 60.3 0 52.3H20.6Q21.4 57.3 25.9 60Q30.3 62.7 39.1 62.7Q47.1 62.7 51.4 60.3Q55.6 57.9 55.6 53.6Q55.6 49.8 52.4 47.9Q49.1 46 40 46H27.1V32H40Q47.9 32 51.1 29.9Q54.2 27.8 54.2 24.3Q54.2 20.5 50.6 18.4Q46.9 16.3 39.6 16.3Q31.8 16.3 27.6 18.9Q23.4 21.5 22.6 26.2ZM135.4 77 133.9 64.9Q129.8 71.4 123.5 75Q117.2 78.6 109.3 78.6Q100.9 78.6 94.6 74.8Q88.2 71.1 84.6 64.3Q81 57.5 81 48.5Q81 39.4 84.6 32.6Q88.2 25.8 94.6 22Q100.9 18.2 109.3 18.2Q117.1 18.2 123.4 21.7Q129.7 25.3 133.8 31.6L137.6 0H158.8L152.9 46.9L156.5 77ZM101.7 48.5Q101.7 54.8 105.6 58.9Q109.4 63 115.4 63Q121.6 63 126.8 58.9Q131.9 54.8 134 48.5Q132.6 44.2 129.8 40.9Q127 37.6 123.3 35.7Q119.6 33.8 115.4 33.8Q109.4 33.8 105.6 38Q101.7 42.1 101.7 48.5ZM196.9 78.6Q185.9 78.6 177.7 74.8Q169.4 71.1 164.9 64.3Q160.3 57.5 160.3 48.5Q160.3 39.4 164.9 32.6Q169.4 25.8 177.7 22Q185.9 18.2 196.9 18.2Q207.8 18.2 216.1 22Q224.3 25.8 228.9 32.6Q233.5 39.4 233.5 48.5Q233.5 57.5 228.9 64.3Q224.3 71.1 216.1 74.8Q207.8 78.6 196.9 78.6ZM196.9 63.5Q204.4 63.5 208.6 59.5Q212.8 55.5 212.8 48.5Q212.8 41.4 208.6 37.4Q204.4 33.4 196.9 33.4Q189.4 33.4 185.2 37.4Q180.9 41.4 180.9 48.5Q180.9 55.5 185.2 59.5Q189.4 63.5 196.9 63.5ZM233.8 35V26.1L245.4 21.4L254.2 4.5H265.8V19.9H289.8V35H265.8V51.8Q265.8 58 268.3 60.5Q270.8 63 277.4 63Q281.6 63 284.9 62.3Q288.1 61.6 290.8 60.3V75.7Q287.7 76.8 282.9 77.7Q278 78.6 272.8 78.6Q258.6 78.6 252 72.2Q245.4 65.7 245.4 54.6V35Z" />
    <circle class="brand-logo__dot" cx="310.3" cy="65.5" r="11.5" :fill="`url(#${gid})`" />
  </svg>

  <svg
    v-else
    class="brand-logo"
    viewBox="0 0 105.7 78.2"
    role="img"
    :aria-label="label"
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <radialGradient :id="gid" cx="36%" cy="30%" r="78%">
        <stop offset="0" stop-color="#ffffff" />
        <stop offset=".2" stop-color="#efffc8" />
        <stop offset=".5" stop-color="#c8ff5a" />
        <stop offset=".82" stop-color="#4d6b12" />
        <stop offset="1" stop-color="#2a3a08" />
      </radialGradient>
    </defs>
    <path fill="currentColor" d="M1.9 25.8Q2.4 18.7 7 12.9Q11.5 7 20 3.5Q28.5 0 40.7 0Q51.1 0 58.8 2.6Q66.5 5.2 70.8 10Q75.1 14.7 75.1 21Q75.1 26.7 71.2 31.3Q67.4 35.8 59 37.8Q67.4 39.3 72.1 43.6Q76.7 47.8 76.7 54.8Q76.7 61.6 72.3 66.9Q67.9 72.2 59.5 75.2Q51.1 78.2 39.1 78.2Q27.4 78.2 18.8 75Q10.1 71.7 5.2 65.8Q0.3 59.9 0 51.9H20.6Q21.4 56.9 25.9 59.6Q30.3 62.3 39.1 62.3Q47.1 62.3 51.4 59.9Q55.6 57.5 55.6 53.2Q55.6 49.4 52.4 47.5Q49.1 45.6 40 45.6H27.1V31.6H40Q47.9 31.6 51.1 29.5Q54.2 27.4 54.2 23.9Q54.2 20.1 50.6 18Q46.9 15.9 39.6 15.9Q31.8 15.9 27.6 18.5Q23.4 21.1 22.6 25.8Z" />
    <circle class="brand-logo__dot" cx="94.2" cy="65.1" r="11.5" :fill="`url(#${gid})`" />
  </svg>
</template>

<style scoped>
.brand-logo {
  display: block;
  height: 1em;
  width: auto;
  overflow: visible;
}
.brand-logo__dot {
  transform-box: fill-box;
  transform-origin: center;
  transition: transform 0.6s var(--ease-out, ease);
}
a:hover .brand-logo__dot,
.brand-logo:hover .brand-logo__dot {
  transform: scale(1.25);
}
</style>
