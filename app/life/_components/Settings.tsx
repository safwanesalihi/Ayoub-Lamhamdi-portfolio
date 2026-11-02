"use client";

import { useRef, useState } from "react";
import { DEFAULT_SCHEDULE, defaultState, targets } from "@/lib/life/plan";
import { CITIES } from "@/lib/life/praytimes";
import { saveFile } from "@/lib/life/store";
import type { LifeState, Profile } from "@/lib/life/types";
import { Card, ghostBtnCls, inputCls } from "./ui";
import type { ViewProps } from "./types";

const ACTIVITY = [
  { v: 1.2, l: "Sedentary (desk job)" },
  { v: 1.375, l: "Light (1-3 workouts)" },
  { v: 1.55, l: "Moderate (3-5 workouts)" },
  { v: 1.725, l: "High (6-7 workouts / active job)" },
  { v: 1.9, l: "Very high" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-fg/60">{label}</span>
      {children}
    </label>
  );
}

export function Settings({ state, update, extraSettings }: ViewProps) {
  const p = state.profile;
  const t = targets(p);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => update((s) => ({ ...s, profile: { ...s.profile, [k]: v } }));
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never);

  const [ask, setAsk] = useState<null | "schedule" | "all">(null);
  const [msg, setMsg] = useState("");

  const exportData = async () => {
    const ok = await saveFile(`life-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2));
    setMsg(ok ? "Backup saved ✓" : "The backup couldn't be saved.");
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {extraSettings}
      <Card title="Profile">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Name">
            <input className={inputCls} value={p.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Sex">
            <select className={inputCls} value={p.sex} onChange={(e) => set("sex", e.target.value as Profile["sex"])}>
              <option value="m" className="bg-card">Male</option>
              <option value="f" className="bg-card">Female</option>
            </select>
          </Field>
          <Field label="Age">
            <input type="number" className={inputCls} value={p.age} onChange={num("age")} />
          </Field>
          <Field label="Height (cm)">
            <input type="number" className={inputCls} value={p.heightCm} onChange={num("heightCm")} />
          </Field>
          <Field label="Current weight (kg)">
            <input type="number" step="0.1" className={inputCls} value={p.weightKg} onChange={num("weightKg")} />
          </Field>
          <Field label="Goal weight (kg)">
            <input type="number" step="0.1" className={inputCls} value={p.goalWeightKg} onChange={num("goalWeightKg")} />
          </Field>
          <Field label="Activity level">
            <select className={inputCls} value={p.activity} onChange={(e) => set("activity", Number(e.target.value))}>
              {ACTIVITY.map((a) => (
                <option key={a.v} value={a.v} className="bg-card">
                  {a.l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Surplus (kcal)">
            <input type="number" step="50" className={inputCls} value={p.surplus} onChange={num("surplus")} />
          </Field>
          <Field label="Training days per week">
            <select className={inputCls} value={p.trainingDays} onChange={(e) => set("trainingDays", Number(e.target.value) as Profile["trainingDays"])}>
              <option value={3} className="bg-card">3 — Full body</option>
              <option value={4} className="bg-card">4 — Upper / Lower</option>
              <option value={5} className="bg-card">5 — PPL + Upper/Lower</option>
              <option value={6} className="bg-card">6 — PPL ×2</option>
            </select>
          </Field>
          <Field label="Water (glasses / day)">
            <input type="number" className={inputCls} value={p.waterGoal} onChange={num("waterGoal")} />
          </Field>
          <Field label="City (prayer times)">
            <select
              className={inputCls}
              value={p.city}
              onChange={(e) => {
                const c = CITIES.find((x) => x.name === e.target.value);
                if (c) update((s) => ({ ...s, profile: { ...s.profile, city: c.name, lat: c.lat, lng: c.lng } }));
              }}
            >
              {!CITIES.some((c) => c.name === p.city) && <option value={p.city} className="bg-card">{p.city}</option>}
              {CITIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-card">
                  {c.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Quran wird (pages / day)">
            <input type="number" className={inputCls} value={p.quranGoalPages} onChange={num("quranGoalPages")} />
          </Field>
        </div>
        <div className="mt-4 rounded-xl bg-fill/[0.04] p-3 text-xs leading-relaxed text-fg/70">
          BMR {t.bmr} · Maintenance {t.maintenance} kcal → <b className="font-normal text-fg">Target {t.kcal} kcal</b> · Protein {t.protein}g · Fat {t.fat}g · Carbs {t.carbs}g
        </div>
      </Card>

      <Card title="Data">
        <p className="text-sm leading-relaxed text-fg/60">
          Your data is private: nobody else can see it. On claude.ai it's saved to your account and syncs between your phone and computer. A JSON backup once a month is still a good idea.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <button type="button" className={ghostBtnCls} onClick={exportData}>
            Export backup
          </button>
          <button type="button" className={ghostBtnCls} onClick={() => fileRef.current?.click()}>
            Import backup
          </button>
          <input
            ref={fileRef}
            id="life-import"
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const data = JSON.parse(await f.text()) as LifeState;
                if (!data.profile || !data.days) throw new Error();
                const def = defaultState();
                update(() => ({ ...def, ...data, profile: { ...def.profile, ...data.profile } }));
                setMsg("Backup imported ✓");
              } catch {
                setMsg("That file isn't a valid backup.");
              }
              e.target.value = "";
            }}
          />
          <button type="button" className={ghostBtnCls} onClick={() => setAsk("schedule")}>
            Reset planning
          </button>
          <button type="button" className="rounded-full border border-[#FF453A]/50 px-4 py-2 text-sm text-[#FF453A]" onClick={() => setAsk("all")}>
            Delete everything
          </button>
        </div>
        {ask && (
          <div className="mt-4 rounded-xl border border-[#FF453A]/40 p-3 text-sm">
            <p className="text-fg/80">{ask === "all" ? "Delete all data (days, meals, workouts…)? This can't be undone." : "Restore the default day plan?"}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-[#FF453A] px-4 py-1.5 text-sm text-white"
                onClick={() => {
                  update((s) => (ask === "all" ? defaultState() : { ...s, schedule: DEFAULT_SCHEDULE }));
                  setMsg(ask === "all" ? "Everything deleted." : "Day plan restored.");
                  setAsk(null);
                }}
              >
                Yes, confirm
              </button>
              <button type="button" className={ghostBtnCls} onClick={() => setAsk(null)}>
                Cancel
              </button>
            </div>
          </div>
        )}
        {msg && <p className="mt-3 text-xs text-fg/60" role="status">{msg}</p>}
      </Card>
    </div>
  );
}
