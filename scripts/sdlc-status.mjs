#!/usr/bin/env node
/** Prints which SDLC artifacts exist for every feature in docs/sdlc/. */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const pipeline = JSON.parse(fs.readFileSync(path.join(root, 'sdlc/pipeline.json'), 'utf8'))
const dir = path.join(root, pipeline.artifactsDir)

const features = fs.existsSync(dir)
  ? fs.readdirSync(dir, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name)
  : []

if (!features.length) {
  console.log(`No features yet. Start one in Claude Code with:  /sdlc <feature description>`)
  process.exit(0)
}

const verdict = (file, re) => {
  if (!fs.existsSync(file)) return ''
  return fs.readFileSync(file, 'utf8').match(re)?.[0] ?? ''
}

for (const f of features.sort()) {
  console.log(`\n■ ${f}`)
  for (const phase of pipeline.phases) {
    const outputs = phase.outputs.map((o) => ({ o, ok: fs.existsSync(path.join(dir, f, o)) }))
    const done = outputs.every((x) => x.ok)
    const partial = outputs.some((x) => x.ok)
    const mark = done ? '✔' : partial ? '◐' : '·'
    const agents = phase.agents.map((a) => `${a}(${pipeline.agents[a].model})`).join(' ∥ ')
    console.log(`  ${mark} ${phase.id.padEnd(18)} ${agents}`)
  }
  const v = [
    verdict(path.join(dir, f, '05-review.md'), /VERDICT: \w+/),
    verdict(path.join(dir, f, '06-test-report.md'), /QA: \w+/),
    verdict(path.join(dir, f, '07-performance.md'), /PERF: \w+/)
  ].filter(Boolean)
  if (v.length) console.log(`  gates: ${v.join(' | ')}`)
}
