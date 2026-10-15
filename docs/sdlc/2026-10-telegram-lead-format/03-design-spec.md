# 03 · Design spec: Telegram lead message

Feature: 2026-10-telegram-lead-format. "UI" = one Telegram message on a phone. Tone (hq/01-brend): serious, corporate. Sent with `parse_mode: "HTML"` (gate decision).

## Rules
- Emoji: none. No `!`. Hierarchy = bold labels, line order, one separator.
- Bold only the label plus colon (`<b>Ism:</b>`) and line 1. Values are plain.
- Escape `&`, `<`, `>` in every user value (name, contact, budget, message, page). Labels are not escaped. No `<a>`, `<code>`, `<i>`: Telegram auto-links phones and @usernames.
- Empty budget, message, page: whole line omitted. Ism, Aloqa, Til, Vaqt always present.
- Labels are Uzbek Latin for every locale and match the form: Ism, Aloqa, Byudjet, Xabar.

## First line (push notification)
Always `<b>Yangi so'rov: bepul audit</b>`, never user input. Line 2 is `Ism:`, so the lock screen shows "Yangi so'rov: bepul audit / Ism: Dilshod".

## Template
```
<b>Yangi so'rov: bepul audit</b>
<b>Ism:</b> {name}
<b>Aloqa:</b> {contact}
<b>Byudjet:</b> {budget}          (omit if empty)
<b>Til:</b> {lang} — shu tilda javob bering
(blank line)
<b>Xabar:</b> {message}           (omit line and blank line if empty)
—
<b>Sahifa:</b> {page}             (omit if empty)
<b>Vaqt:</b> DD.MM.YYYY, HH:mm (Toshkent)
```

## Field formats
- Til: `O'zbek` / `Русский` / `English`, then ` — shu tilda javob bering`. Replaces AC-3 wording `O'zbekcha — javob shu tilda`; implementers and tests follow this spec.
- Aloqa: `998901234567`, `+998 90 123-45-67`, `+998(90)1234567` become `+998901234567`; anything else is the trimmed input.
- Byudjet: the form option text as-is: `$3k gacha`, `$3–10k`, `$10–30k`, `$30–100k`, `$100k+`.
- Sahifa: `/` becomes `Bosh sahifa`; other paths as-is (`/ru`, `/en/projects/ijro-pro`).
- Vaqt: Asia/Tashkent, 24h, zero-padded, always last line.
- Button, only if contact matches `^@[A-Za-z][A-Za-z0-9_]{4,31}$`: one inline button `Telegramda yozish` (same as `ui.modal.telegram`) to `https://t.me/<username>`. Else no `reply_markup`.
- Escaping: `<b>x</b> & Ali` is sent as `&lt;b&gt;x&lt;/b&gt; &amp; Ali`. Over 4096 chars: cut Xabar, never Sahifa/Vaqt.

## Example 1: full lead (uz)
```
<b>Yangi so'rov: bepul audit</b>
<b>Ism:</b> Dilshod Karimov
<b>Aloqa:</b> dilshod@example.uz
<b>Byudjet:</b> $10–30k
<b>Til:</b> O'zbek — shu tilda javob bering

<b>Xabar:</b> Do'konlar tarmog'i uchun CRM kerak, 1C bilan integratsiya.
—
<b>Sahifa:</b> Bosh sahifa
<b>Vaqt:</b> 15.10.2026, 14:32 (Toshkent)
```

## Example 2: minimal lead (ru; no budget, message, page)
```
<b>Yangi so'rov: bepul audit</b>
<b>Ism:</b> Анна
<b>Aloqa:</b> anna@example.ru
<b>Til:</b> Русский — shu tilda javob bering
—
<b>Vaqt:</b> 15.10.2026, 14:32 (Toshkent)
```

## Example 3: @username (en), with button
```
<b>Yangi so'rov: bepul audit</b>
<b>Ism:</b> Alisher
<b>Aloqa:</b> @alisher_dev
<b>Byudjet:</b> $3–10k
<b>Til:</b> English — shu tilda javob bering
—
<b>Sahifa:</b> /en/projects/savdo-360
<b>Vaqt:</b> 15.10.2026, 14:32 (Toshkent)
```
Under the message: button `Telegramda yozish` to https://t.me/alisher_dev

## Example 4: +998 phone (uz), typed `998901234567`, no button
```
<b>Yangi so'rov: bepul audit</b>
<b>Ism:</b> Malika
<b>Aloqa:</b> +998901234567
<b>Til:</b> O'zbek — shu tilda javob bering

<b>Xabar:</b> Yuk kuzatuv platformasi kerak. Qo'ng'iroq qiling, iltimos.
—
<b>Sahifa:</b> /projects/yuk-track
<b>Vaqt:</b> 15.10.2026, 14:32 (Toshkent)
```
Contrast, motion, no-WebGL: not applicable.
