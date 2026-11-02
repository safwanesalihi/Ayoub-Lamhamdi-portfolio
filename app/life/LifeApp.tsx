"use client";

import { type ReactNode, useCallback, useState } from "react";
import { dateKey, emptyDay, fromKey, scoreDay, shiftDate } from "@/lib/life/plan";
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
  { key: "lyoum", label: "Today", icon: "M12 3a9 9 0 1 0 0 18a9 9 0 1 0 0-18M12 7.5a4.5 4.5 0 1 0 0 9a4.5 4.5 0 1 0 0-9" },
  { key: "salat", label: "Salat", icon: "M20 14.5A8.5 8.5 0 1 1 9.5 4a7 7 0 0 0 10.5 10.5z" },
  { key: "gym", label: "Gym", icon: "M6.5 6.5v11M3.5 9v6M17.5 6.5v11M20.5 9v6M6.5 12h11" },
  { key: "makla", label: "Food", icon: "M7 3v18M4.5 3v5.5a2.5 2.5 0 0 0 5 0V3M17 21V3c-2.5 1.5-3.5 5-3.5 8.5H17" },
  { key: "nhar", label: "Day", icon: "M4 5.5h16v15H4zM4 10h16M8.5 3v4M15.5 3v4" },
  { key: "progress", label: "Progress", icon: "M5 20v-6M12 20V5M19 20v-10" },
  { key: "settings", label: "Settings", icon: "M4 7h9M17 7h3M4 17h3M11 17h9M15 5v4M9 15v4" },
];

const SYNC = {
  local: { label: "This device only", color: "#8E8E93" },
  connecting: { label: "Syncing…", color: "#FF9F0A" },
  synced: { label: "Synced", color: "#30D158" },
  offline: { label: "Offline, will sync later", color: "#FF9F0A" },
} as const;


function greeting(h: number) {
  if (h < 5) return "Good night";
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function LifeApp({ extraSettings }: { extraSettings?: ReactNode } = {}) {
  const { state, update, updateDay, status } = useLife();
  const now = useNow();
  const today = dateKey(now);
  const [day, setDayKey] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("lyoum");
  const activeDay = day ?? today;
  const times = usePrayerTimes(state?.profile.lat ?? 33.5731, state?.profile.lng ?? -7.5898, activeDay);

  const setDay = useCallback((fn: (d: DayLog) => DayLog) => updateDay(activeDay, fn), [updateDay, activeDay]);

  if (!state) {
    return <main className="grid min-h-screen place-items-center text-fg/40">…</main>;
  }

  const log = state.days[activeDay] ?? emptyDay();
  const isToday = activeDay === today;
  const d = fromKey(activeDay);
  const props: ViewProps = { state, day: activeDay, log, isToday, now, times, update, updateDay, setDay, go: setTab, extraSettings };
  const score = scoreDay(state, activeDay).total;

  const title = TABS.find((t) => t.key === tab)!.label;
  const dateLine = d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  return (
    <main className="ios min-h-screen pb-28 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 pt-4 md:px-8 md:pt-10">
        <header className="flex items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[13px] font-semibold uppercase tracking-[0.02em] text-fg/50">
              {dateLine}
              {isToday ? "" : " · past day"}
            </p>
            <h1 className="display mt-0.5 text-[34px] md:text-[40px]">{tab === "lyoum" ? (isToday ? "Today" : "Summary") : title}</h1>
          </div>
          <div className="flex shrink-0 items-center gap-1 pb-1">
            <button type="button" aria-label="Previous day" className="grid h-9 w-9 place-items-center rounded-full text-tint" onClick={() => setDayKey(shiftDate(activeDay, -1))}>
              <Chevron dir="left" />
            </button>
            {!isToday && (
              <button type="button" className="px-1 text-[17px] text-tint" onClick={() => setDayKey(null)}>
                Today
              </button>
            )}
            <button
              type="button"
              aria-label="Next day"
              disabled={isToday}
              className="grid h-9 w-9 place-items-center rounded-full text-tint disabled:opacity-25"
              onClick={() => setDayKey(shiftDate(activeDay, 1) >= today ? null : shiftDate(activeDay, 1))}
            >
              <Chevron dir="right" />
            </button>
            <span className="ml-1 grid h-9 min-w-9 place-items-center rounded-full bg-tint px-2 text-[13px] font-semibold tabular-nums text-white">{score}%</span>
          </div>
        </header>
        <p className="mt-1 flex items-center gap-1.5 text-[13px] text-fg/50">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: SYNC[status].color }} />
          {greeting(now.getHours())}, {state.profile.name} · {SYNC[status].label}
        </p>

        <nav className="mt-6 hidden w-fit rounded-[9px] bg-fill/[0.08] p-0.5 md:flex" aria-label="Sections">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              aria-current={tab === t.key ? "page" : undefined}
              className={`rounded-[7px] px-4 py-1.5 text-[13px] font-medium transition-colors ${tab === t.key ? "bg-card text-fg shadow-[0_1px_3px_rgba(0,0,0,0.12)]" : "text-fg/70"}`}
            >
              {t.label}
            </button>
          ))}
        </nav>

        <div className="mt-5 md:mt-6" key={`${tab}-${activeDay}`}>
          {tab === "lyoum" && <Today {...props} />}
          {tab === "salat" && <Salat {...props} />}
          {tab === "gym" && <Gym {...props} />}
          {tab === "makla" && <Makla {...props} />}
          {tab === "nhar" && <Nhar {...props} />}
          {tab === "progress" && <Progress {...props} />}
          {tab === "settings" && <Settings {...props} />}
        </div>
      </div>

      <nav
        className="ios-blur fixed inset-x-0 bottom-0 z-40 border-t border-fill/15 md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom)", paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}
        aria-label="Sections"
      >
        <div className="grid grid-cols-7">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              aria-current={tab === t.key ? "page" : undefined}
              onClick={() => {
                setTab(t.key);
                window.scrollTo({ top: 0 });
              }}
              className={`flex flex-col items-center gap-0.5 pb-1.5 pt-2 text-[10px] font-medium ${tab === t.key ? "text-tint" : "text-fg/45"}`}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={tab === t.key ? 2.1 : 1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d={t.icon} />
              </svg>
              {t.label}
            </button>
          ))}
        </div>
      </nav>
    </main>
  );
}

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="12" height="20" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === "left" ? "M10 2L2 10l8 8" : "M2 2l8 8-8 8"} />
    </svg>
  );
}
