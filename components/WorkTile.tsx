"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import type { Project } from "@/data/projects";

type Props = {
  project: Project;
  index: number;
};

export function WorkTile({ project, index }: Props) {
  const ref = useRef<HTMLAnchorElement | null>(null);
  const [hovered, setHovered] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const reduce = useReducedMotion();
  const isReel = project.format === "reel";

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["6%", "-6%"]);

  // Reset iframe-ready state when hover ends so next hover starts clean
  useEffect(() => {
    if (!hovered) setIframeReady(false);
  }, [hovered]);

  const vimeoSrc = `https://player.vimeo.com/video/${project.vimeoId}?background=1&autoplay=1&loop=1&muted=1&quality=auto`;

  return (
    <Link
      ref={ref}
      href={`/work/${project.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative block"
      aria-label={`${project.client} — ${project.title}`}
    >
      <div className="relative overflow-hidden bg-line/60">
        <motion.div
          style={{ y }}
          className={`relative w-full ${isReel ? "aspect-[9/16]" : "aspect-[4/3] md:aspect-[16/10]"}`}
        >
          {/* Poster — stays visible until the iframe is ready, then fades behind it */}
          <Image
            src={project.poster}
            alt={project.title}
            fill
            className={`object-cover transition-opacity duration-500 ${iframeReady ? "opacity-0" : "opacity-100"}`}
            sizes={isReel ? "33vw" : "100vw"}
          />

          {/* Iframe mounts on hover, fades in only after it signals ready */}
          {hovered && (
            <iframe
              src={vimeoSrc}
              allow="autoplay"
              className={`absolute inset-0 h-full w-full border-0 transition-opacity duration-500 ${iframeReady ? "opacity-100" : "opacity-0"}`}
              title={project.title}
              onLoad={() => setTimeout(() => setIframeReady(true), 150)}
            />
          )}

          <div className="absolute inset-0 bg-ink/15 transition-opacity duration-700 ease-cinema group-hover:bg-ink/0" />
        </motion.div>
      </div>

      <div className="mt-5 flex items-start justify-between gap-6">
        <div>
          <div className="flex items-baseline gap-3">
            <span className="label text-bone/55">{String(index + 1).padStart(2, "0")}</span>
            <h3 className="display text-2xl md:text-3xl">
              {project.title}
              <span className="text-bone/40"> — {project.client}</span>
            </h3>
          </div>
          <div
            className={`mt-3 h-px w-full origin-left bg-bone/40 transition-transform duration-700 ease-cinema ${
              hovered ? "scale-x-100" : "scale-x-0"
            }`}
            aria-hidden
          />
          <p
            className={`mt-3 text-sm text-bone/65 transition-opacity duration-700 ease-cinema ${
              hovered ? "opacity-100" : "opacity-0"
            }`}
          >
            {project.role} · {project.year}
          </p>
        </div>
        <span className="label hidden whitespace-nowrap text-bone/45 md:block">View →</span>
      </div>
    </Link>
  );
}
