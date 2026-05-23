"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

const HERO_VIMEO_ID = "1043106925";

type Props = { poster?: string };

export function Hero({ poster }: Props) {
  const [reelOpen, setReelOpen] = useState(false);
  const [bgMounted, setBgMounted] = useState(false);
  const [bgReady, setBgReady] = useState(false);
  const reduce = useReducedMotion();

  const bgSrc = `https://player.vimeo.com/video/${HERO_VIMEO_ID}?background=1&autoplay=1&loop=1&muted=1&quality=auto`;
  const fullSrc = `https://player.vimeo.com/video/${HERO_VIMEO_ID}?autoplay=1&title=0&byline=0&portrait=0&color=ffffff`;

  // Defer the heavy Vimeo iframe until after the initial paint
  useEffect(() => {
    const id = setTimeout(() => setBgMounted(true), 250);
    return () => clearTimeout(id);
  }, []);

  return (
    <section className="relative h-[100svh] w-full overflow-hidden bg-ink">
      {/* Static poster — visible immediately, fades when the video is ready */}
      {poster && (
        <Image
          src={poster}
          alt=""
          fill
          priority
          aria-hidden
          sizes="100vw"
          quality={75}
          className={`pointer-events-none object-cover transition-opacity duration-[2000ms] ease-cinema ${
            bgReady ? "opacity-0" : "opacity-100"
          }`}
        />
      )}

      {/* Vimeo background — mounted after first paint, covers poster once buffered */}
      {bgMounted && (
        <iframe
          src={bgSrc}
          allow="autoplay"
          aria-hidden={true}
          title="Showreel background"
          className="pointer-events-none absolute border-0"
          style={{
            top: "50%",
            left: "50%",
            width: "100vw",
            height: "56.25vw",
            minHeight: "100vh",
            minWidth: "177.78vh",
            transform: "translate(-50%, -50%)",
          }}
          onLoad={() => setTimeout(() => setBgReady(true), 250)}
        />
      )}

      {/* Legibility overlay */}
      <div className="absolute inset-0 bg-ink/40" aria-hidden />

      {/* Bottom bar — stacks on mobile, side-by-side on md+ */}
      <div className="absolute bottom-0 left-0 right-0 flex flex-col gap-6 px-edge pb-8 md:flex-row md:items-end md:justify-between md:pb-14">
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.4 }}
          className="text-sm leading-relaxed text-bone/85 md:max-w-md md:text-base"
        >
          Director &amp; Cinematographer
          <span className="block text-bone/55">Based in Morocco, working worldwide.</span>
        </motion.p>

        <motion.button
          type="button"
          onClick={() => setReelOpen(true)}
          aria-label="Play full showreel"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.1, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.55 }}
          className="group inline-flex items-center gap-4 self-start md:self-auto"
        >
          <span className="label">Play Video</span>
          <span className="relative block h-12 w-12 overflow-hidden rounded-full border border-bone/40 transition-colors duration-700 ease-cinema group-hover:border-bone">
            <span className="absolute left-1/2 top-1/2 -translate-x-[40%] -translate-y-1/2 border-y-[6px] border-l-[10px] border-y-transparent border-l-bone transition-transform duration-700 ease-cinema group-hover:translate-x-[-30%]" />
          </span>
        </motion.button>
      </div>

      {/* Scroll cue */}
      <div className="pointer-events-none absolute bottom-10 left-1/2 hidden h-16 w-px -translate-x-1/2 overflow-hidden md:block">
        <motion.span
          aria-hidden
          className="block h-full w-px bg-bone"
          initial={{ y: "-100%" }}
          animate={{ y: "100%" }}
          transition={{ duration: 2.2, ease: [0.7, 0, 0.3, 1], repeat: Infinity, repeatDelay: 0.3 }}
        />
      </div>

      {/* Full reel modal */}
      <AnimatePresence>
        {reelOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.7, 0, 0.3, 1] }}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-ink/95 px-edge"
            role="dialog"
            aria-modal="true"
            aria-label="Full showreel"
          >
            <button
              type="button"
              onClick={() => setReelOpen(false)}
              className="label absolute right-edge top-6 text-bone/70 hover:text-bone"
              aria-label="Close reel"
            >
              Close ✕
            </button>
            <motion.div
              initial={{ scale: 0.96, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.98, opacity: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="aspect-video w-full max-w-6xl"
            >
              <iframe
                src={fullSrc}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                className="h-full w-full border-0"
                title="Showreel"
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
