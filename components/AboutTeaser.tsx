import Link from "next/link";
import { RevealText } from "./RevealText";
import { ClientMarquee } from "./ClientMarquee";

export function AboutTeaser() {
  return (
    <section id="about" className="relative border-t border-line/60 px-edge py-section">
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 md:col-span-3">
          <p className="label text-bone/55">About</p>
        </div>
        <div className="col-span-12 md:col-span-9">
          <RevealText
            as="p"
            className="display max-w-[20ch] text-3xl md:text-6xl"
            stagger={0.05}
          >
            Built on direction, light, movement, and quiet restraint.
          </RevealText>
          <div className="mt-8 grid grid-cols-1 gap-6 md:mt-12 md:grid-cols-2 md:gap-16">
            <p className="text-base text-bone/80 md:text-lg">
              Ayoub Lamhamdi is a Moroccan director and cinematographer crafting
              visually driven work with meaning and emotion — from commercial
              campaigns to comedy and narrative pieces. His process is built on
              strong direction, lighting, camera movement, and visual effects,
              transforming simple ideas into memorable images.
            </p>
            <p className="text-base text-bone/65 md:text-lg">
              For Ayoub, directing is about building emotion, delivering a
              message, and telling stories that connect. He has worked on
              advertising campaigns, digital content, and television projects for
              clients including Coca-Cola and Samsung.
            </p>
          </div>
          <Link
            href="/about"
            className="mt-12 inline-flex items-center gap-3 text-sm text-bone/80 hover:text-bone"
          >
            <span className="label">Read full bio</span>
            <span aria-hidden>→</span>
          </Link>
        </div>
      </div>

      <div className="mt-14 border-t border-line/60 pt-8 md:mt-24 md:pt-10">
        <p className="label mb-8 text-bone/55">Selected clients</p>
        <ClientMarquee />
      </div>
    </section>
  );
}
