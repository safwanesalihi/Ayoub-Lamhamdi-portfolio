import {
  coachTips,
  dateKey,
  dayTotals,
  defaultState,
  emptyDay,
  migrateSchedule,
  PRAYERS,
  scoreDay,
  shiftDate,
  targets,
  toMinutes,
  workoutFor,
  WORKOUTS,
} from "../../lib/life/plan";
import { calcPrayerTimes } from "../../lib/life/praytimes";
import type { DayLog, LifeState } from "../../lib/life/types";
import type { Env, UserRow } from "./index";

const MORNING = "07:30";
const EVENING = "21:30";
const WINDOW_MIN = 10; // cron runs every 5 minutes; a 10-minute window survives one late run

export async function sendTelegram(env: Env, chatId: string, text: string): Promise<boolean> {
  if (!env.TELEGRAM_BOT_TOKEN) return false;
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
  });
  if (!res.ok) console.error("telegram", res.status, await res.text());
  return res.ok;
}

/**
 * The user's wall-clock time as a Date whose getHours()/getDate() read local values.
 * Uses the UTC offset reported by the user's phone rather than the server's time-zone data,
 * which can lag behind real changes (Morocco moved from UTC+1 to UTC+0 in Sept 2026).
 * Assumes the Worker runs in UTC, which it does.
 */
function localNow(offsetMin: number, now: Date): Date {
  const t = new Date(now.getTime() + offsetMin * 60_000);
  return new Date(t.getUTCFullYear(), t.getUTCMonth(), t.getUTCDate(), t.getUTCHours(), t.getUTCMinutes());
}

async function loadState(env: Env, userId: string, today: string): Promise<LifeState> {
  const def = defaultState();
  const meta = await env.DB.prepare(`SELECT body FROM meta WHERE user_id = ?`).bind(userId).first<{ body: string }>();
  const rows = await env.DB.prepare(`SELECT date, body FROM days WHERE user_id = ? AND date >= ?`).bind(userId, shiftDate(today, -14)).all<{ date: string; body: string }>();
  const parsed = meta ? (JSON.parse(meta.body) as Partial<LifeState>) : {};
  const days: Record<string, DayLog> = {};
  for (const r of rows.results) days[r.date] = { ...emptyDay(), ...JSON.parse(r.body) };
  return {
    ...def,
    profile: { ...def.profile, ...(parsed.profile ?? {}) },
    schedule: migrateSchedule(parsed.schedule ?? def.schedule),
    days,
  };
}

function prayerTimesFor(state: LifeState, local: Date, offsetMin: number) {
  const day = new Date(local.getFullYear(), local.getMonth(), local.getDate());
  return calcPrayerTimes(day, state.profile.lat, state.profile.lng, undefined, offsetMin / 60);
}

export async function todayMessage(env: Env, user: UserRow, now = new Date()): Promise<string> {
  const local = localNow(user.utc_offset_min, now);
  const key = dateKey(local);
  const state = await loadState(env, user.id, key);
  const times = prayerTimesFor(state, local, user.utc_offset_min);
  const log = state.days[key] ?? emptyDay();
  const t = targets(state.profile);
  const tot = dayTotals(log);
  const w = workoutFor(state.profile, key);
  const prayers = PRAYERS.map((p) => `${log.prayers[p.key] && log.prayers[p.key] !== "missed" ? "✅" : "▫️"} ${p.label} ${times[p.key]}`).join("\n");
  return [
    `📊 <b>Today — ${scoreDay(state, key).total}%</b>`,
    "",
    prayers,
    "",
    w ? `🏋️ ${WORKOUTS[w].name} (${WORKOUTS[w].focus})${log.workoutDone ? " ✅" : ""}` : "🧘 Rest day",
    `🍽 ${Math.round(tot.kcal)} / ${t.kcal} kcal · ${Math.round(tot.protein)} / ${t.protein} g protein`,
    `💧 ${log.water} / ${state.profile.waterGoal} glasses`,
  ].join("\n");
}

async function once(env: Env, userId: string, key: string): Promise<boolean> {
  const res = await env.DB.prepare(`INSERT OR IGNORE INTO sent (user_id, key) VALUES (?, ?)`).bind(userId, key).run();
  return (res.meta.changes ?? 0) > 0;
}

const inWindow = (mins: number, at: string) => {
  const d = mins - toMinutes(at);
  return d >= 0 && d < WINDOW_MIN;
};

async function remindUser(env: Env, user: UserRow, now: Date) {
  const chat = user.telegram_chat_id!;
  const local = localNow(user.utc_offset_min, now);
  const key = dateKey(local);
  const mins = local.getHours() * 60 + local.getMinutes();
  const state = await loadState(env, user.id, key);
  const times = prayerTimesFor(state, local, user.utc_offset_min);
  const log = state.days[key] ?? emptyDay();

  if (user.notify_prayers) {
    for (const p of PRAYERS) {
      const at = times[p.key];
      if (at && inWindow(mins, at) && (await once(env, user.id, `${key}:${p.key}`))) {
        await sendTelegram(env, chat, `🕌 <b>${p.label}</b> — ${at}\nTime to pray. Log it in the app when you're done.`);
      }
    }
  }

  if (!user.notify_daily) return;

  if (inWindow(mins, MORNING) && (await once(env, user.id, `${key}:morning`))) {
    const w = workoutFor(state.profile, key);
    const t = targets(state.profile);
    const tasks = log.tasks.filter((x) => !x.done).slice(0, 3);
    await sendTelegram(
      env,
      chat,
      [
        `☀️ <b>Good morning, ${escapeHtml(state.profile.name)}</b>`,
        "",
        w ? `🏋️ Today: <b>${WORKOUTS[w].name}</b> — ${WORKOUTS[w].focus}` : "🧘 Rest day — walk, stretch and eat your full targets.",
        `🍽 Eat ${t.kcal} kcal and ${t.protein} g protein.`,
        `📖 Quran: ${state.profile.quranGoalPages} pages.`,
        tasks.length ? `\n✏️ Top tasks:\n${tasks.map((x) => `• ${escapeHtml(x.text)}`).join("\n")}` : "\n✏️ Add your 3 most important tasks in the app.",
      ].join("\n"),
    );
  }

  if (inWindow(mins, EVENING) && (await once(env, user.id, `${key}:evening`))) {
    const tips = coachTips(state, key, local, times).filter((x) => x.tone === "warn").slice(0, 4);
    const score = scoreDay(state, key).total;
    await sendTelegram(
      env,
      chat,
      [
        `🌙 <b>Evening check-in — ${score}%</b>`,
        tips.length ? "" : "\nEverything's on track today. Plan tomorrow and sleep early. 🌱",
        ...tips.map((x) => `• <b>${escapeHtml(x.title)}:</b> ${escapeHtml(x.text)}`),
        "\nTake 2 minutes to write your reflection in the app.",
      ].join("\n"),
    );
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export async function runReminders(env: Env, now: Date) {
  if (!env.TELEGRAM_BOT_TOKEN) return;
  const users = await env.DB.prepare(`SELECT * FROM users WHERE telegram_chat_id IS NOT NULL`).all<UserRow>();
  for (const u of users.results) {
    try {
      await remindUser(env, u, now);
    } catch (e) {
      console.error("reminder failed", u.id, e);
    }
  }
  await env.DB.prepare(`DELETE FROM sent WHERE key < ?`).bind(shiftDate(dateKey(now), -3)).run();
}
