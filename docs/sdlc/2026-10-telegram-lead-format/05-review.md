## 05 · Review: 2026-10-telegram-lead-format

Scope: the `git diff` of the five owned files (`git diff --name-only` shows exactly `.env.example`, `workers/lead-relay/{worker.js,test.mjs,README.md,.dev.vars.example}`). I read all of them in full, along with 01–04.

**Checks run**
- `node workers/lead-relay/test.mjs`: 25/25 passed, exit 0. The stderr lines `telegram: HTTP 400` and `network error` are the expected 502-path logs.
- `npm run typecheck`: exit 0. It prints an unrelated `vue-router/volar` plugin-resolve warning. The worker is plain JS, so typecheck does not cover it.
- `git check-ignore workers/lead-relay/.dev.vars` prints the path, so the file is ignored.

**Focus items, all verified OK**
- **HTML escaping** (worker.js:34): `&` is replaced first, then `<` and `>`. That is all Telegram HTML needs in text nodes. Quotes only matter inside attributes, and our markup has none: the only tags are fixed `<b>` labels.
  - Every user field goes through `escapeHtml`: name (:48), contact after `formatPhone` (:49), budget (:50), message (:52), page (:54).
  - `LANG[f.locale]` (:51) is not user text: locale is checked against `LOCALES` at :104 before it is used.
- **reply_markup url** (:58): `f.contact.slice(1)` is used unescaped, but only after `USERNAME_RE` (:9) has matched the whole string against `^@[A-Za-z][A-Za-z0-9_]{4,31}$`. That allows only `[A-Za-z0-9_]`, so the URL cannot be injected into. The url is a JSON field, not HTML, so it needs no HTML escaping. Length 5–32 matches Telegram's username rules.
- **4096-character limit**: the raw body is capped at 2048 bytes (:80-82), so all user input together is ≤ ~2048 chars. Field caps add up to 1440 chars plus about 150 chars of fixed labels. Telegram counts length after entity parsing, so the `&amp;` expansion (up to 5x) does not count. The limit cannot be reached.
- **Phone regex** (:37-40): strips whitespace, `(`, `)` and `-`, then requires `^\+?998\d{9}$` and outputs `+998` + the last 9 digits. All three AC-4 forms normalise. `90 123 45 67`, email and free text come back unchanged (the original trimmed `c`, not the stripped `d`). Correct.
- **Time** (:44-45): `now + 5h` → `toISOString()` → slicing gives zero-padded 24h DD.MM.YYYY, HH:mm. Uzbekistan has no DST. One `Date.now()` (:111) is shared with the rate limiter. The ponytail comment names the upgrade path. Correct.
- **chat_id** (:122): the raw env string is passed through, so a `-100…` id is kept. Test :89 asserts `'-1001234567890'`.
- **Security unchanged**: the diff to `fetch` only touches :111-127. Origin/CORS, the 413 checks (header and actual bytes), the honeypot (it returns before `f` is built), validation, the 429 limit and status-only logging (the token is never logged, :133) are byte-identical apart from the shared `now`. `formatLead` only receives the 6 validated fields, so hp, IP and user-agent cannot reach the text.
- **README**: the checklist covers every AC-10 item (BotFather, add bot, send rights, privacy/admin for `getUpdates`, `chat.id`, negative and `-100` ids, upgrade trap with secret re-put, smoke test with the button). The env table matches `wrangler.toml` (`ALLOWED_ORIGIN` in `[vars]`, secrets via `secret put`). The 502 diagnosis section and the rendered example match the code and test :178-189.
- **Env docs**: `.dev.vars.example` has one comment per variable and empty secret values. The root `.env.example` block is correct, and the `NUXT_PUBLIC_LEAD_ENDPOINT` line is unchanged.

**Findings**

| Severity | file:line | Finding | Concrete fix |
|---|---|---|---|
| MINOR | workers/lead-relay/worker.js:63 | ADR-1 says to check that wrangler accepts the extra named export `formatLead` with `wrangler deploy --dry-run`. That was skipped (04-implementation, "Skipped"), so it is unverified that wrangler accepts it. | Before the first deploy, run `npx wrangler deploy --dry-run` in `workers/lead-relay`. If it rejects the export, use `export default { fetch, formatLead }` and import that in test.mjs:3. |
| MINOR | workers/lead-relay/test.mjs:83-95 | AC-8 (no honeypot value, IP or user-agent in `text`) is only guaranteed by how the code is structured. No test asserts it. | In the valid-lead test, add `assert.doesNotMatch(body.text, /2\.2\.2\.2/)`. Also add `assert.deepEqual(Object.keys(body).sort(), ['chat_id','disable_web_page_preview','parse_mode','text'])`. |
| NIT | docs/sdlc/.../03-design-spec.md "Escaping" | The spec says "Over 4096 chars: cut Xabar". Nothing implements this, and it is unreachable because of the 2048-byte body cap and Telegram counting after entity parsing (see above). | No code change. Note in 04 that the rule is unreachable, or delete it from the spec. |
| NIT | docs/sdlc/.../01-requirements.md AC-1/AC-3 | The requirements still show ASCII `'` and the `O'zbekcha — javob shu tilda` wording. The design spec and the linguist's U+2018 decision supersede them, and the code and tests follow the newer versions. | Optional: add a one-line "superseded by 03" note so QA does not test against the old strings. |

No BLOCKER or MAJOR issues. Escaping is complete for Telegram HTML mode, no user field reaches the markup or the button url unchecked, and every AC 1–12 is met. The changes from the original AC text are only the gate and spec decisions described above.

VERDICT: APPROVED
