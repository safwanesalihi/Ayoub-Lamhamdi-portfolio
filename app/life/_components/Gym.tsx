"use client";

import { useEffect, useState } from "react";
import { fromKey, lastSets, overloadHint, weekPlan, WEEKDAYS, workoutFor, WORKOUTS } from "@/lib/life/plan";
import type { SetLog } from "@/lib/life/types";
import { btnCls, Card } from "./ui";
import type { ViewProps } from "./types";

function RestTimer() {
  const [left, setLeft] = useState(0);
  useEffect(() => {
    if (left <= 0) return;
    const id = setTimeout(() => setLeft((l) => l - 1), 1000);
    return () => clearTimeout(id);
  }, [left]);
  useEffect(() => {
    if (left === 0 && typeof navigator !== "undefined" && "vibrate" in navigator) navigator.vibrate?.(300);
  }, [left]);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="display w-20 text-3xl tabular-nums">
        {Math.floor(left / 60)}:{String(left % 60).padStart(2, "0")}
      </span>
      {[60, 90, 120, 180].map((s) => (
        <button key={s} type="button" onClick={() => setLeft(s)} className="rounded-full border border-fill/15 px-3 py-1 text-xs text-fg/80 hover:border-fill/40">
          {s}s
        </button>
      ))}
      {left > 0 && (
        <button type="button" onClick={() => setLeft(0)} className="text-xs text-fg/50">
          Stop
        </button>
      )}
    </div>
  );
}

export function Gym({ state, day, log, setDay }: ViewProps) {
  const auto = workoutFor(state.profile, day);
  const [override, setOverride] = useState<keyof typeof WORKOUTS | null>(null);
  const wk = override ?? auto;
  const plan = weekPlan(state.profile);
  const todayIdx = fromKey(day).getDay();

  const setSet = (exId: string, i: number, patch: Partial<SetLog>) =>
    setDay((d) => {
      const arr = [...(d.sets[exId] ?? [])];
      while (arr.length <= i) arr.push({ w: 0, r: 0 });
      arr[i] = { ...arr[i], ...patch };
      return { ...d, sets: { ...d.sets, [exId]: arr } };
    });

  return (
    <div className="grid gap-4">
      <Card title={`Program — ${state.profile.trainingDays} days a week (hypertrophy)`}>
        <div className="grid grid-cols-7 gap-1.5">
          {plan.map((k, i) => (
            <div key={i} className={`rounded-[10px] px-0.5 py-2 text-center ${i === todayIdx ? "bg-tint text-white" : "bg-fill/[0.06]"}`}>
              <div className="text-[10px] opacity-60">{WEEKDAYS[i]}</div>
              <div className="mt-1 text-[11px]">{k ? WORKOUTS[k].name : "Rest"}</div>
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs leading-relaxed text-fg/50">
          Rule: stop every set 1-2 reps short of failure. When you hit the top of the rep range on all sets, add 2.5kg. Change the program in Settings.
        </p>
      </Card>

      <Card title="Rest timer">
        <RestTimer />
      </Card>

      {!wk ? (
        <Card title="Today is a rest day">
          <p className="text-sm text-fg/70">Muscle grows while you recover. Walk 8-10k steps, stretch, and eat your full targets.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="text-xs text-fg/50">Want to train anyway?</span>
            {(Object.keys(WORKOUTS) as (keyof typeof WORKOUTS)[]).map((k) => (
              <button key={k} type="button" onClick={() => setOverride(k)} className="rounded-full border border-fill/15 px-3 py-1 text-xs">
                {WORKOUTS[k].name}
              </button>
            ))}
          </div>
        </Card>
      ) : (
        <>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="display text-4xl">{WORKOUTS[wk].name}</div>
              <div className="text-sm text-fg/50">{WORKOUTS[wk].focus}</div>
            </div>
            <button
              type="button"
              className={log.workoutDone ? "rounded-full bg-[#30D158] px-4 py-2 text-sm text-white" : btnCls}
              onClick={() => setDay((d) => ({ ...d, workoutDone: !d.workoutDone }))}
            >
              {log.workoutDone ? "Workout done ✓" : "Finish workout"}
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {WORKOUTS[wk].exercises.map((e, idx) => {
              const last = lastSets(state, e.id, day);
              const cur = log.sets[e.id] ?? [];
              return (
                <Card key={e.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="text-[11px] text-fg/40">#{idx + 1}</div>
                      <div className="text-base">{e.name}</div>
                      <div className="text-xs text-fg/50">
                        {e.sets} × {e.reps[0]}-{e.reps[1]}
                        {e.timed ? "s" : " reps"} · rest {e.rest}s
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 rounded-lg bg-tint/10 px-2.5 py-1.5 text-[12px] text-tint">{overloadHint(e, last)}</p>
                  <p className="mt-1.5 text-[12px] text-fg/50">💡 {e.tip}</p>
                  <div className="mt-3 space-y-1.5">
                    {Array.from({ length: e.sets }, (_, i) => {
                      const s = cur[i] ?? { w: 0, r: 0 };
                      const prev = last?.sets[i];
                      return (
                        <div key={i} className="grid grid-cols-[2rem_1fr_1fr] items-center gap-2 text-sm">
                          <span className="text-xs text-fg/40">S{i + 1}</span>
                          {!e.timed ? (
                            <label className="flex items-center gap-1 rounded-lg bg-fill/[0.07] px-2">
                              <input
                                type="number"
                                inputMode="decimal"
                                className="w-full bg-transparent py-1.5 tabular-nums outline-none placeholder:text-fg/25"
                                placeholder={prev ? String(prev.w) : "—"}
                                value={s.w || ""}
                                onChange={(ev) => setSet(e.id, i, { w: Number(ev.target.value) })}
                              />
                              <span className="text-[10px] text-fg/40">kg</span>
                            </label>
                          ) : (
                            <span className="text-xs text-fg/40">—</span>
                          )}
                          <label className="flex items-center gap-1 rounded-lg bg-fill/[0.07] px-2">
                            <input
                              type="number"
                              inputMode="numeric"
                              className="w-full bg-transparent py-1.5 tabular-nums outline-none placeholder:text-fg/25"
                              placeholder={prev ? String(prev.r) : "—"}
                              value={s.r || ""}
                              onChange={(ev) => setSet(e.id, i, { r: Number(ev.target.value) })}
                            />
                            <span className="text-[10px] text-fg/40">{e.timed ? "s" : "reps"}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
