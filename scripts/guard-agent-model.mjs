#!/usr/bin/env node
/**
 * Claude Code PreToolUse hook for the Task/Agent tool.
 *
 * Guarantees that every SDLC subagent runs on the model pinned for it:
 *  - if the caller passes a `model` override that differs from the pinned one → block (exit 2)
 *  - if the agent file's frontmatter drifted from sdlc/pipeline.json → block (exit 2)
 *  - otherwise allow, and append an audit line to .claude/logs/agent-runs.jsonl
 *
 * Exit code 2 = block; stderr is shown to Claude so it can retry correctly.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = process.env.CLAUDE_PROJECT_DIR || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')

let raw = ''
for await (const chunk of process.stdin) raw += chunk

let input
try {
  input = JSON.parse(raw || '{}')
} catch {
  process.exit(0) // not our business — never break the session on malformed input
}

const toolInput = input.tool_input ?? {}
const agent = toolInput.subagent_type
if (!agent) process.exit(0)

let pipeline
try {
  pipeline = JSON.parse(fs.readFileSync(path.join(root, 'sdlc/pipeline.json'), 'utf8'))
} catch {
  process.exit(0)
}

const pinned = pipeline.agents?.[agent]?.model
if (!pinned) process.exit(0) // built-in or non-SDLC agent: allow

// 1) runtime override
if (toolInput.model && toolInput.model !== pinned) {
  console.error(
    `[sdlc] Blocked: agent "${agent}" is pinned to model "${pinned}" (sdlc/pipeline.json) but the call requested "${toolInput.model}". ` +
      `Re-run the call WITHOUT the "model" parameter.`
  )
  process.exit(2)
}

// 2) frontmatter drift
try {
  const file = fs.readFileSync(path.join(root, '.claude/agents', `${agent}.md`), 'utf8').replace(/\r\n/g, '\n')
  const fm = file.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? ''
  const model = fm.match(/^model:\s*(\S+)/m)?.[1]
  if (model !== pinned) {
    console.error(
      `[sdlc] Blocked: .claude/agents/${agent}.md has model "${model ?? 'none'}" but sdlc/pipeline.json pins "${pinned}". ` +
        `Fix the frontmatter (npm run agents:check).`
    )
    process.exit(2)
  }
} catch {
  console.error(`[sdlc] Blocked: .claude/agents/${agent}.md not found.`)
  process.exit(2)
}

// 3) audit log
try {
  const dir = path.join(root, '.claude/logs')
  fs.mkdirSync(dir, { recursive: true })
  fs.appendFileSync(
    path.join(dir, 'agent-runs.jsonl'),
    JSON.stringify({ at: new Date().toISOString(), agent, model: pinned, description: toolInput.description ?? '' }) + '\n'
  )
} catch {
  /* logging is best-effort */
}

process.exit(0)
