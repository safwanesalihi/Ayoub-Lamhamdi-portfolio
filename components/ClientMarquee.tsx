"use client";

import { motion, useReducedMotion } from "framer-motion";
import { clients } from "@/data/projects";

// Horizontal infinite marquee of plain-text client wordmarks. Two copies of the
// list are placed side by side, then translated as a unit by -50%.
export function ClientMarquee() {
  const reduce = useReducedMotion();
  const row = clients.map((c) => c).join("  —  ");
  return (
    <div className="relative overflow-hidden">
      <motion.div
        className="flex w-max gap-[2rem] whitespace-nowrap font-display text-3xl tracking-tight md:gap-[2.5rem] md:text-5xl lg:text-7xl"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{
          duration: 38,
          ease: "linear",
          repeat: Infinity,
        }}
      >
        <span>{row}  —  </span>
        <span>{row}  —  </span>
      </motion.div>
    </div>
  );
}
