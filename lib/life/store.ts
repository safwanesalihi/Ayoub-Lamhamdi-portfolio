"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { dateKey, defaultState, emptyDay, fromKey, migrateSchedule, type PrayerTimes } from "./plan";
import { calcPrayerTimes } from "./praytimes";
import type { DayLog, LifeState } from "./types";

const KEY = "ayoub-life-v1";

/* eslint-disable @typescript-eslint/no-explicit-any */
type Runtime = { use(name: string): Promise<any> };
const runtime = (): Runtime | undefined => (typeof window !== "undefined" ? (window as any).claude : undefined);

/** "local": this device only · "connecting" · "synced": saved to the account · "offline": account unreachable right now */
export type SyncStatus = "local" | "connecting" | "synced" | "offline";

function normalize(parsed: Partial<LifeState>): LifeState {
  const def = defaultState();
  const schedule = migrateSchedule(parsed.schedule ?? def.schedule);
  return { ...def, ...parsed, schedule, profile: { ...def.profile, ...(parsed.profile ?? {}) }, days: parsed.days ?? {} } as LifeState;
}

function loadLocal(): LifeState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? normalize(JSON.parse(raw)) : defaultState();
  } catch {
    return defaultState();
  }
}

const clean = <T,>(x: T): T => JSON.parse(JSON.stringify(x));
const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

export function useLife() {
  const [state, setState] = useState<LifeState | null>(null);
  const [status, setStatus] = useState<SyncStatus>("local");
  const [ready, setReady] = useState(false);

  // Last values known to match the account store, by reference.
  const synced = useRef<{ profile: unknown; schedule: unknown; days: Record<string, DayLog> }>({ profile: null, schedule: null, days: {} });
  const refs = useRef<{ meta: any; days: any } | null>(null);
  const pending = useRef(new Set<string>());

  useEffect(() => {
    setState(loadLocal());
  }, []);

  // Local cache for instant, offline first paint.
  useEffect(() => {
    if (!state) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage blocked — keep working in memory */
    }
  }, [state]);

  // Account sync (only when running inside a claude.ai artifact).
  useEffect(() => {
    const rt = runtime();
    if (!rt) return;
    let alive = true;
    const unsubs: (() => void)[] = [];
    let timer: ReturnType<typeof setTimeout> | undefined;

    (async () => {
      const [db, user] = await Promise.all([rt.use("db"), rt.use("user")]);
      const id = db && user ? await user.id() : null;
      if (!alive || !db || !id) return;
      setStatus("connecting");
      timer = setTimeout(() => alive && setStatus("offline"), 10_000);

      const meta = db.doc(`data/users/${id}/life`);
      const days = meta.collection("days");
      refs.current = { meta, days };
      let metaLive = false;
      let daysLive = false;
      const maybeReady = () => {
        if (metaLive && daysLive && alive) {
          clearTimeout(timer);
          setStatus("synced");
          setReady(true);
        }
      };

      unsubs.push(
        meta.onSnapshot(
          (snap: any) => {
            if (snap.exists) {
              const body = clean(snap.data()) as Pick<LifeState, "profile" | "schedule">;
              setState((s) => {
                if (!s) return s;
                const profile = { ...s.profile, ...body.profile };
                const schedule = body.schedule ? migrateSchedule(body.schedule) : s.schedule;
                if (pending.current.has("__meta")) return s;
                if (same(profile, s.profile) && same(schedule, s.schedule)) {
                  synced.current.profile = s.profile;
                  synced.current.schedule = s.schedule;
                  return s;
                }
                synced.current.profile = profile;
                synced.current.schedule = schedule;
                return { ...s, profile, schedule };
              });
            }
            if (!snap.metadata.fromCache && !metaLive) {
              metaLive = true;
              maybeReady();
            }
          },
          () => alive && setStatus("offline"),
        ),
      );

      unsubs.push(
        days.onSnapshot(
          (snap: any) => {
            const changes = snap.docChanges();
            setState((s) => {
              if (!s) return s;
              let nextDays = s.days;
              for (const ch of changes) {
                const k = ch.doc.id;
                if (pending.current.has(k)) continue;
                if (ch.type === "removed") {
                  if (snap.metadata.fromCache) continue;
                  if (k in nextDays) {
                    nextDays = { ...nextDays };
                    delete nextDays[k];
                  }
                  delete synced.current.days[k];
                  continue;
                }
                const remote = { ...emptyDay(), ...clean(ch.doc.data()) } as DayLog;
                if (nextDays[k] && same(remote, nextDays[k])) {
                  synced.current.days[k] = nextDays[k];
                  continue;
                }
                nextDays = { ...nextDays, [k]: remote };
                synced.current.days[k] = remote;
              }
              return nextDays === s.days ? s : { ...s, days: nextDays };
            });
            if (!snap.metadata.fromCache && !daysLive) {
              daysLive = true;
              maybeReady();
            }
          },
          () => alive && setStatus("offline"),
        ),
      );
    })().catch(() => alive && setStatus("local"));

    return () => {
      alive = false;
      clearTimeout(timer);
      unsubs.forEach((u) => u());
    };
  }, []);

  // Push local changes (debounced, one write at a time).
  const flushTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const flushing = useRef(false);
  const latest = useRef<LifeState | null>(null);
  latest.current = state;

  const flush = useCallback(async () => {
    if (flushing.current || !refs.current) return;
    flushing.current = true;
    try {
      while (pending.current.size) {
        const [k] = pending.current;
        const s = latest.current!;
        try {
          if (k === "__meta") {
            synced.current.profile = s.profile;
            synced.current.schedule = s.schedule;
            await refs.current.meta.set(clean({ profile: s.profile, schedule: s.schedule, version: 1 }));
          } else if (s.days[k]) {
            synced.current.days[k] = s.days[k];
            await refs.current.days.doc(k).set(clean(s.days[k]));
          } else {
            delete synced.current.days[k];
            await refs.current.days.doc(k).delete();
          }
          // a newer edit to the same doc may have arrived while writing
          const now = latest.current!;
          const changed = k === "__meta" ? now.profile !== synced.current.profile || now.schedule !== synced.current.schedule : now.days[k] !== synced.current.days[k];
          if (!changed) pending.current.delete(k);
        } catch (e: any) {
          pending.current.delete(k);
          if (e?.code === "unavailable" || e?.code === "resource_exhausted") setStatus("offline");
        }
      }
    } finally {
      flushing.current = false;
    }
  }, []);

  useEffect(() => {
    if (!state || !ready) return;
    const sy = synced.current;
    if (state.profile !== sy.profile || state.schedule !== sy.schedule) pending.current.add("__meta");
    for (const k of Object.keys(state.days)) if (state.days[k] !== sy.days[k]) pending.current.add(k);
    for (const k of Object.keys(sy.days)) if (!(k in state.days)) pending.current.add(k);
    if (!pending.current.size) return;
    clearTimeout(flushTimer.current);
    flushTimer.current = setTimeout(flush, 700);
  }, [state, ready, flush]);

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

  return { state, update, updateDay, status };
}

/** Prayer times computed on the device (Moroccan Ministry parameters). */
export function usePrayerTimes(lat: number, lng: number, key: string): PrayerTimes {
  return useMemo(() => calcPrayerTimes(fromKey(key), lat, lng), [lat, lng, key]);
}

/** Offer a file to the viewer: the artifact downloads capability when present, a plain link otherwise. */
export async function saveFile(filename: string, text: string): Promise<boolean> {
  try {
    const dl = await runtime()?.use("downloads");
    if (dl) {
      await dl.save({ filename, data: text });
      return true;
    }
  } catch {
    return false;
  }
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "application/json" }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
    return true;
  } catch {
    return false;
  }
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
