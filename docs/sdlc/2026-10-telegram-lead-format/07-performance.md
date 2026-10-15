# 07 · Performance audit — 2026-10-telegram-lead-format

1. Scope check. `git diff --name-only` lists only:
- .env.example
- workers/lead-relay/.dev.vars.example
- workers/lead-relay/README.md
- workers/lead-relay/test.mjs
- workers/lead-relay/worker.js

No app/**, nuxt.config.ts or public/** file changed, so the site bundle is unchanged by this feature. The untracked docs folder is not part of the bundle.

2. Worker cost
- worker.js went from 4280 B to 5897 B (+1.6 KB). The limit for a Cloudflare Worker is 1 MB compressed, so this is negligible.
- `formatLead(f, now)` does only string work: one `Date` and `toISOString()`, slices, template strings, and `escapeHtml` and `formatPhone` on up to 5 fields.
- It builds one array of at most 9 lines, then a single `join`.
- There are no loops and no regex beyond one `USERNAME_RE.test`. The `reply_markup` object is built only for @username contacts.
- Per-request cost is microseconds, far below the Worker CPU limit.
- There is no new network call. The one existing Telegram `fetch` remains, and only its payload changed (`text` plus an optional `reply_markup`).
- The rate-limit map is unchanged. `const hits = new Map()` is still per-isolate, and the `rateLimited(ip, now)` call and the 429 path are untouched.
- That limiter is best-effort and resets when the isolate recycles. This is an existing property and not a regression.

3. Site bundle (`.output/public` exists and looks complete, so I measured it; I did not run generate).

| metric | budget | measured | status |
|---|---|---|---|
| Initial JS, gzip | 180 KB | about 141 KB | pass |
| three.js chunk (`XRCGpbXX.js`), gzip | 200 KB | about 128 KB (131,123 B) | pass |
| Three chunk loading | lazy | `prefetch` only, not `modulepreload` | pass |
| Worker size | n/a | 5.9 KB | pass |

- "Initial JS" is the entry plus the 8 modulepreloaded chunks in `index.html`.
- The three chunk is excluded from the initial load because it is only prefetched, so it is isolated and lazy.
- Not measured, no app change: LCP, CLS, FPS and Lighthouse. The app code is untouched, so earlier results still hold.

Recommendations: none needed for this feature. Optionally, add a Cloudflare rate-limiting rule or a KV/Durable Object limiter later if abuse appears.

PERF: PASS
