"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import type { Project } from "@/data/projects";

type Props = {
  project: Project;
  index: number;
  thumbnail?: string;
};

export function ReelCard({ project, index, thumbnail }: Props) {
  const [hovered, setHovered] = useState(false);
  const [iframeReady, setIframeReady] = useState(false);
  const vimeoSrc = `https://player.vimeo.com/video/${project.vimeoId}?background=1&autoplay=1&loop=1&muted=1&quality=auto`;

  useEffect(() => {
    if (!hovered) setIframeReady(false);
  }, [hovered]);

  return (
    <Link
      href={`/work/${project.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      className="group relative block flex-shrink-0 snap-start"
      style={{ width: "clamp(220px, 60vw, 280px)" }}
      aria-label={`${project.client} — ${project.title}`}
    >
      <div className="relative overflow-hidden rounded-sm bg-line/60">
        <div className="relative aspect-[9/16] w-full">
          {thumbnail && (
            <Image
              src={thumbnail}
              alt={project.title}
              fill
              priority={index === 0}
              className={`object-cover transition-opacity duration-500 ${iframeReady ? "opacity-0" : "opacity-100"}`}
              sizes="(max-width: 768px) 60vw, 22vw"
            />
          )}
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
        </div>
      </div>
      <div className="mt-4">
        <div className="flex items-baseline gap-2">
          <span className="label text-xs text-bone/45">{String(index + 1).padStart(2, "0")}</span>
          <p className="display text-base leading-tight">{project.title}</p>
        </div>
        <p className="mt-1 text-xs text-bone/50">{project.year}</p>
      </div>
    </Link>
  );
}
