// Same-origin lead endpoint: reuses the Cloudflare worker's validation, honeypot, rate limit and
// Telegram formatting. Secrets come from .env (NUXT_TELEGRAM_BOT_TOKEN, NUXT_TELEGRAM_CHAT_ID).
// Needs a running server (`npm run dev` or `npm run build && npm start`), not `nuxt generate`.
import worker from '~~/workers/lead-relay/worker.js'

export default defineEventHandler(async (event) => {
  const { telegramBotToken, telegramChatId } = useRuntimeConfig(event)
  const req = toWebRequest(event)
  const headers = new Headers(req.headers)
  headers.set('CF-Connecting-IP', getRequestIP(event, { xForwardedFor: true }) || 'unknown')
  const res: Response = await worker.fetch(new Request(req.url, { method: 'POST', headers, body: await req.text() }), {
    TELEGRAM_BOT_TOKEN: telegramBotToken,
    TELEGRAM_CHAT_ID: telegramChatId,
    ALLOWED_ORIGIN: getRequestURL(event).origin
  })
  setResponseStatus(event, res.status)
  return res.text()
})
