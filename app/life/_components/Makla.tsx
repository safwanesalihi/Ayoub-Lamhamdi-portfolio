"use client";

import { useState } from "react";
import { dayTotals, FOODS, mealPlan, targets, uid } from "@/lib/life/plan";
import type { Meal } from "@/lib/life/types";
import { Bar, btnCls, Card, inputCls } from "./ui";
import type { ViewProps } from "./types";

export function Makla({ state, log, setDay }: ViewProps) {
  const t = targets(state.profile);
  const tot = dayTotals(log);
  const plan = mealPlan(state.profile);
  const [q, setQ] = useState("");
  const [qty, setQty] = useState(1);
  const [custom, setCustom] = useState({ name: "", kcal: "", protein: "" });

  const add = (m: Omit<Meal, "id">) => setDay((d) => ({ ...d, meals: [...d.meals, { ...m, id: uid() }] }));
  const remove = (id: string) => setDay((d) => ({ ...d, meals: d.meals.filter((m) => m.id !== id) }));

  const filtered = FOODS.filter((f) => f.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div className="grid content-start gap-4">
        <Card title="Today's targets — lean bulk">
          <div className="space-y-3">
            <Bar label="Calories" value={tot.kcal} max={t.kcal} color="#E5C07B" />
            <Bar label="Protein" value={tot.protein} max={t.protein} unit="g" color="#7FB77E" />
            <Bar label="Carbs" value={tot.carbs} max={t.carbs} unit="g" color="#6FA8DC" />
            <Bar label="Fat" value={tot.fat} max={t.fat} unit="g" color="#E59A7A" />
          </div>
          <p className="mt-4 text-xs leading-relaxed text-bone/50">
            Your maintenance ≈ {t.maintenance} kcal. To build muscle without much fat: +{state.profile.surplus} kcal and {t.protein}g protein (2g/kg). Aim for +0.25 to 0.5 kg per week.
          </p>
        </Card>

        <Card title="Eaten today">
          {log.meals.length === 0 ? (
            <p className="text-sm text-bone/50">Nothing logged yet.</p>
          ) : (
            <ul className="divide-y divide-white/5">
              {log.meals.map((m) => (
                <li key={m.id} className="flex items-center justify-between gap-2 py-2 text-sm">
                  <span className="truncate">{m.name}</span>
                  <span className="flex shrink-0 items-center gap-3 tabular-nums text-bone/60">
                    {Math.round(m.kcal)} kcal · {Math.round(m.protein)}g P
                    <button type="button" aria-label="Remove" onClick={() => remove(m.id)} className="text-bone/40 hover:text-[#E07A5F]">
                      ✕
                    </button>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card title="Add food">
          <div className="flex gap-2">
            <input className={inputCls} placeholder="Search: chicken, eggs, oats…" value={q} onChange={(e) => setQ(e.target.value)} />
            <select className={`${inputCls} w-24`} value={qty} onChange={(e) => setQty(Number(e.target.value))} aria-label="Servings">
              {[0.5, 1, 1.5, 2, 3, 4].map((n) => (
                <option key={n} value={n} className="bg-ink">
                  ×{n}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-3 flex max-h-64 flex-wrap gap-1.5 overflow-y-auto" data-lenis-prevent>
            {filtered.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() =>
                  add({ name: `${f.name} ×${qty} (${f.unit})`, kcal: f.kcal * qty, protein: f.protein * qty, carbs: f.carbs * qty, fat: f.fat * qty })
                }
                className="rounded-full border border-white/10 px-3 py-1.5 text-xs hover:border-white/40"
                title={`${f.unit}: ${f.kcal} kcal, ${f.protein}g protein`}
              >
                {f.name} <span className="text-bone/40">· {f.unit}</span>
              </button>
            ))}
          </div>
          <form
            className="mt-4 grid grid-cols-[1fr_5rem_5rem_auto] gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              if (!custom.name) return;
              add({ name: custom.name, kcal: Number(custom.kcal) || 0, protein: Number(custom.protein) || 0, carbs: 0, fat: 0 });
              setCustom({ name: "", kcal: "", protein: "" });
            }}
          >
            <input className={inputCls} placeholder="Something else" value={custom.name} onChange={(e) => setCustom({ ...custom, name: e.target.value })} />
            <input className={inputCls} placeholder="kcal" inputMode="numeric" value={custom.kcal} onChange={(e) => setCustom({ ...custom, kcal: e.target.value })} />
            <input className={inputCls} placeholder="protein g" inputMode="numeric" value={custom.protein} onChange={(e) => setCustom({ ...custom, protein: e.target.value })} />
            <button className={btnCls}>+</button>
          </form>
        </Card>
      </div>

      <Card title={`Meal plan — ${t.kcal} kcal`}>
        <p className="mb-4 text-xs text-bone/50">Scaled to your weight and calorie target. Tap &quot;Ate this&quot; to log a meal.</p>
        <div className="space-y-3">
          {plan.map((m) => (
            <div key={m.name} className="rounded-xl border border-white/10 p-3">
              <div className="flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xs tabular-nums text-bone/40">{m.time}</span> <span className="text-base">{m.name}</span>
                </div>
                <span className="text-xs tabular-nums text-bone/50">
                  {m.kcal} kcal · {m.protein}g P
                </span>
              </div>
              <ul className="mt-2 space-y-0.5 text-[13px] text-bone/70">
                {m.items.map((it) => (
                  <li key={it.id}>
                    · {it.name} — {it.qty} × {it.unit.replace(/^1 /, "")}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                className="mt-2.5 rounded-full border border-white/15 px-3 py-1 text-xs hover:border-white/40"
                onClick={() =>
                  add({
                    name: m.name,
                    kcal: m.kcal,
                    protein: m.protein,
                    carbs: m.items.reduce((a, i) => a + i.carbs * i.qty, 0),
                    fat: m.items.reduce((a, i) => a + i.fat * i.qty, 0),
                  })
                }
              >
                Ate this ✓
              </button>
            </div>
          ))}
        </div>
        <div className="mt-4 rounded-xl bg-white/[0.04] p-3 text-[12px] leading-relaxed text-bone/60">
          <b className="font-normal text-bone">Tips:</b> 30-40g protein every meal · carbs before and after training · vegetables daily · creatine 5g/day (optional, well proven) ·
          if eating enough is hard, drink calories (smoothie: milk + banana + oats + peanut butter).
        </div>
      </Card>
    </div>
  );
}
