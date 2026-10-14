# 3dot — 3D portfolio (Nuxt 4 + three.js)

Dark, typography-led creative-studio portfolio with a liquid-chrome WebGL blob that morphs between page sections (reference style: liqium.ru — structure and feel only, never its copy, brand or clients).

## Commands
- `npm run dev` — dev server (http://localhost:3000)
- `npm run typecheck` · `npm run build` · `npm run generate` (static prerender → `.output/public`)
- `npm run test:e2e` — Playwright (desktop, mobile, reduced-motion); run `npm run generate` first
- `npm run agents:check` — verifies every SDLC agent pins its own model
- `npm run sdlc:status` — progress of each feature through the pipeline

## Architecture
- `app/webgl/LiquidScene.ts` — framework-agnostic three.js scene; `scenePresets.ts` — blob state per section.
- `app/components/webgl/LiquidCanvas.client.vue` — mounts the scene, lazy-loads three.js.
- `app/plugins/motion.client.ts` — Lenis + GSAP ScrollTrigger, provides `$lenis`, `$scrollTo`.
- `app/composables/useReveal.ts` — `data-split`, `data-reveal`, `data-scrub-words`, `data-parallax`.
- `app/composables/useSceneSections.ts` — `[data-scene]` in view → `useActiveScene()` → blob preset.
- `app/data/site.ts` — **all copy** (Uzbek Latin). Demo projects/clients are fictional placeholders.
- Sections: `app/components/sections/*`, UI: `app/components/ui/*` (auto-imported without prefix).

## Rules
- Browser APIs only in `onMounted`, `*.client.vue` or client plugins (site is SSR-prerendered).
- Call `useNuxtApp()` / `useRoute()` at the top of `setup`, not inside handlers.
- Every GSAP tween/ScrollTrigger lives in a `gsap.context()` / `matchMedia()` and is reverted on unmount.
- Every three.js resource is disposed in `LiquidScene.dispose()`; no allocations in the render loop.
- Respect `prefers-reduced-motion` everywhere.

## SDLC pipeline (multi-agent)
Run `/sdlc <feature description>` in Claude Code. The orchestrator delegates each phase to a subagent in `.claude/agents/`; each agent's model is pinned in its frontmatter and mirrored in `sdlc/pipeline.json`.

| Phase | Agent → model |
|---|---|
| 01 requirements | product-analyst → sonnet |
| 02 design | solution-architect → opus ∥ ui-ux-designer → sonnet |
| 03 implementation | webgl-engineer → opus ∥ frontend-developer → sonnet |
| 04 review | code-reviewer → opus |
| 05 testing | qa-engineer → sonnet ∥ performance-auditor → sonnet |
| 06 release | devops-engineer → haiku |
| 07 docs | tech-writer → haiku |

Model enforcement: `.claude/settings.json` registers a PreToolUse hook (`scripts/guard-agent-model.mjs`) that blocks any call overriding an agent's model or any drift between frontmatter and `pipeline.json`; CI runs `scripts/validate-agents.mjs`. Never pass `model` when invoking these agents. Artifacts go to `docs/sdlc/<feature-id>/` using `sdlc/templates/`.
