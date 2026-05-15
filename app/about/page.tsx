import Image from "next/image";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactCTA } from "@/components/ContactCTA";
import { ClientMarquee } from "@/components/ClientMarquee";
import { RevealText } from "@/components/RevealText";

export const metadata = {
  title: "About — Ayoub Lamhamdi",
};

export default function AboutPage() {
  return (
    <main className="relative">

      {/* ── Hero: name + portrait ─────────────────────────────── */}
      <section className="relative grid min-h-[100svh] grid-cols-12 items-end gap-0 overflow-hidden">

        {/* Left — portrait, fills the left half of the screen */}
        <div className="relative col-span-12 order-1 h-[60svh] md:col-span-6 md:h-[100svh]">
          <Image
            src="/ayoub-lamhamdi.jpg"
            alt="Ayoub Lamhamdi"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Gradient on right edge fades photo into page bg on desktop */}
          <div className="absolute inset-y-0 right-0 hidden w-16 bg-gradient-to-l from-ink to-transparent md:block" />
          {/* Gradient at bottom on mobile */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent md:hidden" />
        </div>

        {/* Right — text block, pinned to bottom-right */}
        <div className="col-span-12 order-2 flex flex-col justify-end px-edge pb-10 pt-10 md:col-span-6 md:pb-16 md:pt-0 md:self-end">
          <p className="label mb-6 text-bone/50 md:mb-10">About</p>
          <RevealText
            as="h1"
            className="display text-[clamp(3rem,8vw,8rem)] leading-[0.9]"
            stagger={0.04}
          >
            Filmmaker.
          </RevealText>
          <RevealText
            as="p"
            className="display text-[clamp(3rem,8vw,8rem)] italic leading-[0.9] text-bone/45"
            stagger={0.04}
            delay={0.1}
          >
            Cinematographer.
          </RevealText>
          <p className="mt-6 max-w-[30ch] text-sm leading-relaxed text-bone/55 md:mt-8 md:text-base">
            Based in Casablanca, Morocco.
            <span className="block">Working worldwide.</span>
          </p>
        </div>

      </section>

      {/* ── Bio ───────────────────────────────────────────────── */}
      <section className="grid grid-cols-12 gap-6 border-t border-line/60 px-edge py-section">
        <div className="col-span-12 md:col-span-3">
          <p className="label text-bone/50">Bio</p>
        </div>
        <div className="col-span-12 space-y-6 md:col-span-8 md:space-y-8">
          <p className="text-base leading-relaxed text-bone/85 md:text-xl">
            Ayoub Lamhamdi is a Moroccan filmmaker and cinematographer crafting
            visually driven work with meaning and emotion — from commercial
            campaigns to comedy and narrative pieces. His process is built on
            strong direction, lighting, camera movement, and visual effects,
            transforming simple ideas into memorable images.
          </p>
          <p className="text-base leading-relaxed text-bone/65 md:text-xl">
            For Ayoub, filmmaking is about building emotion, delivering a
            message, and telling stories that connect. He has worked on
            advertising campaigns, digital content, and television projects for
            clients including 2M TV, KFC, and Samsung.
          </p>

          {/* Highlights */}
          <div className="grid grid-cols-2 gap-6 border-t border-line/60 pt-8 md:grid-cols-3 md:gap-10 md:pt-10">
            {[
              { value: "7+", label: "Years in film" },
              { value: "50+", label: "Projects" },
              { value: "MA", label: "Casablanca" },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="display text-4xl md:text-5xl">{value}</p>
                <p className="label mt-2 text-bone/45">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Clients ───────────────────────────────────────────── */}
      <section className="border-t border-line/60 px-edge py-section">
        <p className="label mb-8 text-bone/50 md:mb-10">Selected clients</p>
        <ClientMarquee />
      </section>

      <ContactCTA />
      <SiteFooter />
    </main>
  );
}
