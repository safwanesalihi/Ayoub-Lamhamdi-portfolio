import type { Env } from "./index";

/** Accepts "06 12 34 56 78", "0612345678", "+212612345678", "00212…" or any +E.164 number. */
export function normalizePhone(input: string): string | null {
  let s = input.replace(/[\s().-]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (/^0[5-7]\d{8}$/.test(s)) s = "+212" + s.slice(1); // Moroccan local format
  if (/^[5-7]\d{8}$/.test(s)) s = "+212" + s;
  return /^\+[1-9]\d{7,14}$/.test(s) ? s : null;
}

const twilioAuth = (env: Env) => "Basic " + btoa(`${env.TWILIO_ACCOUNT_SID}:${env.TWILIO_AUTH_TOKEN}`);

export async function sendCode(env: Env, phone: string): Promise<{ ok: true } | { ok: false; error: string }> {
  if (env.OTP_MODE === "dev") {
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1_000_000).padStart(6, "0");
    await env.DB.prepare(`INSERT OR REPLACE INTO dev_codes (phone, code, expires_at) VALUES (?, ?, ?)`).bind(phone, code, Date.now() + 10 * 60_000).run();
    console.log(`[dev] sign-in code for ${phone}: ${code}`);
    return { ok: true };
  }
  if (!env.TWILIO_ACCOUNT_SID || !env.TWILIO_AUTH_TOKEN || !env.TWILIO_VERIFY_SID) return { ok: false, error: "SMS isn't set up on this server yet." };
  const res = await fetch(`https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SID}/Verifications`, {
    method: "POST",
    headers: { authorization: twilioAuth(env), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Channel: "sms" }),
  });
  if (!res.ok) {
    console.error("twilio send", res.status, await res.text());
    return { ok: false, error: "The SMS couldn't be sent. Check the number and try again." };
  }
  return { ok: true };
}

export async function checkCode(env: Env, phone: string, code: string): Promise<boolean> {
  if (env.OTP_MODE === "dev") {
    const row = await env.DB.prepare(`SELECT code, expires_at FROM dev_codes WHERE phone = ?`).bind(phone).first<{ code: string; expires_at: number }>();
    if (!row || row.expires_at < Date.now() || row.code !== code) return false;
    await env.DB.prepare(`DELETE FROM dev_codes WHERE phone = ?`).bind(phone).run();
    return true;
  }
  const res = await fetch(`https://verify.twilio.com/v2/Services/${env.TWILIO_VERIFY_SID}/VerificationCheck`, {
    method: "POST",
    headers: { authorization: twilioAuth(env), "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: phone, Code: code }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { status?: string };
  return data.status === "approved";
}
