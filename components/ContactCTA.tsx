import Link from "next/link";
import { RevealText } from "./RevealText";

export function ContactCTA() {
  return (
    <section id="contact" className="relative border-t border-line/60 px-edge py-section">
      <div className="grid grid-cols-12 items-end gap-6">
        <div className="col-span-12 md:col-span-10">
          <p className="label text-bone/55">Get in touch</p>
          <RevealText
            as="h2"
            className="display mt-4 text-[2.5rem] leading-[0.95] md:mt-6 md:text-[clamp(4rem,9vw,9rem)]"
            stagger={0.05}
          >
            Have something in mind?
          </RevealText>
          <RevealText
            as="p"
            className="display mt-2 text-[2.5rem] italic leading-[0.95] text-bone/65 md:text-[clamp(4rem,9vw,9rem)]"
            stagger={0.05}
            delay={0.2}
          >
            Let&rsquo;s talk.
          </RevealText>
        </div>
        <div className="col-span-12 mt-8 flex items-end justify-between gap-6 md:col-span-2 md:mt-0 md:justify-end">
          <Link
            href="/contact"
            className="group inline-flex items-center gap-3 whitespace-nowrap"
            data-cursor="hover"
          >
            <span className="label">Contact</span>
            <span className="relative block h-12 w-12 overflow-hidden rounded-full border border-bone/40 transition-colors duration-700 ease-cinema group-hover:border-bone">
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base transition-transform duration-700 ease-cinema group-hover:translate-x-[10%]">
                →
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
