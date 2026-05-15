"use client";

import { useEffect, useRef, useState } from "react";

// A small dot cursor that scales up on interactive elements.
// Disabled on touch / coarse pointers — keeps mobile clean.
export function Cursor() {
  const dotRef = useRef<HTMLDivElement | null>(null);
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);
  const enabled = useRef(false);

  useEffect(() => {
    const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    enabled.current = hasFinePointer && !reduce;
    if (!enabled.current) return;

    let raf = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;
    let tx = x;
    let ty = y;

    const onMove = (e: MouseEvent) => {
      tx = e.clientX;
      ty = e.clientY;
      setVisible(true);
    };
    const onLeave = () => setVisible(false);
    const onOver = (e: MouseEvent) => {
      const t = e.target as HTMLElement | null;
      const interactive = !!t?.closest('a, button, [role="button"], [data-cursor="hover"]');
      setActive(interactive);
    };

    const tick = () => {
      x += (tx - x) * 0.22;
      y += (ty - y) * 0.22;
      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    window.addEventListener("mouseover", onOver);
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("mouseover", onOver);
    };
  }, []);

  if (typeof window === "undefined") return null;

  return (
    <div
      ref={dotRef}
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[100] hidden md:block"
      style={{ willChange: "transform" }}
    >
      <div
        className={`-translate-x-1/2 -translate-y-1/2 rounded-full bg-bone transition-all duration-400 ease-cinema ${
          visible ? "opacity-100" : "opacity-0"
        } ${active ? "h-8 w-8 mix-blend-difference" : "h-1.5 w-1.5"}`}
      />
    </div>
  );
}
