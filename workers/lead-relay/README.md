# Lead relay (Cloudflare Worker)

Receives the contact-modal lead from the static site and forwards it to a Telegram group.
The bot token never reaches the browser or the static output. Single file `worker.js`, no dependencies.

## Telegram guruhga ulash

Checklist for the owner. Do it once, before the first deploy.

- [ ] **Create the bot.** In Telegram, message `@BotFather`, send `/newbot`, keep the token (`123456:ABC...`).
- [ ] **Add the bot to the group** (the group that answers leads).
- [ ] **Let it send messages.** A normal group needs nothing more. If only admins may post, make the bot an admin.
- [ ] **Let it read the group** (needed for `getUpdates`). Either BotFather `/setprivacy` → Disable, or make the bot an admin.
- [ ] **Post any message in the group** (for example `test`).
- [ ] **Read the group id.** Open `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `message.chat.id` from the group message. If it is empty, the bot has no updates yet: post again, or check that no webhook is set.
- [ ] **Check the id format.** Group ids are negative. A supergroup id starts with `-100`, for example `-1001234567890`. An id like `12345` (no minus) is a user, not the group.
- [ ] **Remember the upgrade trap.** When a group becomes a supergroup (member limit, topics, admin change), its id changes. Telegram then rejects the old id, the relay returns 502, and the lead is lost. Read the new id with `getUpdates` and run `npx wrangler secret put TELEGRAM_CHAT_ID` again.
- [ ] **Run the smoke test** below and confirm the message and the button arrive in the group.

## Env variables

| Variable | Local (`workers/lead-relay/.dev.vars`) | Production (`wrangler secret put`) | What |
|---|---|---|---|
| `TELEGRAM_BOT_TOKEN` | yes | `npx wrangler secret put TELEGRAM_BOT_TOKEN` | BotFather token. Secret. |
| `TELEGRAM_CHAT_ID` | yes | `npx wrangler secret put TELEGRAM_CHAT_ID` | Group id, negative, `-100...` for supergroups. |
| `ALLOWED_ORIGIN` | yes | `wrangler.toml` `[vars]` (not a secret) | Comma list of origins allowed to POST. Prod: `https://3dot.uz`. |

- Local: `cp workers/lead-relay/.dev.vars.example workers/lead-relay/.dev.vars`, then fill in the values. `.dev.vars` is git-ignored (`git check-ignore workers/lead-relay/.dev.vars` prints the path). Never commit it.
- Production: run the `secret put` commands from `workers/lead-relay`. Secrets never go into `wrangler.toml`, the Nuxt `.env`, or the static output.

## Deploy (one-time, owner)

1. Complete the Telegram guruhga ulash checklist above.
2. **Deploy from this folder:**
   ```sh
   cd workers/lead-relay
   npx wrangler login
   npx wrangler secret put TELEGRAM_BOT_TOKEN   # paste the token
   npx wrangler secret put TELEGRAM_CHAT_ID     # paste the group id, e.g. -1001234567890
   npx wrangler deploy
   ```
   Wrangler prints the URL, e.g. `https://lead-relay.<subdomain>.workers.dev`. Any path works, so `/lead` is fine.
3. **Point the site at it.** GitHub repo, Settings, Secrets and variables, Actions, Variables:
   `LEAD_ENDPOINT` = the worker URL. Or run `gh variable set LEAD_ENDPOINT --body "https://..."`.
   Then re-run the Deploy workflow, because the endpoint is baked in at generate time.

## Local dev

```sh
cp workers/lead-relay/.dev.vars.example workers/lead-relay/.dev.vars   # fill in the values
cd workers/lead-relay && npx wrangler dev                              # http://localhost:8787
node workers/lead-relay/test.mjs                                       # self-check, no network
```

Locally, set `NUXT_PUBLIC_LEAD_ENDPOINT=http://localhost:8787/lead` in `.env`.

## Message format

Telegram receives `parse_mode: HTML`. Labels are bold, every user value is escaped (`&`, `<`, `>`), so input such as `<b>x</b>` shows up literally. Lines in fixed order; empty budget, message and page lines are omitted. The `Telegramda yozish` button appears only for an `@username` contact.

Example (full lead, Uzbek; labels are bold in Telegram):

```
Yangi so‘rov: bepul audit
Ism: Dilshod Karimov
Aloqa: dilshod@example.uz
Byudjet: $10–30k
Til: O‘zbek — shu tilda javob bering

Xabar: Do‘konlar tarmog‘i uchun CRM kerak, 1C bilan integratsiya.
—
Sahifa: Bosh sahifa
Vaqt: 15.10.2026, 14:32 (Toshkent)
```

The time is always Tashkent (UTC+5). Phone numbers `998…`, `+998 90 123-45-67` and `+998(90)1234567` are shown as `+998901234567`, so Telegram can link them.

## Contract

| Case | Status |
|---|---|
| `OPTIONS` | 204 |
| not `POST` | 405 |
| `Origin` not in `ALLOWED_ORIGIN` (including `Origin: null`) | 403, no CORS headers |
| `Origin` missing | Accepted (204 if valid), no CORS headers. Decided: not blocked, because Origin is a browser signal, not auth. Non-browser callers such as curl omit it. |
| body over 2 KB | 413 |
| invalid JSON, or missing `name`/`contact`, bad `locale`, field too long | 400 |
| `hp` (honeypot) filled | 204, nothing forwarded |
| more than 5 requests per IP per 10 min | 429 |
| Telegram error (for example 400 after a group upgrade) or unreachable | 502 |
| forwarded | 204 |

The body is `text/plain` JSON (no CORS preflight).

## Smoke test after deploy

Use a real Telegram handle you control, or the test handle below. The message lands in the group.

```sh
curl -i -X POST "https://lead-relay.<subdomain>.workers.dev/lead" \
  -H "Origin: https://3dot.uz" -H "Content-Type: text/plain" \
  -d '{"name":"Test","contact":"@threedot_test","locale":"uz","page":"/"}'
```

Expect `HTTP/2 204`. In the group: the message with `Aloqa: @threedot_test`, `Sahifa: Bosh sahifa`, and a `Telegramda yozish` button under it. Delete the test message afterwards.

If the status is 502, run `npx wrangler tail` and look at `telegram: HTTP <code>`: 400 usually means a wrong or upgraded chat id, 401 a wrong token, 403 the bot is not in the group or cannot post.

## Operations

- Logs: `npx wrangler tail`.
- Rollback: `npx wrangler deployments list`, then `npx wrangler rollback <version-id>`.
- Rotate the token: create a new token in BotFather, `npx wrangler secret put TELEGRAM_BOT_TOKEN`, then revoke the old one.

## Known limits (ponytail)

- The rate limit lives in memory per isolate. It is best effort, so a determined sender can get past it.
  Upgrade path: the Workers Rate Limiting binding, or Turnstile on the form.
- Spam beyond the honeypot and the rate limit is not filtered. Add Turnstile if spam shows up in the chat.
- Time is fixed UTC+5. Uzbekistan has no DST; switch to `Intl` `Asia/Tashkent` if that changes.
