"use client";

import { useCallback, useEffect, useState } from "react";
import { dateKey, defaultState, emptyDay, PRAYERS, type PrayerTimes } from "./plan";
import type { DayLog, LifeState } from "./types";

const KEY = "ayoub-life-v1";

function load(): LifeState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as LifeState;
    const def = defaultState();
    return { ...def, ...parsed, profile: { ...def.profile, ...parsed.profile } };
  } catch {
    return defaultState();
  }
}

export function useLife() {
  const [state, setState] = useState<LifeState | null>(null);

  useEffect(() => {
    setState(load());
    const onStorage = (e: StorageEvent) => e.key === KEY && setState(load());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage full or blocked — keep working in memory */
    }
  }, [state]);

  const update = useCallback((fn: (s: LifeState) => LifeState) => {
    setState((s) => (s ? fn(s) : s));
  }, []);

  const updateDay = useCallback((key: string, fn: (d: DayLog) => DayLog) => {
    setState((s) => {
      if (!s) return s;
      const cur = { ...emptyDay(), ...(s.days[key] ?? {}) };
      return { ...s, days: { ...s.days, [key]: fn(cur) } };
    });
  }, []);

  const replace = useCallback((next: LifeState) => setState(next), []);

  return { state, update, updateDay, replace };
}

/** Prayer times from aladhan.com (method 21 = Morocco), cached per day + city. */
export function usePrayerTimes(city: string, country: string, key: string): PrayerTimes {
  const [times, setTimes] = useState<PrayerTimes>({});

  useEffect(() => {
    const cacheKey = `ayoub-life-times:${city}:${country}:${key}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setTimes(JSON.parse(cached));
        return;
      }
    } catch {}
    const [y, m, d] = key.split("-");
    const method = country.toLowerCase().startsWith("mor") || country.toLowerCase() === "maroc" ? 21 : 3;
    const url = `https://api.aladhan.com/v1/timingsByCity/${d}-${m}-${y}?city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&method=${method}`;
    let alive = true;
    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        const t = j?.data?.timings;
        if (!t || !alive) return;
        const clean = (s: string) => String(s).slice(0, 5);
        const out: PrayerTimes = { sunrise: clean(t.Sunrise) };
        for (const p of PRAYERS) out[p.key] = clean(t[p.api]);
        setTimes(out);
        try {
          localStorage.setItem(cacheKey, JSON.stringify(out));
        } catch {}
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [city, country, key]);

  return times;
}

export function useNow(intervalMs = 30_000) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return now;
}

export { dateKey };
