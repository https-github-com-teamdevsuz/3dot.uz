# 3dot — 3D portfolio (Nuxt 4 + three.js)

Typography-led creative-studio portfolio (dark + light theme, uz/ru/en) with a liquid-chrome WebGL blob that morphs between page sections (reference style: liqium.ru — structure and feel only, never its copy, brand or clients).

## Commands
- `npm run dev` — dev server (http://localhost:3000)
- `npm run typecheck` · `npm run build` · `npm run generate` (static prerender → `.output/public`)
- `npm run test:e2e` — Playwright (desktop, mobile, reduced-motion); run `npm run generate` first
- `npm run agents:check` — verifies every SDLC agent pins its own model
- `npm run sdlc:status` — progress of each feature through the pipeline

## Architecture
- `app/webgl/LiquidScene.ts` — framework-agnostic three.js scene; `scenePresets.ts` — blob state per section + `SCENE_PALETTES` (dark/light); `LiquidScene.setTheme()` cross-fades them.
- `app/components/webgl/LiquidCanvas.client.vue` — mounts the scene, lazy-loads three.js.
- `app/plugins/motion.client.ts` — Lenis + GSAP ScrollTrigger, provides `$lenis`, `$scrollTo`.
- `app/composables/useReveal.ts` — `data-split`, `data-reveal`, `data-scrub-words`, `data-parallax`.
- `app/composables/useSceneSections.ts` — `[data-scene]` in view → `useActiveScene()` → blob preset.
- Copy: `app/data/site.uz.ts` (source of truth) / `site.ru.ts` / `site.en.ts` share one `SiteCopy` type — a missing key fails typecheck. `site.ts` holds only shared data (slugs, SITE_URL, types). Demo projects/clients are fictional placeholders. ru/en edits go through the `linguist` agent.
- i18n: hand-rolled. `useLocale()` / `useSite()` / `useLocalePath()` in `app/composables/useLocale.ts`; uz at `/`, ru/en under `/ru`, `/en` (cloned via `pages:extend` in `nuxt.config.ts`, all routes listed in `nitro.prerender.routes`). Stored locale key `3dot:locale`.
- Theme: `data-theme` on `<html>` set only by the inline head script in `nuxt.config.ts` (before paint) and `useTheme()`; tokens for both themes in `app/assets/css/main.css`. Stored key `3dot:theme`. Never render theme-dependent markup during SSR.
- Sections: `app/components/sections/*`, UI: `app/components/ui/*` (auto-imported without prefix).

## Rules
- Browser APIs only in `onMounted`, `*.client.vue` or client plugins (site is SSR-prerendered). The one exception is the inline theme/locale script in `app.head`.
- Call `useNuxtApp()` / `useRoute()` at the top of `setup`, not inside handlers.
- Every GSAP tween/ScrollTrigger lives in a `gsap.context()` / `matchMedia()` and is reverted on unmount.
- Every three.js resource is disposed in `LiquidScene.dispose()`; no allocations in the render loop.
- Respect `prefers-reduced-motion` everywhere.

## SDLC pipeline (multi-agent)
Run `/sdlc <feature description>` in Claude Code. The orchestrator delegates each phase to a subagent in `.claude/agents/`; each agent's model is pinned in its frontmatter and mirrored in `sdlc/pipeline.json`.

| Phase | Agent → model |
|---|---|
| 01 requirements | business-analyst → opus (strategy, runs first) → product-analyst → sonnet |
| 02 design | solution-architect → opus ∥ ui-ux-designer → sonnet |
| 03 implementation | webgl-engineer → opus ∥ frontend-developer → sonnet ∥ linguist → opus ∥ seo-specialist → opus ∥ performance-engineer → opus |
| 04 review | code-reviewer → opus |
| 05 testing | qa-engineer → sonnet ∥ performance-auditor → sonnet |
| 06 release | devops-engineer → haiku |
| 07 docs | tech-writer → haiku |

Model enforcement: `.claude/settings.json` registers a PreToolUse hook (`scripts/guard-agent-model.mjs`) that blocks any call overriding an agent's model or any drift between frontmatter and `pipeline.json`; CI runs `scripts/validate-agents.mjs`. Never pass `model` when invoking these agents. Artifacts go to `docs/sdlc/<feature-id>/` using `sdlc/templates/`.
