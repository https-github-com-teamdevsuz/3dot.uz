// Self-check for the lead relay. Run: node workers/lead-relay/test.mjs
import assert from 'node:assert/strict';
import worker from './worker.js';

const ORIGIN = 'https://3dot.uz';
const env = {
  TELEGRAM_BOT_TOKEN: 'test-token',
  TELEGRAM_CHAT_ID: '42',
  ALLOWED_ORIGIN: `${ORIGIN}, http://localhost:3000`,
};
const good = { name: 'Ali', contact: '+998901234567', locale: 'uz', page: '/' };

let calls = [];
let tgOk = true;
let tgThrow = false;
globalThis.fetch = async (url, init) => {
  calls.push({ url, init });
  if (tgThrow) throw new TypeError('fetch failed');
  return new Response('{}', { status: tgOk ? 200 : 400 });
};

function req(body, { method = 'POST', origin = ORIGIN, ip = '1.1.1.1' } = {}) {
  const headers = { 'content-type': 'text/plain;charset=UTF-8', 'CF-Connecting-IP': ip };
  if (origin) headers.Origin = origin;
  return new Request('https://relay.test/lead', {
    method,
    headers,
    body: method === 'POST' ? body : undefined,
  });
}
const post = (obj, opts) => worker.fetch(req(JSON.stringify(obj), opts), env);

const cases = [];
const test = (name, fn) => cases.push({ name, fn });

test('OPTIONS -> 204 with CORS for allowed origin', async () => {
  const res = await worker.fetch(req(null, { method: 'OPTIONS' }), env);
  assert.equal(res.status, 204);
  assert.equal(res.headers.get('access-control-allow-origin'), ORIGIN);
});

test('GET -> 405', async () => {
  const res = await worker.fetch(req(null, { method: 'GET' }), env);
  assert.equal(res.status, 405);
});

test('unknown Origin -> 403, nothing forwarded', async () => {
  const res = await post(good, { origin: 'https://evil.example', ip: '1.1.1.2' });
  assert.equal(res.status, 403);
  assert.equal(calls.length, 0);
});

test('body over 2 KB -> 413', async () => {
  const res = await post({ ...good, message: 'x'.repeat(2100) }, { ip: '1.1.1.3' });
  assert.equal(res.status, 413);
  assert.equal(calls.length, 0);
});

test('invalid JSON -> 400', async () => {
  const res = await worker.fetch(req('{not json', { ip: '1.1.1.4' }), env);
  assert.equal(res.status, 400);
});

test('missing name -> 400', async () => {
  const res = await post({ ...good, name: '   ' }, { ip: '1.1.1.5' });
  assert.equal(res.status, 400);
});

test('locale outside uz|ru|en -> 400', async () => {
  const res = await post({ ...good, locale: 'de' }, { ip: '1.1.1.6' });
  assert.equal(res.status, 400);
});

test('filled honeypot -> 204, nothing forwarded', async () => {
  const res = await post({ ...good, hp: 'spam' }, { ip: '1.1.1.7' });
  assert.equal(res.status, 204);
  assert.equal(calls.length, 0);
});

test('valid lead -> 204, one Telegram sendMessage with plain text', async () => {
  const res = await post({ ...good, budget: '$1 500', message: 'Hi <b>' }, { ip: '2.2.2.2' });
  assert.equal(res.status, 204);
  assert.equal(calls.length, 1);
  assert.equal(calls[0].url, 'https://api.telegram.org/bottest-token/sendMessage');
  const body = JSON.parse(calls[0].init.body);
  assert.equal(body.chat_id, '42');
  assert.match(body.text, /Name: Ali/);
  assert.match(body.text, /Budget: \$1 500/);
  assert.equal(body.parse_mode, undefined);
});

test('Telegram rejects -> 502', async () => {
  tgOk = false;
  try {
    const res = await post(good, { ip: '2.2.2.3' });
    assert.equal(res.status, 502);
  } finally {
    tgOk = true;
  }
});

test('6th request in 10 min from one IP -> 429', async () => {
  for (let i = 0; i < 5; i++) {
    const ok = await post(good, { ip: '3.3.3.3' });
    assert.equal(ok.status, 204);
  }
  const before = calls.length;
  const res = await post(good, { ip: '3.3.3.3' });
  assert.equal(res.status, 429);
  assert.equal(calls.length, before);
});

test('Telegram unreachable (fetch throws) -> 502', async () => {
  tgThrow = true;
  try {
    const res = await post(good, { ip: '6.6.6.1' });
    assert.equal(res.status, 502);
    assert.equal(await res.text(), 'upstream unavailable');
  } finally {
    tgThrow = false;
  }
});

// Decision: a POST without Origin is accepted (not 403). Origin is a browser CORS signal, not auth;
// curl and other non-browser callers omit it. Real protection is the honeypot and the rate limit.
test('no Origin header -> 204, forwarded, no CORS headers (accepted by design)', async () => {
  const res = await post(good, { origin: null, ip: '6.6.6.2' });
  assert.equal(res.status, 204);
  assert.equal(calls.length, 1);
  assert.equal(res.headers.get('access-control-allow-origin'), null);
});

test('Origin: null -> 403, nothing forwarded', async () => {
  const res = await post(good, { origin: 'null', ip: '6.6.6.3' });
  assert.equal(res.status, 403);
  assert.equal(calls.length, 0);
});

test('403 carries no Access-Control-Allow-Origin', async () => {
  const res = await post(good, { origin: 'https://evil.example', ip: '6.6.6.4' });
  assert.equal(res.status, 403);
  assert.equal(res.headers.get('access-control-allow-origin'), null);
});

test('Access-Control-Allow-Origin present on 400, 413 and 429 from the allowed origin', async () => {
  const bad = await post({ ...good, name: '' }, { ip: '6.6.6.5' });
  assert.equal(bad.status, 400);
  assert.equal(bad.headers.get('access-control-allow-origin'), ORIGIN);

  const big = await post({ ...good, message: 'x'.repeat(2100) }, { ip: '6.6.6.6' });
  assert.equal(big.status, 413);
  assert.equal(big.headers.get('access-control-allow-origin'), ORIGIN);

  for (let i = 0; i < 5; i++) await post(good, { ip: '6.6.6.7' });
  const limited = await post(good, { ip: '6.6.6.7' });
  assert.equal(limited.status, 429);
  assert.equal(limited.headers.get('access-control-allow-origin'), ORIGIN);
});

let failed = 0;
for (const { name, fn } of cases) {
  calls = [];
  try {
    await fn();
    console.log(`ok   ${name}`);
  } catch (err) {
    failed++;
    console.error(`FAIL ${name}\n     ${err.message.split('\n')[0]}`);
  }
}
console.log(`\n${cases.length - failed}/${cases.length} passed`);
process.exit(failed ? 1 : 0);
