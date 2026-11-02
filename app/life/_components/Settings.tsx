"use client";

import { useRef } from "react";
import { DEFAULT_SCHEDULE, defaultState, targets } from "@/lib/life/plan";
import type { LifeState, Profile } from "@/lib/life/types";
import { Card, ghostBtnCls, inputCls } from "./ui";
import type { ViewProps } from "./types";

const ACTIVITY = [
  { v: 1.2, l: "Glsa bzaf (bureau)" },
  { v: 1.375, l: "Khfif (1-3 gym)" },
  { v: 1.55, l: "Moyen (3-5 gym)" },
  { v: 1.725, l: "Bzaf (6-7 gym / khedma fiha 7raka)" },
  { v: 1.9, l: "Bzaf bzaf" },
];

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs text-bone/60">{label}</span>
      {children}
    </label>
  );
}

export function Settings({ state, update }: ViewProps) {
  const p = state.profile;
  const t = targets(p);
  const fileRef = useRef<HTMLInputElement>(null);
  const set = <K extends keyof Profile>(k: K, v: Profile[K]) => update((s) => ({ ...s, profile: { ...s.profile, [k]: v } }));
  const num = (k: keyof Profile) => (e: React.ChangeEvent<HTMLInputElement>) => set(k, Number(e.target.value) as never);

  const exportData = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `life-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card title="Profil">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Smiya">
            <input className={inputCls} value={p.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Jins">
            <select className={inputCls} value={p.sex} onChange={(e) => set("sex", e.target.value as Profile["sex"])}>
              <option value="m" className="bg-ink">Rajel</option>
              <option value="f" className="bg-ink">Mra</option>
            </select>
          </Field>
          <Field label="3mer">
            <input type="number" className={inputCls} value={p.age} onChange={num("age")} />
          </Field>
          <Field label="Tol (cm)">
            <input type="number" className={inputCls} value={p.heightCm} onChange={num("heightCm")} />
          </Field>
          <Field label="Wazn daba (kg)">
            <input type="number" step="0.1" className={inputCls} value={p.weightKg} onChange={num("weightKg")} />
          </Field>
          <Field label="Hadaf (kg)">
            <input type="number" step="0.1" className={inputCls} value={p.goalWeightKg} onChange={num("goalWeightKg")} />
          </Field>
          <Field label="Nachat">
            <select className={inputCls} value={p.activity} onChange={(e) => set("activity", Number(e.target.value))}>
              {ACTIVITY.map((a) => (
                <option key={a.v} value={a.v} className="bg-ink">
                  {a.l}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Surplus (kcal)">
            <input type="number" step="50" className={inputCls} value={p.surplus} onChange={num("surplus")} />
          </Field>
          <Field label="Ayam gym f simana">
            <select className={inputCls} value={p.trainingDays} onChange={(e) => set("trainingDays", Number(e.target.value) as Profile["trainingDays"])}>
              <option value={3} className="bg-ink">3 — Full body</option>
              <option value={4} className="bg-ink">4 — Upper / Lower</option>
              <option value={5} className="bg-ink">5 — PPL + Upper/Lower</option>
              <option value={6} className="bg-ink">6 — PPL ×2</option>
            </select>
          </Field>
          <Field label="Lma (kisan / nhar)">
            <input type="number" className={inputCls} value={p.waterGoal} onChange={num("waterGoal")} />
          </Field>
          <Field label="Mdina (awqat salat)">
            <input className={inputCls} value={p.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <Field label="Blad">
            <input className={inputCls} value={p.country} onChange={(e) => set("country", e.target.value)} />
          </Field>
          <Field label="Wird Qur2an (sf7at / nhar)">
            <input type="number" className={inputCls} value={p.quranGoalPages} onChange={num("quranGoalPages")} />
          </Field>
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-xs leading-relaxed text-bone/70">
          BMR {t.bmr} · Maintenance {t.maintenance} kcal → <b className="font-normal text-bone">Hadaf {t.kcal} kcal</b> · Protein {t.protein}g · Fat {t.fat}g · Carbs {t.carbs}g
        </div>
      </Card>

      <Card title="Data">
        <p className="text-sm leading-relaxed text-bone/60">
          Ga3 data kat-tsejel ghir f had l browser (localStorage) — 7ta wa7ed ma kayshoufha. Dir backup mra f simana, w import-ih f telephone/PC akhor.
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
            type="file"
            accept="application/json"
            className="hidden"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              try {
                const data = JSON.parse(await f.text()) as LifeState;
                if (!data.profile || !data.days) throw new Error();
                update(() => ({ ...defaultState(), ...data }));
                alert("Import tdar ✓");
              } catch {
                alert("Fichier machi s7i7");
              }
              e.target.value = "";
            }}
          />
          <button type="button" className={ghostBtnCls} onClick={() => confirm("Rje3 l planning l asli?") && update((s) => ({ ...s, schedule: DEFAULT_SCHEDULE }))}>
            Reset planning
          </button>
          <button
            type="button"
            className="rounded-full border border-[#E07A5F]/50 px-4 py-2 text-sm text-[#E07A5F]"
            onClick={() => confirm("Msa7 ga3 data? Had l 7aja ma katrj3ch.") && update(() => defaultState())}
          >
            Msa7 kolchi
          </button>
        </div>
      </Card>
    </div>
  );
}
