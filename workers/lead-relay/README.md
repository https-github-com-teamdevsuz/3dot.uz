# Lead relay (Cloudflare Worker)

Receives the contact-modal lead from the static site and forwards it to a Telegram chat.
The bot token never reaches the browser or the static output. Single file `worker.js`, no dependencies.

## Deploy (one-time, owner)

1. **Create the bot.** In Telegram, message `@BotFather`, send `/newbot`, and keep the token.
2. **Get the chat id.** Send any message to the bot (or add it to a group and post there). Then open
   `https://api.telegram.org/bot<TOKEN>/getUpdates` and copy `message.chat.id`. Group ids are negative.
3. **Deploy from this folder:**
   ```sh
   cd workers/lead-relay
   npx wrangler login
   npx wrangler secret put TELEGRAM_BOT_TOKEN   # paste the token
   npx wrangler secret put TELEGRAM_CHAT_ID     # paste the chat id
   npx wrangler deploy
   ```
   `ALLOWED_ORIGIN` is set in `wrangler.toml` (`https://3dot.uz`). To allow more origins, use a comma list.
   Wrangler prints the URL, e.g. `https://lead-relay.<subdomain>.workers.dev`. Any path works, so `/lead` is fine.
4. **Point the site at it.** GitHub repo, Settings, Secrets and variables, Actions, Variables:
   `LEAD_ENDPOINT` = the worker URL. Or run `gh variable set LEAD_ENDPOINT --body "https://..."`.
   Then re-run the Deploy workflow, because the endpoint is baked in at generate time.

## Local dev

```sh
cp workers/lead-relay/.dev.vars.example workers/lead-relay/.dev.vars   # fill in the values
cd workers/lead-relay && npx wrangler dev                              # http://localhost:8787
node workers/lead-relay/test.mjs                                       # self-check, no network
```

Locally, set `NUXT_PUBLIC_LEAD_ENDPOINT=http://localhost:8787/lead` in `.env`.

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
| Telegram error or unreachable | 502 |
| forwarded | 204 |

The body is `text/plain` JSON (no CORS preflight). Telegram gets plain text with no `parse_mode`.

## Smoke test after deploy

```sh
curl -i -X POST "https://lead-relay.<subdomain>.workers.dev/lead" \
  -H "Origin: https://3dot.uz" -H "Content-Type: text/plain" \
  -d '{"name":"Test","contact":"@test","locale":"uz","page":"/"}'
# expect HTTP/2 204 and a message in the Telegram chat. Delete it afterwards.
```

## Operations

- Logs: `npx wrangler tail`.
- Rollback: `npx wrangler deployments list`, then `npx wrangler rollback <version-id>`.
- Rotate the token: create a new token in BotFather, `npx wrangler secret put TELEGRAM_BOT_TOKEN`, then revoke the old one.

## Known limits (ponytail)

- The rate limit lives in memory per isolate. It is best effort, so a determined sender can get past it.
  Upgrade path: the Workers Rate Limiting binding, or Turnstile on the form.
- Spam beyond the honeypot and the rate limit is not filtered. Add Turnstile if spam shows up in the chat.
