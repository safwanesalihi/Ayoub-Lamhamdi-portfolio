"use client";

import { AREAS, coachTips, dayTotals, PRAYERS, PRAYER_STATUS, scoreDay, targets, toMinutes, workoutFor, WORKOUTS } from "@/lib/life/plan";
import { ActivityRings, Bar, Card, Stepper } from "./ui";
import type { ViewProps } from "./types";

const TONE = {
  good: { dot: "#30D158", bg: "rgb(48 209 88 / 0.12)" },
  warn: { dot: "#FF9F0A", bg: "rgb(255 159 10 / 0.12)" },
  info: { dot: "#0A84FF", bg: "rgb(10 132 255 / 0.10)" },
};

function scoreWord(v: number) {
  if (v >= 90) return "Beast mode 🔥";
  if (v >= 75) return "Productive";
  if (v >= 55) return "Good — keep going";
  if (v >= 30) return "Work to do";
  return "Let's get started";
}

export function Today(props: ViewProps) {
  const { state, day, log, isToday, now, times, setDay, go } = props;
  const { total, parts } = scoreDay(state, day);
  const tips = coachTips(state, day, now, times);
  const t = targets(state.profile);
  const tot = dayTotals(log);
  const w = workoutFor(state.profile, day);
  const mins = now.getHours() * 60 + now.getMinutes();
  const part = (keys: string[]) => parts.filter((p) => keys.includes(p.key)).reduce((a, p) => ({ got: a.got + p.got, max: a.max + p.max }), { got: 0, max: 0 });
  const rings = [
    { label: "Faith", color: "#FA114F", ...part(["salat", "deen"]) },
    { label: "Body", color: "#7EDC1E", ...part(["gym", "makla", "ma", "n3as"]) },
    { label: "Day plan", color: "#00C7E6", ...part(["nhar"]) },
  ].map((r) => ({ ...r, value: r.got / r.max }));

  const current = isToday
    ? state.schedule.find((b) => {
        const s = toMinutes(b.start);
        const e = toMinutes(b.end);
        return e > s ? mins >= s && mins < e : mins >= s || mins < e;
      })
    : undefined;

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="grid gap-4">
        <Card title="Today's productivity">
          <div className="flex flex-wrap items-center gap-5">
            <ActivityRings rings={rings} />
            <div className="min-w-[150px] flex-1 space-y-3">
              {rings.map((r) => (
                <div key={r.label}>
                  <div className="text-[15px] text-fg">{r.label}</div>
                  <div className="text-[22px] font-semibold tabular-nums leading-tight" style={{ color: r.color }}>
                    {Math.round(r.got)}
                    <span className="text-[15px]">/{r.max}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-fill/10 pt-3">
            <span className="text-[15px] text-fg/60">{scoreWord(total)}</span>
            <span className="text-[28px] font-bold tabular-nums">{total}%</span>
          </div>
        </Card>

        {current && (
          <Card title="Right now">
            <div className="flex items-center gap-3">
              <span className="h-10 w-1.5 rounded-full" style={{ background: AREAS[current.area].color }} />
              <div className="flex-1">
                <div className="text-lg">{current.title}</div>
                <div className="text-xs text-fg/50">
                  {current.start} → {current.end} · {AREAS[current.area].label}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDay((d) => ({ ...d, blocksDone: { ...d.blocksDone, [current.id]: !d.blocksDone[current.id] } }))}
                className={`rounded-full px-3 py-1.5 text-xs ${log.blocksDone[current.id] ? "bg-[#30D158] text-white" : "border border-fill/20 text-fg/80"}`}
              >
                {log.blocksDone[current.id] ? "Done ✓" : "Mark done"}
              </button>
            </div>
          </Card>
        )}

        <Card title="Salat" right={<button className="text-xs text-tint" onClick={() => go("salat")}>All →</button>}>
          <div className="grid grid-cols-5 gap-2">
            {PRAYERS.map((p) => {
              const st = log.prayers[p.key];
              const info = PRAYER_STATUS.find((s) => s.key === st);
              const color = !st ? "rgb(var(--ios-fill) / 0.1)" : st === "missed" ? "#FF453A" : st === "late" ? "#FF9F0A" : "#30D158";
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() =>
                    setDay((d) => ({ ...d, prayers: { ...d.prayers, [p.key]: d.prayers[p.key] ? undefined : "ontime" } }))
                  }
                  className="rounded-xl border p-2 text-center"
                  style={{ borderColor: color, background: st && st !== "missed" ? "rgb(48 209 88 / 0.12)" : "transparent" }}
                >
                  <div className="text-[11px] text-fg/80">{p.label.split(" ")[0]}</div>
                  <div className="text-[10px] tabular-nums text-fg/40">{times[p.key] ?? "--:--"}</div>
                  <div className="mt-1 text-[10px]" style={{ color: st ? color : "rgb(var(--ios-label) / 0.3)" }}>
                    {info?.label ?? "—"}
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        <Card title="Quick log">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-xs text-fg/60">Water (glasses)</div>
              <div className="flex items-center gap-3">
                <Stepper value={log.water} onChange={(v) => setDay((d) => ({ ...d, water: v }))} />
                <span className="text-xs text-fg/40">/ {state.profile.waterGoal}</span>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-fg/60">Sleep (hours)</div>
              <Stepper value={log.sleepHours ?? 0} step={0.5} onChange={(v) => setDay((d) => ({ ...d, sleepHours: v }))} suffix="h" />
            </div>
            <div>
              <div className="mb-2 text-xs text-fg/60">Weight (kg) — morning</div>
              <Stepper
                value={log.weight ?? state.profile.weightKg}
                step={0.1}
                onChange={(v) => {
                  setDay((d) => ({ ...d, weight: v }));
                  if (isToday) props.update((s) => ({ ...s, profile: { ...s.profile, weightKg: v } }));
                }}
              />
            </div>
            <div>
              <div className="mb-2 text-xs text-fg/60">Quran (pages)</div>
              <Stepper value={log.quranPages} onChange={(v) => setDay((d) => ({ ...d, quranPages: v }))} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid content-start gap-4">
        <Card title="Your coach">
          <ul className="space-y-2.5">
            {tips.map((tip, i) => (
              <li key={i} className="rounded-xl px-3.5 py-3" style={{ background: TONE[tip.tone].bg }}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ background: TONE[tip.tone].dot }} />
                  <span className="text-fg">{tip.title}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-fg/70">{tip.text}</p>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Today's workout" right={<button className="text-xs text-tint" onClick={() => go("gym")}>Start →</button>}>
            {w ? (
              <>
                <div className="display text-3xl">{WORKOUTS[w].name}</div>
                <div className="mt-1 text-xs text-fg/50">{WORKOUTS[w].focus}</div>
                <div className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] ${log.workoutDone ? "bg-[#30D158] text-white" : "bg-fill/10 text-fg/70"}`}>
                  {log.workoutDone ? "Done ✓" : `${WORKOUTS[w].exercises.length} exercises`}
                </div>
              </>
            ) : (
              <>
                <div className="display text-3xl">Rest</div>
                <div className="mt-1 text-xs text-fg/50">Recovery — walk and stretch</div>
              </>
            )}
          </Card>
          <Card title="Food" right={<button className="text-xs text-tint" onClick={() => go("makla")}>Log →</button>}>
            <div className="space-y-3">
              <Bar label="Calories" value={tot.kcal} max={t.kcal} color="#FFD60A" />
              <Bar label="Protein" value={tot.protein} max={t.protein} unit="g" color="#30D158" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
