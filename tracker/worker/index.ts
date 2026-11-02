/**
 * Productive Day — Cloudflare Worker
 * - /api/*            JSON API (phone sign-in, sync, Telegram linking)
 * - /telegram/webhook Telegram bot updates
 * - cron              prayer / morning / evening reminders on Telegram
 * - everything else   static app from ./dist
 */
import { sendCode, checkCode, normalizePhone } from "./sms";
import { runReminders, sendTelegram, todayMessage } from "./notify";

export type Env = {
  DB: D1Database;
  ASSETS: Fetcher;
  TELEGRAM_BOT_TOKEN?: string;
  TELEGRAM_BOT_USERNAME?: string;
  TELEGRAM_WEBHOOK_SECRET?: string;
  TWILIO_ACCOUNT_SID?: string;
  TWILIO_AUTH_TOKEN?: string;
  TWILIO_VERIFY_SID?: string;
  /** "twilio" (default) or "dev" — dev accepts codes printed to the log; never use in production */
  OTP_MODE?: string;
};

export type UserRow = {
  id: string;
  phone: string;
  time_zone: string;
  utc_offset_min: number;
  telegram_chat_id: string | null;
  telegram_link_token: string | null;
  notify_prayers: number;
  notify_daily: number;
};

const SESSION_DAYS = 90;
const MAX_BODY = 256 * 1024;

const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...headers } });
const fail = (status: number, error: string) => json({ error }, status);

function randomToken(bytes = 32) {
  const b = crypto.getRandomValues(new Uint8Array(bytes));
  return btoa(String.fromCharCode(...b)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sha256(s: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(d)].map((x) => x.toString(16).padStart(2, "0")).join("");
}

function cookie(req: Request, name: string) {
  const m = (req.headers.get("cookie") ?? "").match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return m ? decodeURIComponent(m[1]) : null;
}

function sessionCookie(req: Request, token: string, maxAge: number) {
  const secure = new URL(req.url).protocol === "https:" ? "; Secure" : "";
  return `sid=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

async function readJson<T>(req: Request): Promise<T | null> {
  const len = Number(req.headers.get("content-length") ?? 0);
  if (len > MAX_BODY) return null;
  const text = await req.text();
  if (text.length > MAX_BODY) return null;
  try {
    return JSON.parse(text) as T;
  } catch {
    return null;
  }
}

async function currentUser(req: Request, env: Env): Promise<UserRow | null> {
  const token = cookie(req, "sid");
  if (!token) return null;
  const row = await env.DB.prepare(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ? AND s.expires_at > ?`,
  )
    .bind(await sha256(token), Date.now())
    .first<UserRow>();
  return row ?? null;
}

/** Fixed-window limiter: true when the call is allowed. */
async function allow(env: Env, key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const row = await env.DB.prepare(`SELECT count, window_start FROM rate WHERE key = ?`).bind(key).first<{ count: number; window_start: number }>();
  if (!row || now - row.window_start > windowMs) {
    await env.DB.prepare(`INSERT OR REPLACE INTO rate (key, count, window_start) VALUES (?, 1, ?)`).bind(key, now).run();
    return true;
  }
  if (row.count >= limit) return false;
  await env.DB.prepare(`UPDATE rate SET count = count + 1 WHERE key = ?`).bind(key).run();
  return true;
}

const validOffset = (m: unknown): m is number => typeof m === "number" && Number.isInteger(m) && m >= -720 && m <= 840;

const validTz = (tz: unknown): tz is string => {
  if (typeof tz !== "string" || tz.length > 64) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
};

function publicUser(u: UserRow, env: Env) {
  return {
    id: u.id,
    phone: u.phone,
    timeZone: u.time_zone,
    utcOffset: u.utc_offset_min,
    telegram: !!u.telegram_chat_id,
    telegramAvailable: !!(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_USERNAME),
    notifyPrayers: !!u.notify_prayers,
    notifyDaily: !!u.notify_daily,
  };
}

async function api(req: Request, env: Env, path: string): Promise<Response> {
  const method = req.method;
  const ip = req.headers.get("cf-connecting-ip") ?? "local";

  // Same-origin check for state-changing requests (cookie auth).
  if (method !== "GET") {
    const origin = req.headers.get("origin");
    if (origin && origin !== new URL(req.url).origin) return fail(403, "Cross-site request blocked.");
  }

  /* ---------- auth ---------- */
  if (path === "/auth/start" && method === "POST") {
    const body = await readJson<{ phone?: string }>(req);
    const phone = normalizePhone(body?.phone ?? "");
    if (!phone) return fail(400, "Enter a valid phone number, e.g. 06 12 34 56 78.");
    if (!(await allow(env, `ip:${ip}`, 20, 3600_000)) || !(await allow(env, `phone:${phone}`, 5, 3600_000)))
      return fail(429, "Too many codes requested. Try again in an hour.");
    const res = await sendCode(env, phone);
    if (!res.ok) return fail(502, res.error);
    return json({ ok: true, phone });
  }

  if (path === "/auth/verify" && method === "POST") {
    const body = await readJson<{ phone?: string; code?: string; timeZone?: string; utcOffset?: number }>(req);
    const phone = normalizePhone(body?.phone ?? "");
    const code = String(body?.code ?? "").replace(/\D/g, "");
    if (!phone || code.length < 4) return fail(400, "Enter the code from the SMS.");
    if (!(await allow(env, `verify:${phone}`, 10, 3600_000))) return fail(429, "Too many attempts. Request a new code later.");
    const ok = await checkCode(env, phone, code);
    if (!ok) return fail(401, "That code is wrong or has expired.");

    let user = await env.DB.prepare(`SELECT * FROM users WHERE phone = ?`).bind(phone).first<UserRow>();
    if (!user) {
      const id = crypto.randomUUID();
      const tz = validTz(body?.timeZone) ? body!.timeZone! : "Africa/Casablanca";
      const off = validOffset(body?.utcOffset) ? body!.utcOffset! : 0;
      await env.DB.prepare(`INSERT INTO users (id, phone, time_zone, utc_offset_min, created_at) VALUES (?, ?, ?, ?, ?)`).bind(id, phone, tz, off, Date.now()).run();
      user = (await env.DB.prepare(`SELECT * FROM users WHERE id = ?`).bind(id).first<UserRow>())!;
    }
    const token = randomToken();
    await env.DB.prepare(`INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)`)
      .bind(await sha256(token), user.id, Date.now() + SESSION_DAYS * 86400_000)
      .run();
    await env.DB.prepare(`DELETE FROM sessions WHERE user_id = ? AND expires_at < ?`).bind(user.id, Date.now()).run();
    return json({ user: publicUser(user, env) }, 200, { "set-cookie": sessionCookie(req, token, SESSION_DAYS * 86400) });
  }

  if (path === "/auth/logout" && method === "POST") {
    const token = cookie(req, "sid");
    if (token) await env.DB.prepare(`DELETE FROM sessions WHERE token_hash = ?`).bind(await sha256(token)).run();
    return json({ ok: true }, 200, { "set-cookie": sessionCookie(req, "", 0) });
  }

  /* ---------- everything below needs a session ---------- */
  const user = await currentUser(req, env);
  if (!user) return fail(401, "Sign in first.");

  if (path === "/me" && method === "GET") return json({ user: publicUser(user, env) });

  if (path === "/me" && method === "POST") {
    const body = await readJson<{ timeZone?: string; utcOffset?: number; notifyPrayers?: boolean; notifyDaily?: boolean }>(req);
    if (!body) return fail(400, "Invalid request.");
    const tz = validTz(body.timeZone) ? body.timeZone : user.time_zone;
    const off = validOffset(body.utcOffset) ? body.utcOffset : user.utc_offset_min;
    const np = typeof body.notifyPrayers === "boolean" ? Number(body.notifyPrayers) : user.notify_prayers;
    const nd = typeof body.notifyDaily === "boolean" ? Number(body.notifyDaily) : user.notify_daily;
    await env.DB.prepare(`UPDATE users SET time_zone = ?, utc_offset_min = ?, notify_prayers = ?, notify_daily = ? WHERE id = ?`).bind(tz, off, np, nd, user.id).run();
    return json({ user: publicUser({ ...user, time_zone: tz!, utc_offset_min: off, notify_prayers: np, notify_daily: nd }, env) });
  }

  if (path === "/me" && method === "DELETE") {
    await env.DB.batch([
      env.DB.prepare(`DELETE FROM days WHERE user_id = ?`).bind(user.id),
      env.DB.prepare(`DELETE FROM meta WHERE user_id = ?`).bind(user.id),
      env.DB.prepare(`DELETE FROM sent WHERE user_id = ?`).bind(user.id),
      env.DB.prepare(`DELETE FROM sessions WHERE user_id = ?`).bind(user.id),
      env.DB.prepare(`DELETE FROM users WHERE id = ?`).bind(user.id),
    ]);
    return json({ ok: true }, 200, { "set-cookie": sessionCookie(req, "", 0) });
  }

  if (path === "/telegram/link" && method === "POST") {
    if (!env.TELEGRAM_BOT_USERNAME || !env.TELEGRAM_BOT_TOKEN) return fail(503, "Telegram isn't set up on this server yet.");
    const token = randomToken(18);
    await env.DB.prepare(`UPDATE users SET telegram_link_token = ? WHERE id = ?`).bind(token, user.id).run();
    return json({ url: `https://t.me/${env.TELEGRAM_BOT_USERNAME}?start=${token}` });
  }

  if (path === "/telegram/unlink" && method === "POST") {
    await env.DB.prepare(`UPDATE users SET telegram_chat_id = NULL, telegram_link_token = NULL WHERE id = ?`).bind(user.id).run();
    return json({ ok: true });
  }

  if (path === "/telegram/test" && method === "POST") {
    if (!user.telegram_chat_id) return fail(400, "Connect Telegram first.");
    const ok = await sendTelegram(env, user.telegram_chat_id, await todayMessage(env, user));
    return ok ? json({ ok: true }) : fail(502, "Telegram didn't accept the message.");
  }

  /* ---------- data sync ---------- */
  if (path === "/state" && method === "GET") {
    const meta = await env.DB.prepare(`SELECT body FROM meta WHERE user_id = ?`).bind(user.id).first<{ body: string }>();
    const rows = await env.DB.prepare(`SELECT date, body FROM days WHERE user_id = ?`).bind(user.id).all<{ date: string; body: string }>();
    const days: Record<string, unknown> = {};
    for (const r of rows.results) days[r.date] = JSON.parse(r.body);
    return json({ meta: meta ? JSON.parse(meta.body) : null, days });
  }

  if (path === "/meta" && method === "PUT") {
    const body = await readJson<Record<string, unknown>>(req);
    if (!body || typeof body !== "object" || !body.profile) return fail(400, "Invalid data.");
    await env.DB.prepare(`INSERT INTO meta (user_id, body, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`)
      .bind(user.id, JSON.stringify(body), Date.now())
      .run();
    return new Response(null, { status: 204 });
  }

  const dayMatch = path.match(/^\/days\/(\d{4}-\d{2}-\d{2})$/);
  if (dayMatch && method === "PUT") {
    const body = await readJson<Record<string, unknown>>(req);
    if (!body || typeof body !== "object" || Array.isArray(body)) return fail(400, "Invalid data.");
    await env.DB.prepare(`INSERT INTO days (user_id, date, body, updated_at) VALUES (?, ?, ?, ?) ON CONFLICT(user_id, date) DO UPDATE SET body = excluded.body, updated_at = excluded.updated_at`)
      .bind(user.id, dayMatch[1], JSON.stringify(body), Date.now())
      .run();
    return new Response(null, { status: 204 });
  }
  if (dayMatch && method === "DELETE") {
    await env.DB.prepare(`DELETE FROM days WHERE user_id = ? AND date = ?`).bind(user.id, dayMatch[1]).run();
    return new Response(null, { status: 204 });
  }

  return fail(404, "Not found.");
}

/* ---------- Telegram bot ---------- */
type TgUpdate = { message?: { chat: { id: number }; text?: string } };

async function telegramWebhook(req: Request, env: Env): Promise<Response> {
  if (!env.TELEGRAM_WEBHOOK_SECRET || req.headers.get("x-telegram-bot-api-secret-token") !== env.TELEGRAM_WEBHOOK_SECRET) return new Response("forbidden", { status: 403 });
  const update = await readJson<TgUpdate>(req);
  const msg = update?.message;
  if (!msg?.text) return new Response("ok");
  const chatId = String(msg.chat.id);
  const [cmd, arg] = msg.text.trim().split(/\s+/, 2);

  if (cmd === "/start" && arg) {
    const user = await env.DB.prepare(`SELECT * FROM users WHERE telegram_link_token = ?`).bind(arg).first<UserRow>();
    if (!user) {
      await sendTelegram(env, chatId, "This link has expired. Open the app → Settings → Connect Telegram to get a new one.");
      return new Response("ok");
    }
    await env.DB.prepare(`UPDATE users SET telegram_chat_id = ?, telegram_link_token = NULL WHERE id = ?`).bind(chatId, user.id).run();
    await sendTelegram(
      env,
      chatId,
      "✅ <b>Connected to Productive Day.</b>\n\nYou'll get a reminder at each prayer time, your plan every morning and a check-in every evening.\n\nCommands:\n/today — today's summary\n/stop — turn reminders off",
    );
    return new Response("ok");
  }

  const user = await env.DB.prepare(`SELECT * FROM users WHERE telegram_chat_id = ?`).bind(chatId).first<UserRow>();
  if (!user) {
    await sendTelegram(env, chatId, "Hi! Open the Productive Day app → Settings → <b>Connect Telegram</b> to link this chat to your account.");
    return new Response("ok");
  }
  if (cmd === "/stop") {
    await env.DB.prepare(`UPDATE users SET telegram_chat_id = NULL WHERE id = ?`).bind(user.id).run();
    await sendTelegram(env, chatId, "Reminders are off. Connect again from the app any time.");
  } else {
    await sendTelegram(env, chatId, await todayMessage(env, user));
  }
  return new Response("ok");
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);
    try {
      if (url.pathname.startsWith("/api/")) return await api(req, env, url.pathname.slice(4));
      if (url.pathname === "/telegram/webhook" && req.method === "POST") return await telegramWebhook(req, env);
    } catch (e) {
      console.error(e);
      return fail(500, "Something went wrong on the server. Try again.");
    }
    return env.ASSETS.fetch(req);
  },

  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(runReminders(env, new Date()));
  },
} satisfies ExportedHandler<Env>;
