"use client";

import type { ReactNode } from "react";

export function Card({ title, right, children, className = "" }: { title?: ReactNode; right?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-white/10 bg-white/[0.03] p-4 md:p-5 ${className}`}>
      {(title || right) && (
        <header className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="label text-bone/70">{title}</h2>}
          {right}
        </header>
      )}
      {children}
    </section>
  );
}

export function Ring({ value, size = 140, stroke = 10, color = "#C9A66B", children }: { value: number; size?: number; stroke?: number; color?: string; children?: ReactNode }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(1, value));
  return (
    <div className="relative grid place-items-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.08)" strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          style={{ transition: "stroke-dashoffset 700ms cubic-bezier(0.16,1,0.3,1)" }}
        />
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export function Bar({ value, max, color = "#C9A66B", label, unit = "" }: { value: number; max: number; color?: string; label?: string; unit?: string }) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0;
  return (
    <div>
      {label && (
        <div className="mb-1.5 flex justify-between text-xs">
          <span className="text-bone/70">{label}</span>
          <span className="tabular-nums text-bone">
            {Math.round(value)}
            <span className="text-bone/40">
              {" "}
              / {Math.round(max)}
              {unit}
            </span>
          </span>
        </div>
      )}
      <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color, transition: "width 600ms cubic-bezier(0.16,1,0.3,1)" }} />
      </div>
    </div>
  );
}

export function Stepper({ value, onChange, step = 1, min = 0, suffix }: { value: number; onChange: (v: number) => void; step?: number; min?: number; suffix?: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-white/15">
      <button type="button" aria-label="Decrease" className="h-9 w-9 text-lg text-bone/70 hover:text-bone" onClick={() => onChange(Math.max(min, +(value - step).toFixed(2)))}>
        −
      </button>
      <span className="min-w-[3.5rem] text-center text-sm tabular-nums">
        {value}
        {suffix}
      </span>
      <button type="button" aria-label="Increase" className="h-9 w-9 text-lg text-bone/70 hover:text-bone" onClick={() => onChange(+(value + step).toFixed(2))}>
        +
      </button>
    </div>
  );
}

export function Check({ checked, onChange, children, color = "#C9A66B" }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; color?: string }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left text-sm transition-colors ${checked ? "border-white/20 bg-white/[0.06]" : "border-white/10 hover:bg-white/[0.03]"}`}
    >
      <span
        className="grid h-5 w-5 shrink-0 place-items-center rounded-md border text-[11px] text-ink"
        style={{ borderColor: checked ? color : "rgba(255,255,255,0.25)", background: checked ? color : "transparent" }}
      >
        {checked ? "✓" : ""}
      </span>
      <span className={checked ? "text-bone/60 line-through decoration-bone/30" : "text-bone"}>{children}</span>
    </button>
  );
}

export const inputCls =
  "w-full rounded-xl border border-white/15 bg-white/[0.04] px-3 py-2 text-sm text-bone placeholder:text-bone/30 focus:border-accent focus:outline-none";

export const btnCls = "rounded-full bg-bone px-4 py-2 text-sm font-normal text-ink transition-opacity hover:opacity-85 disabled:opacity-40";
export const ghostBtnCls = "rounded-full border border-white/15 px-4 py-2 text-sm text-bone/80 transition-colors hover:border-white/40 hover:text-bone";
