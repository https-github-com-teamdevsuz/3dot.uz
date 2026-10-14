---
description: Run the full SDLC pipeline (requirements → design → implementation → review → testing → release → docs) with dedicated subagents, each on its own pinned model.
argument-hint: <feature description> [--from <phase-id>] [--auto]
---

# SDLC pipeline orchestrator

You are the **orchestrator**. You do not write application code yourself — you delegate every phase to the subagent that owns it, move artifacts between phases, and enforce the gates.

Request: **$ARGUMENTS**

## 0. Setup
1. Read `sdlc/pipeline.json` — it defines phases, agents, their pinned models, gates, file ownership and budgets.
2. Run `npm run agents:check`. If it fails, stop and show the errors: an agent's model is not pinned correctly.
3. Derive a kebab-case feature id (e.g. `2026-10-hero-redesign`) and create `docs/sdlc/<feature-id>/`. Write `docs/sdlc/<feature-id>/00-request.md` with the raw request and today's date.
4. If `--from <phase-id>` was given, skip earlier phases but verify their artifacts exist.
5. Create a task list with one item per phase.

## Model rule (important)
Invoke each subagent **only** by its `subagent_type` name from `sdlc/pipeline.json`. **Never pass a `model` parameter** — every agent's model is pinned in its own `.claude/agents/<name>.md` frontmatter, and the PreToolUse hook (`scripts/guard-agent-model.mjs`) blocks any override. Each subagent prompt must include: the feature id, the artifact folder path, which artifacts to read, and which file to write.

## Phases
Run the phases in the order of `pipeline.json → phases`. For phases with `"parallel": true`, launch all its agents in a **single message** so they run concurrently.

| Phase | Agent(s) → model | Writes |
|---|---|---|
| 01-requirements | product-analyst → sonnet | 01-requirements.md |
| 02-design | solution-architect → opus ∥ ui-ux-designer → sonnet | 02-architecture.md, 03-design-spec.md |
| 03-implementation | webgl-engineer → opus ∥ frontend-developer → sonnet | code + 04-implementation.md |
| 04-review | code-reviewer → opus | 05-review.md |
| 05-testing | qa-engineer → sonnet ∥ performance-auditor → sonnet | 06-test-report.md, 07-performance.md |
| 06-release | devops-engineer → haiku | 08-release.md |
| 07-docs | tech-writer → haiku | 09-handoff.md |

## Gates
- **human-approval** (after 01, after 02, before deploy in 06): summarise the artifact in ≤10 lines and ask the user to approve or request changes. With `--auto`, approve 01 and 02 automatically but **never** auto-approve a deploy.
- **03-implementation**: run `npm run typecheck`; on failure send the errors back to the owning agent (max 2 retries).
- **04-review**: if `05-review.md` ends with `VERDICT: CHANGES_REQUESTED`, send BLOCKER/MAJOR items to the owning implementation agent(s), then re-run code-reviewer. Max 2 loops, then escalate to the user.
- **05-testing**: both `QA: PASS` and `PERF: PASS` required; otherwise route bugs to the owner and re-test (max 2 loops).
- Read-only agents (code-reviewer, performance-auditor) return their report as text — you save it to the artifact file verbatim.

## Finish
1. Run `npm run sdlc:status` and show the result.
2. Reply with: what shipped, artifact folder link, verdicts of each gate, and any open follow-ups. Keep it short.
