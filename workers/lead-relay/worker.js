// Lead relay: the static site POSTs a lead here, the worker forwards it to a Telegram chat.
// Plain ES module, no imports. Deploy with `npx wrangler deploy` from this folder (see README.md).

const MAX_BODY_BYTES = 2048;
const RATE_LIMIT = 5;
const RATE_WINDOW_MS = 10 * 60 * 1000;
const LOCALES = ['uz', 'ru', 'en'];
const LANG = { uz: "O‘zbek", ru: 'Русский', en: 'English' };
const USERNAME_RE = /^@[A-Za-z][A-Za-z0-9_]{4,31}$/;

// ponytail: per-isolate, best effort; switch to the Workers Rate Limiting binding (or KV / a Durable Object) if abused.
const hits = new Map(); // ip -> request timestamps (ms) inside the window

function rateLimited(ip, now) {
  if (hits.size > 10000) hits.clear(); // bound memory per isolate
  const recent = (hits.get(ip) || []).filter((t) => now - t < RATE_WINDOW_MS);
  const limited = recent.length >= RATE_LIMIT;
  if (!limited) recent.push(now);
  hits.set(ip, recent);
  return limited;
}

const allowedOrigins = (env) => (env.ALLOWED_ORIGIN || '').split(',').map((s) => s.trim()).filter(Boolean);

const clean = (v) => (typeof v === 'string' ? v.trim() : '');

const send = (status, headers, msg = null) =>
  new Response(msg, {
    status,
    headers: msg === null ? headers : { ...headers, 'content-type': 'text/plain; charset=utf-8' },
  });

// Telegram parse_mode HTML: only & < > need escaping in text nodes.
const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Uzbek numbers become +998XXXXXXXXX (Telegram auto-links it); anything else is returned unchanged.
function formatPhone(c) {
  const d = c.replace(/[\s()-]/g, '');
  return /^\+?998\d{9}$/.test(d) ? '+998' + d.slice(-9) : c;
}

// ponytail: fixed UTC+5 (Uzbekistan has no DST), switch to Intl timeZone 'Asia/Tashkent' if that ever changes.
function formatLead(f, now) {
  const t = new Date(now + 5 * 3600e3).toISOString();
  const time = `${t.slice(8, 10)}.${t.slice(5, 7)}.${t.slice(0, 4)}, ${t.slice(11, 16)}`;
  const lines = [
    "<b>Yangi so‘rov: bepul audit</b>",
    `<b>Ism:</b> ${escapeHtml(f.name)}`,
    `<b>Aloqa:</b> ${escapeHtml(formatPhone(f.contact))}`,
    ...(f.budget ? [`<b>Byudjet:</b> ${escapeHtml(f.budget)}`] : []),
    `<b>Til:</b> ${LANG[f.locale]} — shu tilda javob bering`,
    ...(f.message ? ['', `<b>Xabar:</b> ${escapeHtml(f.message)}`] : []),
    '—',
    ...(f.page ? [`<b>Sahifa:</b> ${escapeHtml(f.page === '/' ? 'Bosh sahifa' : f.page)}`] : []),
    `<b>Vaqt:</b> ${time} (Toshkent)`,
  ];
  const reply_markup = USERNAME_RE.test(f.contact)
    ? { inline_keyboard: [[{ text: 'Telegramda yozish', url: 'https://t.me/' + f.contact.slice(1) }]] }
    : undefined;
  return reply_markup ? { text: lines.join('\n'), reply_markup } : { text: lines.join('\n') };
}

export { formatLead };

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowedOrigin = origin && allowedOrigins(env).includes(origin) ? origin : null;
    const headers = {
      Vary: 'Origin',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'content-type',
      ...(allowedOrigin ? { 'Access-Control-Allow-Origin': allowedOrigin } : {}),
    };

    if (request.method === 'OPTIONS') return send(204, headers);
    if (request.method !== 'POST') return send(405, { ...headers, Allow: 'POST, OPTIONS' }, 'method not allowed');
    if (origin && !allowedOrigin) return send(403, headers, 'forbidden origin');

    if (Number(request.headers.get('content-length') || 0) > MAX_BODY_BYTES) return send(413, headers, 'payload too large');
    const raw = await request.text();
    if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return send(413, headers, 'payload too large');

    let lead;
    try {
      lead = JSON.parse(raw); // Content-Type is ignored on purpose: the client sends text/plain (ADR-2)
    } catch {
      return send(400, headers, 'invalid json');
    }
    if (!lead || typeof lead !== 'object' || Array.isArray(lead)) return send(400, headers, 'invalid json');

    // Honeypot: bots that fill the hidden field get a success and nothing is forwarded.
    if (lead.hp) return send(204, headers);

    const f = {
      name: clean(lead.name),
      contact: clean(lead.contact),
      budget: clean(lead.budget),
      message: clean(lead.message),
      locale: clean(lead.locale),
      page: clean(lead.page),
    };
    if (
      !f.name || !f.contact || !LOCALES.includes(f.locale) ||
      f.name.length > 100 || f.contact.length > 100 || f.budget.length > 40 ||
      f.message.length > 1000 || f.page.length > 200
    ) {
      return send(400, headers, 'invalid lead');
    }

    const now = Date.now();
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (rateLimited(ip, now)) return send(429, { ...headers, 'Retry-After': '600' }, 'too many requests');

    // HTML parse_mode with every user field escaped inside formatLead, so user input cannot break markup.
    let tg;
    try {
      tg = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: env.TELEGRAM_CHAT_ID,
          ...formatLead(f, now),
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
      });
    } catch {
      console.error('telegram: network error');
      return send(502, headers, 'upstream unavailable');
    }
    if (!tg.ok) {
      console.error(`telegram: HTTP ${tg.status}`); // status only, never the URL (it contains the token)
      return send(502, headers, 'upstream rejected');
    }
    return send(204, headers);
  },
};
