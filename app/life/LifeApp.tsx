"use client";

import { useCallback, useState } from "react";
import { dateKey, emptyDay, fromKey, scoreDay, shiftDate, WEEKDAYS } from "@/lib/life/plan";
import { useLife, useNow, usePrayerTimes } from "@/lib/life/store";
import type { DayLog } from "@/lib/life/types";
import { Today } from "./_components/Today";
import { Salat } from "./_components/Salat";
import { Gym } from "./_components/Gym";
import { Makla } from "./_components/Makla";
import { Nhar } from "./_components/Nhar";
import { Progress } from "./_components/Progress";
import { Settings } from "./_components/Settings";
import type { TabKey, ViewProps } from "./_components/types";

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: "lyoum", label: "Today", icon: "◎" },
  { key: "salat", label: "Salat", icon: "☾" },
  { key: "gym", label: "Gym", icon: "▲" },
  { key: "makla", label: "Food", icon: "◐" },
  { key: "nhar", label: "Day", icon: "▤" },
  { key: "progress", label: "Progress", icon: "↗" },
  { key: "settings", label: "Settings", icon: "⚙" },
];

const SYNC = {
  local: { label: "Saved on this device", color: "#8A8580" },
  connecting: { label: "Syncing…", color: "#C9A66B" },
  synced: { label: "Saved to your account · synced across devices", color: "#7FB77E" },
  offline: { label: "Offline · will sync when back online", color: "#E5A55B" },
} as const;

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function greeting(h: number) {
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function LifeApp() {
  const { state, update, updateDay, status } = useLife();
  const now = useNow();
  const today = dateKey(now);
  const [day, setDayKey] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("lyoum");
  const activeDay = day ?? today;
  const times = usePrayerTimes(state?.profile.lat ?? 33.5731, state?.profile.lng ?? -7.5898, activeDay);

  const setDay = useCallback((fn: (d: DayLog) => DayLog) => updateDay(activeDay, fn), [updateDay, activeDay]);

  if (!state) {
    return <main className="grid min-h-screen place-items-center text-bone/40">…</main>;
  }

  const log = state.days[activeDay] ?? emptyDay();
  const isToday = activeDay === today;
  const d = fromKey(activeDay);
  const props: ViewProps = { state, day: activeDay, log, isToday, now, times, update, updateDay, setDay, go: setTab };
  const score = scoreDay(state, activeDay).total;

  return (
    <main className="min-h-screen pb-28 md:pb-12">
      <div className="mx-auto max-w-6xl px-4 pt-6 md:px-8 md:pt-10">
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label text-bone/50">
              {greeting(now.getHours())}, {state.profile.name}
            </p>
            <h1 className="display mt-2 text-[clamp(2.4rem,6vw,4rem)]">
              {WEEKDAYS[d.getDay()]} {d.getDate()} {MONTHS[d.getMonth()]}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button type="button" aria-label="Previous day" className="h-9 w-9 rounded-full border border-white/15 hover:border-white/40" onClick={() => setDayKey(shiftDate(activeDay, -1))}>
              ‹
            </button>
            {!isToday && (
              <button type="button" className="rounded-full border border-white/15 px-3 py-1.5 text-xs hover:border-white/40" onClick={() => setDayKey(null)}>
                Today
              </button>
            )}
            <button
              type="button"
              aria-label="Next day"
              disabled={isToday}
              className="h-9 w-9 rounded-full border border-white/15 hover:border-white/40 disabled:opacity-30"
              onClick={() => setDayKey(shiftDate(activeDay, 1) >= today ? null : shiftDate(activeDay, 1))}
            >
              ›
            </button>
            <span className="ml-2 rounded-full bg-white/[0.06] px-3 py-1.5 text-sm tabular-nums">{score}%</span>
          </div>
          <div className="-mt-2 w-full text-[11px] text-bone/40">
            <span className="inline-block h-1.5 w-1.5 rounded-full align-middle" style={{ background: SYNC[status].color }} /> <span className="align-middle">{SYNC[status].label}</span>
          </div>
        </header>

        <nav className="mt-6 hidden gap-1 border-b border-white/10 md:flex">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={`-mb-px border-b-2 px-4 py-2.5 text-sm transition-colors ${tab === t.key ? "border-accent text-bone" : "border-transparent text-bone/50 hover:text-bone"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-6" key={`${tab}-${activeDay}`}>
          {tab === "lyoum" && <Today {...props} />}
          {tab === "salat" && <Salat {...props} />}
          {tab === "gym" && <Gym {...props} />}
          {tab === "makla" && <Makla {...props} />}
          {tab === "nhar" && <Nhar {...props} />}
          {tab === "progress" && <Progress {...props} />}
          {tab === "settings" && <Settings {...props} />}
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink/95 backdrop-blur md:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
        <div className="grid grid-cols-7">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => {
                setTab(t.key);
                window.scrollTo({ top: 0 });
              }}
              className={`flex flex-col items-center gap-0.5 py-2.5 text-[10px] ${tab === t.key ? "text-accent" : "text-bone/50"}`}
            >
              <span className="text-base leading-none">{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}
