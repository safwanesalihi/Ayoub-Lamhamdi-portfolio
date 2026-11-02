"use client";

import { useState } from "react";
import { AREAS, areaSplit, blockMinutes, toMinutes, uid } from "@/lib/life/plan";
import type { AreaKey, Block } from "@/lib/life/types";
import { btnCls, Card, Check, ghostBtnCls, inputCls } from "./ui";
import type { ViewProps } from "./types";

const AREA_KEYS = Object.keys(AREAS) as AreaKey[];

function fmtH(min: number) {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return m ? `${h}h${String(m).padStart(2, "0")}` : `${h}h`;
}

export function Nhar({ state, log, isToday, now, setDay, update }: ViewProps) {
  const [edit, setEdit] = useState(false);
  const [taskText, setTaskText] = useState("");
  const [taskArea, setTaskArea] = useState<AreaKey>("khedma");
  const mins = now.getHours() * 60 + now.getMinutes();
  const schedule = [...state.schedule].sort((a, b) => toMinutes(a.start) - toMinutes(b.start));
  const split = areaSplit(state.schedule);
  const totalMin = Object.values(split).reduce((a, b) => a + b, 0) || 1;

  const doneMinByArea = Object.fromEntries(AREA_KEYS.map((k) => [k, 0])) as Record<AreaKey, number>;
  for (const b of state.schedule) if (log.blocksDone[b.id]) doneMinByArea[b.area] += blockMinutes(b);

  const setBlock = (id: string, patch: Partial<Block>) =>
    update((s) => ({ ...s, schedule: s.schedule.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <Card
        title="Takssim dyal nhar"
        right={
          <button type="button" className="text-xs text-accent" onClick={() => setEdit((e) => !e)}>
            {edit ? "Sala ✓" : "Bdel l planning"}
          </button>
        }
      >
        <ul className="space-y-1.5">
          {schedule.map((b) => {
            const s = toMinutes(b.start);
            const e = toMinutes(b.end);
            const live = isToday && (e > s ? mins >= s && mins < e : mins >= s || mins < e);
            const color = AREAS[b.area].color;
            if (edit)
              return (
                <li key={b.id} className="grid grid-cols-[4.5rem_4.5rem_1fr] gap-1.5 rounded-xl border border-white/10 p-2 sm:grid-cols-[4.5rem_4.5rem_1fr_7rem_auto]">
                  <input type="time" className={inputCls} value={b.start} onChange={(ev) => setBlock(b.id, { start: ev.target.value })} />
                  <input type="time" className={inputCls} value={b.end} onChange={(ev) => setBlock(b.id, { end: ev.target.value })} />
                  <input className={inputCls} value={b.title} onChange={(ev) => setBlock(b.id, { title: ev.target.value })} />
                  <select className={inputCls} value={b.area} onChange={(ev) => setBlock(b.id, { area: ev.target.value as AreaKey })}>
                    {AREA_KEYS.map((k) => (
                      <option key={k} value={k} className="bg-ink">
                        {AREAS[k].label}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    className="text-xs text-[#E07A5F]"
                    onClick={() => update((st) => ({ ...st, schedule: st.schedule.filter((x) => x.id !== b.id) }))}
                  >
                    Msa7
                  </button>
                </li>
              );
            return (
              <li key={b.id}>
                <button
                  type="button"
                  onClick={() => setDay((d) => ({ ...d, blocksDone: { ...d.blocksDone, [b.id]: !d.blocksDone[b.id] } }))}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-colors ${live ? "border-accent bg-accent/5" : "border-white/10 hover:bg-white/[0.03]"}`}
                >
                  <span className="w-[5.5rem] shrink-0 text-[11px] tabular-nums text-bone/50">
                    {b.start}–{b.end}
                  </span>
                  <span className="h-6 w-1 shrink-0 rounded-full" style={{ background: color }} />
                  <span className={`flex-1 text-sm ${log.blocksDone[b.id] ? "text-bone/40 line-through" : ""}`}>
                    {b.title}
                    {live && <span className="ml-2 text-[10px] text-accent">● DABA</span>}
                  </span>
                  <span
                    className="grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] text-ink"
                    style={{ borderColor: log.blocksDone[b.id] ? color : "rgba(255,255,255,0.25)", background: log.blocksDone[b.id] ? color : "transparent" }}
                  >
                    {log.blocksDone[b.id] ? "✓" : ""}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {edit && (
          <button
            type="button"
            className={`${ghostBtnCls} mt-3`}
            onClick={() => update((s) => ({ ...s, schedule: [...s.schedule, { id: uid(), start: "12:00", end: "13:00", title: "Bloc jdid", area: "khedma" }] }))}
          >
            + Zid bloc
          </button>
        )}
      </Card>

      <div className="grid content-start gap-4">
        <Card title="Jawanib l7ayat — wa9t">
          <div className="mb-4 flex h-3 overflow-hidden rounded-full">
            {AREA_KEYS.map((k) => (
              <div key={k} style={{ width: `${(split[k] / totalMin) * 100}%`, background: AREAS[k].color }} title={AREAS[k].label} />
            ))}
          </div>
          <ul className="space-y-2.5">
            {AREA_KEYS.map((k) => (
              <li key={k}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: AREAS[k].color }} />
                    {AREAS[k].label}
                  </span>
                  <span className="tabular-nums text-bone/60">
                    {fmtH(doneMinByArea[k])} / {fmtH(split[k])}
                  </span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                  <div className="h-full rounded-full" style={{ width: `${split[k] ? (doneMinByArea[k] / split[k]) * 100 : 0}%`, background: AREAS[k].color }} />
                </div>
              </li>
            ))}
          </ul>
        </Card>

        <Card title="To-do dyal lyoum">
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!taskText.trim()) return;
              setDay((d) => ({ ...d, tasks: [...d.tasks, { id: uid(), text: taskText.trim(), area: taskArea, done: false }] }));
              setTaskText("");
            }}
          >
            <input className={inputCls} placeholder="Chno khassek dir…" value={taskText} onChange={(e) => setTaskText(e.target.value)} />
            <select className={`${inputCls} w-28`} value={taskArea} onChange={(e) => setTaskArea(e.target.value as AreaKey)} aria-label="Janib">
              {AREA_KEYS.map((k) => (
                <option key={k} value={k} className="bg-ink">
                  {AREAS[k].label}
                </option>
              ))}
            </select>
            <button className={btnCls}>+</button>
          </form>
          <div className="mt-3 space-y-1.5">
            {log.tasks.map((t) => (
              <div key={t.id} className="flex items-center gap-2">
                <div className="flex-1">
                  <Check
                    checked={t.done}
                    color={AREAS[t.area].color}
                    onChange={(v) => setDay((d) => ({ ...d, tasks: d.tasks.map((x) => (x.id === t.id ? { ...x, done: v } : x)) }))}
                  >
                    {t.text} <span className="text-[10px] text-bone/40">· {AREAS[t.area].label}</span>
                  </Check>
                </div>
                <button type="button" aria-label="Msa7" className="px-1 text-bone/30 hover:text-[#E07A5F]" onClick={() => setDay((d) => ({ ...d, tasks: d.tasks.filter((x) => x.id !== t.id) }))}>
                  ✕
                </button>
              </div>
            ))}
            {log.tasks.length === 0 && <p className="text-xs text-bone/40">Kteb 3 7wayej muhimmin (MIT) li ila derthom nhar dyalek nja7.</p>}
          </div>
        </Card>

        <Card title="Muhasaba — chno t3lmt lyoum?">
          <textarea
            className={`${inputCls} min-h-[110px]`}
            placeholder="Chno mcha mzyan? Chno n7ssen ghedda? Chokr 3la…"
            value={log.note}
            onChange={(e) => setDay((d) => ({ ...d, note: e.target.value }))}
          />
        </Card>
      </div>
    </div>
  );
}
