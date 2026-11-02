import type { ReactNode } from "react";
import type { PrayerTimes } from "@/lib/life/plan";
import type { DayLog, LifeState } from "@/lib/life/types";

export type ViewProps = {
  state: LifeState;
  day: string;
  log: DayLog;
  isToday: boolean;
  now: Date;
  times: PrayerTimes;
  update: (fn: (s: LifeState) => LifeState) => void;
  updateDay: (key: string, fn: (d: DayLog) => DayLog) => void;
  setDay: (fn: (d: DayLog) => DayLog) => void;
  go: (tab: TabKey) => void;
  /** Extra sections shown at the top of Settings (account, notifications). */
  extraSettings?: ReactNode;
};

export type TabKey = "lyoum" | "salat" | "gym" | "makla" | "nhar" | "progress" | "settings";
