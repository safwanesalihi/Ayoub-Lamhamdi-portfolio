"use client";

import { useRef, useState } from "react";
import { DEFAULT_SCHEDULE, defaultState, targets } from "@/lib/life/plan";
import { CITIES } from "@/lib/life/praytimes";
import { saveFile } from "@/lib/life/store";
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

  const [ask, setAsk] = useState<null | "schedule" | "all">(null);
  const [msg, setMsg] = useState("");

  const exportData = async () => {
    const ok = await saveFile(`life-backup-${new Date().toISOString().slice(0, 10)}.json`, JSON.stringify(state, null, 2));
    setMsg(ok ? "Backup tsejjel ✓" : "Ma t9adch ytsejjel l-backup.");
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
            <select
              className={inputCls}
              value={p.city}
              onChange={(e) => {
                const c = CITIES.find((x) => x.name === e.target.value);
                if (c) update((s) => ({ ...s, profile: { ...s.profile, city: c.name, lat: c.lat, lng: c.lng } }));
              }}
            >
              {!CITIES.some((c) => c.name === p.city) && <option value={p.city} className="bg-ink">{p.city}</option>}
              {CITIES.map((c) => (
                <option key={c.name} value={c.name} className="bg-ink">
                  {c.name}
                </option>
              ))}
            </select>
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
          Data dyalk private: 7ta wa7ed ma kayshoufha. F claude.ai katsejjel f l-compte dyalk w kat-synchroniza bin telephone w PC. Backup JSON mzyan mra f chhar.
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
                setMsg("Import tdar ✓");
              } catch {
                setMsg("Had l-fichier machi backup s7i7.");
              }
              e.target.value = "";
            }}
          />
          <button type="button" className={ghostBtnCls} onClick={() => setAsk("schedule")}>
            Reset planning
          </button>
          <button type="button" className="rounded-full border border-[#E07A5F]/50 px-4 py-2 text-sm text-[#E07A5F]" onClick={() => setAsk("all")}>
            Msa7 kolchi
          </button>
        </div>
        {ask && (
          <div className="mt-4 rounded-xl border border-[#E07A5F]/40 p-3 text-sm">
            <p className="text-bone/80">{ask === "all" ? "Msa7 ga3 data (ayam, makla, gym…)? Had l-7aja ma katrj3ch." : "Rje3 l-planning dyal nhar l asli?"}</p>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="rounded-full bg-[#E07A5F] px-4 py-1.5 text-sm text-ink"
                onClick={() => {
                  update((s) => (ask === "all" ? defaultState() : { ...s, schedule: DEFAULT_SCHEDULE }));
                  setMsg(ask === "all" ? "Tmse7 kolchi." : "Planning rje3 l asli.");
                  setAsk(null);
                }}
              >
                Ah, akked
              </button>
              <button type="button" className={ghostBtnCls} onClick={() => setAsk(null)}>
                La
              </button>
            </div>
          </div>
        )}
        {msg && <p className="mt-3 text-xs text-bone/60" role="status">{msg}</p>}
      </Card>
    </div>
  );
}
