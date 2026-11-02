"use client";

import { fromKey, PRAYERS, prayerStreak, scoreDay, shiftDate, WEEKDAYS, weightTrend } from "@/lib/life/plan";
import { Card } from "./ui";
import type { ViewProps } from "./types";

function color(v: number) {
  if (v >= 80) return "#7FB77E";
  if (v >= 55) return "#C9A66B";
  return "#E07A5F";
}

export function Progress({ state, day }: ViewProps) {
  const range = Array.from({ length: 14 }, (_, i) => shiftDate(day, i - 13));
  const scores = range.map((k) => ({ k, s: state.days[k] ? scoreDay(state, k).total : 0, has: !!state.days[k] }));
  const tracked = scores.filter((x) => x.has);
  const avg = tracked.length ? Math.round(tracked.reduce((a, x) => a + x.s, 0) / tracked.length) : 0;

  const last7 = range.slice(-7);
  const gymDone = last7.filter((k) => state.days[k]?.workoutDone).length;
  const prayersDone = last7.reduce((a, k) => a + PRAYERS.filter((p) => { const st = state.days[k]?.prayers[p.key]; return st && st !== "missed"; }).length, 0);

  const weights = Array.from({ length: 30 }, (_, i) => shiftDate(day, i - 29))
    .map((k) => ({ k, w: state.days[k]?.weight ?? null }))
    .filter((x): x is { k: string; w: number } => x.w != null);
  const tr = weightTrend(state, day);

  const W = 320;
  const H = 120;
  let path = "";
  let minW = 0;
  let maxW = 0;
  if (weights.length > 1) {
    minW = Math.min(...weights.map((x) => x.w)) - 0.5;
    maxW = Math.max(...weights.map((x) => x.w)) + 0.5;
    path = weights
      .map((x, i) => {
        const px = (i / (weights.length - 1)) * W;
        const py = H - ((x.w - minW) / (maxW - minW)) * H;
        return `${i ? "L" : "M"}${px.toFixed(1)},${py.toFixed(1)}`;
      })
      .join(" ");
  }

  return (
    <div className="grid gap-4">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[
          { l: "Moyenne productivity", v: `${avg}%` },
          { l: "Streak salat", v: `${prayerStreak(state, day)} ayam` },
          { l: "Salawat (7 ayam)", v: `${prayersDone}/35` },
          { l: "Gym (7 ayam)", v: `${gymDone}/${state.profile.trainingDays}` },
        ].map((x) => (
          <Card key={x.l}>
            <div className="text-[11px] text-bone/50">{x.l}</div>
            <div className="display mt-1 text-3xl tabular-nums">{x.v}</div>
          </Card>
        ))}
      </div>

      <Card title="Productivity — 14 yom">
        <div className="flex h-44 items-end gap-1.5">
          {scores.map(({ k, s, has }) => (
            <div key={k} className="flex h-full flex-1 flex-col items-center justify-end gap-1">
              <span className="text-[9px] tabular-nums text-bone/50">{has ? s : ""}</span>
              <div className="w-full rounded-t-md" style={{ height: `${Math.max(2, s)}%`, background: has ? color(s) : "rgba(255,255,255,0.06)" }} title={`${k}: ${s}%`} />
              <span className={`text-[9px] ${k === day ? "text-accent" : "text-bone/40"}`}>{WEEKDAYS[fromKey(k).getDay()].slice(0, 2)}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card
        title="Wazn — 30 yom"
        right={
          tr.perWeek != null ? (
            <span className="text-xs tabular-nums text-bone/60">
              {tr.perWeek >= 0 ? "+" : ""}
              {tr.perWeek.toFixed(2)} kg/simana
            </span>
          ) : null
        }
      >
        {weights.length > 1 ? (
          <div>
            <svg viewBox={`-4 -8 ${W + 8} ${H + 16}`} className="h-40 w-full" preserveAspectRatio="none">
              <path d={path} fill="none" stroke="#C9A66B" strokeWidth={2} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-1 flex justify-between text-[11px] tabular-nums text-bone/50">
              <span>
                {weights[0].w}kg · {weights[0].k.slice(5)}
              </span>
              <span>Hadaf: {state.profile.goalWeightKg}kg</span>
              <span>
                {weights[weights.length - 1].w}kg · {weights[weights.length - 1].k.slice(5)}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-bone/50">Sejel l wazn dyalek kol sba7 f &quot;Lyoum&quot; bach yban lik l progress hna.</p>
        )}
      </Card>
    </div>
  );
}
