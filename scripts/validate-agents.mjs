#!/usr/bin/env node
/**
 * Validates that every SDLC agent pins exactly the model declared in sdlc/pipeline.json.
 * Runs locally (`npm run agents:check`), in the /sdlc command and in CI.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pipeline = JSON.parse(fs.readFileSync(path.join(root, 'sdlc/pipeline.json'), 'utf8'))
const agentsDir = path.join(root, '.claude/agents')

/** Minimal frontmatter parser (key: value pairs between the first two --- lines). */
export function parseFrontmatter(text) {
  const match = text.replace(/\r\n/g, '\n').match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/)
  if (!match) return null
  const data = {}
  for (const line of match[1].split('\n')) {
    const m = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (m) data[m[1]] = m[2].trim().replace(/^["']|["']$/g, '')
  }
  return { data, body: match[2] }
}

const errors = []
const rows = []
const files = fs.existsSync(agentsDir) ? fs.readdirSync(agentsDir).filter((f) => f.endsWith('.md')) : []
const seen = new Set()

for (const file of files) {
  const fm = parseFrontmatter(fs.readFileSync(path.join(agentsDir, file), 'utf8'))
  const id = file.replace(/\.md$/, '')
  if (!fm) {
    errors.push(`${file}: missing YAML frontmatter`)
    continue
  }
  const { name, model, description, tools } = fm.data
  seen.add(name)
  if (name !== id) errors.push(`${file}: name "${name}" must match file name "${id}"`)
  if (!description) errors.push(`${file}: description is required (it drives auto-delegation)`)
  if (!tools) errors.push(`${file}: tools must be listed explicitly (least privilege)`)
  if (!model) errors.push(`${file}: model is not pinned — agent would silently inherit the parent model`)
  else if (model === 'inherit') errors.push(`${file}: model "inherit" is not allowed in the SDLC pipeline`)
  else if (!pipeline.allowedModels.includes(model)) errors.push(`${file}: model "${model}" not in allowedModels ${JSON.stringify(pipeline.allowedModels)}`)

  const expected = pipeline.agents[name]?.model
  if (!expected) errors.push(`${file}: agent "${name}" is not registered in sdlc/pipeline.json → agents`)
  else if (model && model !== expected) errors.push(`${file}: model "${model}" ≠ pipeline.json "${expected}"`)
  if (fm.body.trim().length < 200) errors.push(`${file}: system prompt is suspiciously short`)

  rows.push({ agent: name, model: model ?? '—', expected: expected ?? '—', ok: model === expected })
}

for (const name of Object.keys(pipeline.agents)) {
  if (!seen.has(name)) errors.push(`pipeline.json: agent "${name}" has no .claude/agents/${name}.md`)
}
for (const phase of pipeline.phases) {
  for (const a of phase.agents) {
    if (!pipeline.agents[a]) errors.push(`pipeline.json: phase ${phase.id} references unknown agent "${a}"`)
  }
}

console.log('\nSDLC agents → pinned models\n')
console.table(rows)

if (errors.length) {
  console.error(`\n✖ ${errors.length} problem(s):`)
  for (const e of errors) console.error('  - ' + e)
  process.exit(1)
}
console.log(`✔ ${rows.length} agents, ${pipeline.phases.length} phases — every agent uses its own pinned model.\n`)
