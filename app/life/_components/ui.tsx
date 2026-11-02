"use client";

import type { ReactNode } from "react";

/** iOS grouped section: small caps header above an inset rounded card. */
export function Card({ title, right, children, className = "" }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`min-w-0 ${className}`}>
      {(title || right) && (
        <header className="mb-1.5 flex items-end justify-between gap-3 px-4">
          {title ? <h2 className="label">{title}</h2> : <span />}
          {right}
        </header>
      )}
      <div className="rounded-[14px] bg-card p-4">{children}</div>
    </section>
  );
}

export type RingSpec = { value: number; color: string; label: string };

/** Apple Activity-style concentric rings. Values above 1 overlap like the Watch rings. */
export function ActivityRings({ rings, size = 156, stroke = 18, gap = 3 }: { rings: RingSpec[]; size?: number; stroke?: number; gap?: number }) {
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label={rings.map((r) => `${r.label} ${Math.round(r.value * 100)}%`).join(", ")}>
      {rings.map((ring, i) => {
        const r = size / 2 - stroke / 2 - i * (stroke + gap);
        const c = 2 * Math.PI * r;
        const v = Math.max(0, Math.min(1, ring.value));
        return (
          <g key={ring.label} transform={`rotate(-90 ${size / 2} ${size / 2})`}>
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={ring.color} strokeOpacity={0.2} strokeWidth={stroke} />
            <circle
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={ring.color}
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={c}
              strokeDashoffset={c * (1 - Math.max(v, 0.001))}
              style={{ transition: "stroke-dashoffset 900ms cubic-bezier(0.16,1,0.3,1)" }}
            />
          </g>
        );
      })}
    </svg>
  );
}

export function Bar({ value, max, color = "rgb(var(--ios-tint))", label, unit = "" }: { value: number; max: number; color?: string; label?: string; unit?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-[15px]">
          <span className="text-fg">{label}</span>
          <span className="tabular-nums text-fg/50">
            <span className="font-semibold text-fg">{Math.round(value)}</span> / {Math.round(max)}
            {unit}
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-fill/[0.08]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

/** iOS UIStepper look: value on the left, a grey − | + pill on the right. */
export function Stepper({ value, onChange, step = 1, min = 0, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="min-w-[2.5rem] text-right text-[17px] font-semibold tabular-nums">
        {value}
        {suffix}
      </span>
      <div className="inline-flex h-8 items-center overflow-hidden rounded-lg bg-fill/[0.08]">
        <button type="button" aria-label="Decrease" className="h-8 w-11 text-xl leading-none text-fg" onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>
          −
        </button>
        <span className="h-4 w-px bg-fill/20" />
        <button type="button" aria-label="Increase" className="h-8 w-11 text-xl leading-none text-fg" onClick={() => onChange(+(value + step).toFixed(2))}>
          +
        </button>
      </div>
    </div>
  );
}

/** Reminders-style round checkbox row. */
export function Check({ checked, onChange, children, color = "rgb(var(--ios-tint))" }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; color?: string }) {
  return (
    <button type="button" role="checkbox" aria-checked={checked} onClick={() => onChange(!checked)} className="flex w-full items-center gap-3 py-2 text-left text-[17px]">
      <Tick checked={checked} color={color} />
      <span className={checked ? "text-fg/40" : "text-fg"}>{children}</span>
    </button>
  );
}

export function Tick({ checked, color = "rgb(var(--ios-tint))" }: { checked: boolean; color?: string }) {
  return (
    <span
      className="grid h-[22px] w-[22px] shrink-0 place-items-center rounded-full border-[1.5px] text-white transition-colors"
      style={{ borderColor: checked ? color : "rgb(var(--ios-fill) / 0.3)", background: checked ? color : "transparent" }}
    >
      {checked && (
        <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
          <path d="M2.5 6.2l2.3 2.3 4.7-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

export const inputCls =
  "w-full rounded-[10px] border-0 bg-fill/[0.07] px-3 py-2.5 text-[16px] text-fg placeholder:text-fg/30 focus:outline-none focus:ring-2 focus:ring-tint";

export const btnCls = "rounded-full bg-tint px-4 py-2 text-[15px] font-semibold text-white transition-opacity disabled:opacity-40";
export const ghostBtnCls = "rounded-full bg-fill/[0.08] px-4 py-2 text-[15px] font-medium text-tint transition-opacity";
