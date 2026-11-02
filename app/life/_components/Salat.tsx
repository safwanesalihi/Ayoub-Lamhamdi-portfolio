"use client";

import { PRAYERS, PRAYER_STATUS, prayerStreak, shiftDate, WEEKDAYS, fromKey } from "@/lib/life/plan";
import type { PrayerStatus } from "@/lib/life/types";
import { Card, Check, Stepper } from "./ui";
import type { ViewProps } from "./types";

const STATUS_COLOR: Record<PrayerStatus, string> = {
  jamaa: "#7FB77E",
  ontime: "#A8D5A2",
  late: "#E5A55B",
  missed: "#E07A5F",
};

export function Salat({ state, day, log, times, setDay }: ViewProps) {
  const streak = prayerStreak(state, day);
  const last14 = Array.from({ length: 14 }, (_, i) => shiftDate(day, i - 13));

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card title="Today's prayers" right={<span className="text-xs text-bone/50">{state.profile.city}</span>}>
        <ul className="space-y-3">
          {PRAYERS.map((p) => {
            const st = log.prayers[p.key];
            return (
              <li key={p.key} className="rounded-xl border border-white/10 p-3">
                <div className="mb-2.5 flex items-baseline justify-between">
                  <span className="text-base">{p.label}</span>
                  <span className="tabular-nums text-sm text-bone/50">{times[p.key] ?? "--:--"}</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {PRAYER_STATUS.map((s) => {
                    const on = st === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setDay((d) => ({ ...d, prayers: { ...d.prayers, [p.key]: on ? undefined : s.key } }))}
                        className="rounded-lg border px-1 py-1.5 text-[11px] transition-colors"
                        style={{
                          borderColor: on ? STATUS_COLOR[s.key] : "rgba(255,255,255,0.1)",
                          background: on ? STATUS_COLOR[s.key] : "transparent",
                          color: on ? "#0A0A0A" : "rgba(237,231,220,0.7)",
                        }}
                      >
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </li>
            );
          })}
        </ul>
        {times.sunrise && <p className="mt-3 text-xs text-bone/40">Sunrise: {times.sunrise} — pray Fajr before this time.</p>}
      </Card>

      <div className="grid content-start gap-4">
        <Card title="Streak">
          <div className="flex items-end gap-3">
            <span className="display text-6xl tabular-nums text-accent">{streak}</span>
            <span className="pb-2 text-sm text-bone/60">days in a row without missing a prayer</span>
          </div>
        </Card>

        <Card title="Wird & adhkar">
          <div className="space-y-2">
            <Check checked={log.adhkar.sabah} onChange={(v) => setDay((d) => ({ ...d, adhkar: { ...d.adhkar, sabah: v } }))}>
              Morning adhkar
            </Check>
            <Check checked={log.adhkar.masa} onChange={(v) => setDay((d) => ({ ...d, adhkar: { ...d.adhkar, masa: v } }))}>
              Evening adhkar
            </Check>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-bone/70">Quran (pages) · goal {state.profile.quranGoalPages}</span>
            <Stepper value={log.quranPages} onChange={(v) => setDay((d) => ({ ...d, quranPages: v }))} />
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-bone/70">Sunnah / rawatib (rak'ahs)</span>
            <Stepper value={log.sunnah} step={2} onChange={(v) => setDay((d) => ({ ...d, sunnah: v }))} />
          </div>
        </Card>

        <Card title="Last 14 days">
          <div className="overflow-x-auto">
            <table className="w-full border-separate border-spacing-1 text-[10px]">
              <thead>
                <tr>
                  <th />
                  {last14.map((k) => (
                    <th key={k} className="font-normal text-bone/40">
                      {WEEKDAYS[fromKey(k).getDay()].slice(0, 2)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PRAYERS.map((p) => (
                  <tr key={p.key}>
                    <td className="pr-1 text-bone/50">{p.label.split(" ")[0]}</td>
                    {last14.map((k) => {
                      const st = state.days[k]?.prayers[p.key];
                      return (
                        <td key={k}>
                          <div className="mx-auto h-4 w-4 rounded" style={{ background: st ? STATUS_COLOR[st] : "rgba(255,255,255,0.06)" }} title={`${k} · ${st ?? "—"}`} />
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
