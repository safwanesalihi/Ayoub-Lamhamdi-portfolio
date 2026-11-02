"use client";

import { AREAS, coachTips, dayTotals, PRAYERS, PRAYER_STATUS, scoreDay, targets, toMinutes, workoutFor, WORKOUTS } from "@/lib/life/plan";
import { Bar, Card, Ring, Stepper } from "./ui";
import type { ViewProps } from "./types";

const TONE = {
  good: { dot: "#7FB77E", bg: "rgba(127,183,126,0.08)" },
  warn: { dot: "#E5A55B", bg: "rgba(229,165,91,0.08)" },
  info: { dot: "#6FA8DC", bg: "rgba(111,168,220,0.06)" },
};

function scoreColor(v: number) {
  if (v >= 80) return "#7FB77E";
  if (v >= 55) return "#C9A66B";
  return "#E07A5F";
}

function scoreWord(v: number) {
  if (v >= 90) return "Wa7ch 🔥";
  if (v >= 75) return "Montij";
  if (v >= 55) return "Mzyan — kmmel";
  if (v >= 30) return "Ba9i lkhedma";
  return "Yallah nbdaw";
}

export function Today(props: ViewProps) {
  const { state, day, log, isToday, now, times, setDay, go } = props;
  const { total, parts } = scoreDay(state, day);
  const tips = coachTips(state, day, now, times);
  const t = targets(state.profile);
  const tot = dayTotals(log);
  const w = workoutFor(state.profile, day);
  const mins = now.getHours() * 60 + now.getMinutes();

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
        <Card title="Productivity dyal nhar">
          <div className="flex flex-wrap items-center gap-6">
            <Ring value={total / 100} size={150} color={scoreColor(total)}>
              <div>
                <div className="display text-5xl tabular-nums">{total}%</div>
                <div className="mt-1 text-xs text-bone/60">{scoreWord(total)}</div>
              </div>
            </Ring>
            <div className="min-w-[180px] flex-1 space-y-2.5">
              {parts.map((p) => (
                <div key={p.key}>
                  <div className="mb-1 flex justify-between text-[11px] text-bone/60">
                    <span>{p.label}</span>
                    <span className="tabular-nums">
                      {Math.round(p.got)}/{p.max}
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <div className="h-full rounded-full" style={{ width: `${(p.got / p.max) * 100}%`, background: p.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {current && (
          <Card title="Daba khassek tkon f">
            <div className="flex items-center gap-3">
              <span className="h-10 w-1.5 rounded-full" style={{ background: AREAS[current.area].color }} />
              <div className="flex-1">
                <div className="text-lg">{current.title}</div>
                <div className="text-xs text-bone/50">
                  {current.start} → {current.end} · {AREAS[current.area].label}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDay((d) => ({ ...d, blocksDone: { ...d.blocksDone, [current.id]: !d.blocksDone[current.id] } }))}
                className={`rounded-full px-3 py-1.5 text-xs ${log.blocksDone[current.id] ? "bg-[#7FB77E] text-ink" : "border border-white/20 text-bone/80"}`}
              >
                {log.blocksDone[current.id] ? "Sala ✓" : "Salit"}
              </button>
            </div>
          </Card>
        )}

        <Card title="Salat" right={<button className="text-xs text-accent" onClick={() => go("salat")}>Kolchi →</button>}>
          <div className="grid grid-cols-5 gap-2">
            {PRAYERS.map((p) => {
              const st = log.prayers[p.key];
              const info = PRAYER_STATUS.find((s) => s.key === st);
              const color = !st ? "rgba(255,255,255,0.1)" : st === "missed" ? "#E07A5F" : st === "late" ? "#E5A55B" : "#7FB77E";
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() =>
                    setDay((d) => ({ ...d, prayers: { ...d.prayers, [p.key]: d.prayers[p.key] ? undefined : "ontime" } }))
                  }
                  className="rounded-xl border p-2 text-center"
                  style={{ borderColor: color, background: st && st !== "missed" ? "rgba(127,183,126,0.08)" : "transparent" }}
                >
                  <div className="text-[11px] text-bone/80">{p.label.split(" ")[0]}</div>
                  <div className="text-[10px] tabular-nums text-bone/40">{times[p.key] ?? "--:--"}</div>
                  <div className="mt-1 text-[10px]" style={{ color: st ? color : "rgba(237,231,220,0.3)" }}>
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
              <div className="mb-2 text-xs text-bone/60">Lma (kisan)</div>
              <div className="flex items-center gap-3">
                <Stepper value={log.water} onChange={(v) => setDay((d) => ({ ...d, water: v }))} />
                <span className="text-xs text-bone/40">/ {state.profile.waterGoal}</span>
              </div>
            </div>
            <div>
              <div className="mb-2 text-xs text-bone/60">N3as (sa3at)</div>
              <Stepper value={log.sleepHours ?? 0} step={0.5} onChange={(v) => setDay((d) => ({ ...d, sleepHours: v }))} suffix="h" />
            </div>
            <div>
              <div className="mb-2 text-xs text-bone/60">Wazn (kg) — sba7</div>
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
              <div className="mb-2 text-xs text-bone/60">Qur2an (sf7at)</div>
              <Stepper value={log.quranPages} onChange={(v) => setDay((d) => ({ ...d, quranPages: v }))} />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid content-start gap-4">
        <Card title="Coach dyalek">
          <ul className="space-y-2.5">
            {tips.map((tip, i) => (
              <li key={i} className="rounded-xl px-3.5 py-3" style={{ background: TONE[tip.tone].bg }}>
                <div className="flex items-center gap-2 text-sm">
                  <span className="h-2 w-2 rounded-full" style={{ background: TONE[tip.tone].dot }} />
                  <span className="text-bone">{tip.title}</span>
                </div>
                <p className="mt-1 text-[13px] leading-relaxed text-bone/70">{tip.text}</p>
              </li>
            ))}
          </ul>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2">
          <Card title="Gym lyoum" right={<button className="text-xs text-accent" onClick={() => go("gym")}>Bda →</button>}>
            {w ? (
              <>
                <div className="display text-3xl">{WORKOUTS[w].name}</div>
                <div className="mt-1 text-xs text-bone/50">{WORKOUTS[w].focus}</div>
                <div className={`mt-3 inline-block rounded-full px-2.5 py-1 text-[11px] ${log.workoutDone ? "bg-[#7FB77E] text-ink" : "bg-white/10 text-bone/70"}`}>
                  {log.workoutDone ? "Sala ✓" : `${WORKOUTS[w].exercises.length} tamarin`}
                </div>
              </>
            ) : (
              <>
                <div className="display text-3xl">Ra7a</div>
                <div className="mt-1 text-xs text-bone/50">Recovery — mchi, stretching</div>
              </>
            )}
          </Card>
          <Card title="Makla" right={<button className="text-xs text-accent" onClick={() => go("makla")}>Zid →</button>}>
            <div className="space-y-3">
              <Bar label="Calories" value={tot.kcal} max={t.kcal} color="#E5C07B" />
              <Bar label="Protein" value={tot.protein} max={t.protein} unit="g" color="#7FB77E" />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
