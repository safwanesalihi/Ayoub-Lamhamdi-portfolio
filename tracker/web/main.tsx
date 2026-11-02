import { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { LifeApp } from "../../app/life/LifeApp";
import { btnCls, Card, ghostBtnCls, inputCls } from "../../app/life/_components/ui";

type User = {
  id: string;
  phone: string;
  timeZone: string;
  utcOffset: number;
  telegram: boolean;
  telegramAvailable: boolean;
  notifyPrayers: boolean;
  notifyDaily: boolean;
};

const deviceOffset = () => -new Date().getTimezoneOffset();

const deviceTz = () => {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "Africa/Casablanca";
  }
};

async function api<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const res = await fetch("/api" + path, {
    method,
    credentials: "same-origin",
    headers: body ? { "content-type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await res.json().catch(() => ({}))) as { error?: string };
  if (!res.ok) throw Object.assign(new Error(data.error ?? "Something went wrong. Try again."), { status: res.status });
  return data as T;
}

/* ------------------------------------------------------------------ */

function SignIn({ onSignedIn }: { onSignedIn: (u: User) => void }) {
  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [normalized, setNormalized] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const sendCode = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ phone: string }>("/auth/start", "POST", { phone });
      setNormalized(r.phone);
      setStep("code");
      setCode("");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const r = await api<{ user: User }>("/auth/verify", "POST", { phone: normalized, code, timeZone: deviceTz(), utcOffset: deviceOffset() });
      onSignedIn(r.user);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  };

  return (
    <main className="ios grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-[22px] bg-card shadow-[0_2px_12px_rgba(0,0,0,0.08)]">
          <svg width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            {[
              ["#FA114F", 24],
              ["#7EDC1E", 16.5],
              ["#00C7E6", 9],
            ].map(([c, r], i) => (
              <circle key={i} cx="28" cy="28" r={r as number} fill="none" stroke={c as string} strokeWidth="6" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * (r as number) * (0.75 - i * 0.12)} 999`} transform="rotate(-90 28 28)" />
            ))}
          </svg>
        </div>
        <h1 className="display text-center text-[34px]">Productive Day</h1>
        <p className="mt-2 text-center text-[15px] text-fg/60">Prayer, training, food and your day plan — with a coach and Telegram reminders.</p>

        {step === "phone" ? (
          <form onSubmit={sendCode} className="mt-8 space-y-3">
            <label htmlFor="phone" className="label block px-4">
              Phone number
            </label>
            <input
              id="phone"
              className={`${inputCls} bg-card text-[17px]`}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="06 12 34 56 78"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
            <button className={`${btnCls} w-full py-3 text-[17px]`} disabled={busy || phone.replace(/\D/g, "").length < 9}>
              {busy ? "Sending…" : "Send code"}
            </button>
            <p className="px-4 text-[13px] text-fg/50">We'll text you a 6-digit code. Moroccan numbers can start with 06 or 07; for other countries use +country code.</p>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-8 space-y-3">
            <label htmlFor="code" className="label block px-4">
              Code sent to {normalized}
            </label>
            <input
              id="code"
              className={`${inputCls} bg-card text-center text-[24px] tracking-[0.4em]`}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              placeholder="••••••"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              autoFocus
              required
            />
            <button className={`${btnCls} w-full py-3 text-[17px]`} disabled={busy || code.length < 6}>
              {busy ? "Checking…" : "Sign in"}
            </button>
            <div className="flex justify-between px-1 text-[15px]">
              <button type="button" className="text-tint" onClick={() => setStep("phone")}>
                Change number
              </button>
              <button type="button" className="text-tint" disabled={busy} onClick={() => sendCode()}>
                Resend code
              </button>
            </div>
          </form>
        )}
        {error && (
          <p role="alert" className="mt-4 rounded-[12px] bg-[#FF453A]/10 px-4 py-3 text-[15px] text-[#FF453A]">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

/* ------------------------------------------------------------------ */

function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center justify-between gap-3 py-2.5 text-left text-[17px]">
      <span>{label}</span>
      <span className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors ${checked ? "bg-[#34C759]" : "bg-fill/[0.16]"}`}>
        <span className={`absolute top-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_2px_6px_rgba(0,0,0,0.2)] transition-transform ${checked ? "translate-x-[22px]" : "translate-x-[2px]"}`} />
      </span>
    </button>
  );
}

function Account({ user, setUser, onSignOut }: { user: User; setUser: (u: User) => void; onSignOut: () => void }) {
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg("");
    try {
      await fn();
    } catch (e) {
      setMsg((e as Error).message);
    } finally {
      setBusy(false);
    }
  };

  const connect = () =>
    run(async () => {
      const { url } = await api<{ url: string }>("/telegram/link", "POST");
      window.open(url, "_blank", "noopener");
      setMsg("In Telegram, tap Start. Then come back here.");
    });

  const save = (patch: Partial<User>) =>
    run(async () => {
      const r = await api<{ user: User }>("/me", "POST", patch);
      setUser(r.user);
    });

  const invite = async () => {
    const url = location.origin;
    const text = "Track your prayers, gym, food and day with me on Productive Day:";
    try {
      if (navigator.share) await navigator.share({ title: "Productive Day", text, url });
      else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        setMsg("Link copied. Send it to anyone — they sign in with their own number.");
      }
    } catch {
      /* share sheet dismissed */
    }
  };

  return (
    <>
      <Card title="Account">
        <div className="divide-y divide-fill/10">
          <div className="flex justify-between py-2.5 text-[17px]">
            <span>Phone</span>
            <span className="tabular-nums text-fg/50">{user.phone}</span>
          </div>
          <div className="flex justify-between py-2.5 text-[17px]">
            <span>Time zone</span>
            <span className="text-fg/50">{user.timeZone}</span>
          </div>
          <button type="button" className="w-full py-2.5 text-left text-[17px] text-tint" onClick={invite}>
            Invite someone
          </button>
          <button type="button" className="w-full py-2.5 text-left text-[17px] text-tint" onClick={onSignOut}>
            Sign out
          </button>
          <button type="button" className="w-full py-2.5 text-left text-[17px] text-[#FF3B30]" onClick={() => setConfirmDelete(true)}>
            Delete account
          </button>
        </div>
        {confirmDelete && (
          <div className="mt-3 rounded-[12px] bg-[#FF3B30]/10 p-3 text-[15px]">
            <p>Delete your account and all your data? This can't be undone.</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-[#FF3B30] px-4 py-2 text-[15px] font-semibold text-white"
                onClick={() =>
                  run(async () => {
                    await api("/me", "DELETE");
                    try {
                      localStorage.removeItem(`life-user-${user.id}`);
                    } catch {}
                    location.reload();
                  })
                }
              >
                Delete
              </button>
              <button type="button" className={ghostBtnCls} onClick={() => setConfirmDelete(false)}>
                Cancel
              </button>
            </div>
          </div>
        )}
      </Card>

      <Card title="Telegram reminders">
        {!user.telegramAvailable ? (
          <p className="text-[15px] text-fg/60">Telegram isn't set up on this server yet.</p>
        ) : user.telegram ? (
          <div className="divide-y divide-fill/10">
            <div className="flex items-center gap-2 py-2.5 text-[17px]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#34C759]" /> Connected
            </div>
            <Switch label="Prayer times" checked={user.notifyPrayers} onChange={(v) => save({ notifyPrayers: v })} />
            <Switch label="Morning plan & evening check-in" checked={user.notifyDaily} onChange={(v) => save({ notifyDaily: v })} />
            <button type="button" disabled={busy} className="w-full py-2.5 text-left text-[17px] text-tint" onClick={() => run(async () => { await api("/telegram/test", "POST"); setMsg("Sent — check Telegram."); })}>
              Send me today's summary
            </button>
            <button
              type="button"
              className="w-full py-2.5 text-left text-[17px] text-[#FF3B30]"
              onClick={() => run(async () => { await api("/telegram/unlink", "POST"); setUser({ ...user, telegram: false }); })}
            >
              Disconnect Telegram
            </button>
          </div>
        ) : (
          <div>
            <p className="text-[15px] text-fg/60">Get a message at every prayer time, your plan at 07:30 and a check-in at 21:30.</p>
            <button type="button" disabled={busy} className={`${btnCls} mt-3`} onClick={connect}>
              Connect Telegram
            </button>
          </div>
        )}
        {msg && (
          <p role="status" className="mt-3 text-[13px] text-fg/60">
            {msg}
          </p>
        )}
      </Card>
    </>
  );
}

/* ------------------------------------------------------------------ */

function App() {
  const [user, setUser] = useState<User | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    try {
      const r = await api<{ user: User }>("/me");
      setUser(r.user);
      if (r.user.timeZone !== deviceTz() || r.user.utcOffset !== deviceOffset()) {
        const u = await api<{ user: User }>("/me", "POST", { timeZone: deviceTz(), utcOffset: deviceOffset() });
        setUser(u.user);
      }
    } catch (e) {
      if ((e as { status?: number }).status === 401) setUser(null);
    }
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => document.visibilityState === "visible" && refresh();
    document.addEventListener("visibilitychange", onVisible);
    return () => document.removeEventListener("visibilitychange", onVisible);
  }, [refresh]);

  if (user === undefined) return <main className="ios min-h-screen" />;
  if (user === null) return <SignIn onSignedIn={setUser} />;

  (window as unknown as { __LIFE_HOST__: unknown }).__LIFE_HOST__ = { api: "/api", userId: user.id, onSignedOut: () => setUser(null) };

  const signOut = async () => {
    await api("/auth/logout", "POST").catch(() => {});
    setUser(null);
  };

  return <LifeApp key={user.id} extraSettings={<Account user={user} setUser={setUser} onSignOut={signOut} />} />;
}

createRoot(document.getElementById("root")!).render(<App />);
