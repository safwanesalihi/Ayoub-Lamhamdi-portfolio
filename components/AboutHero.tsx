"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ClientMarquee } from "./ClientMarquee";
import { RevealText } from "./RevealText";

export function AboutHero() {
  const reduce = useReducedMotion();

  return (
    <section id="about" className="relative flex flex-col border-t border-line/60 md:min-h-[100svh]">
      {/* Main panel — text full width */}
      <div className="flex flex-col md:flex-1 md:flex-row">
        {/* Text */}
        <div className="flex flex-col px-edge py-10 md:w-full md:justify-between md:py-20">
          <div>
            <motion.p
              className="label text-bone/55"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.1 }}
            >
              About
            </motion.p>
            <RevealText
              as="h2"
              className="display mt-6 text-4xl md:mt-8 md:text-[clamp(3.5rem,5.5vw,7rem)]"
              stagger={0.06}
            >
              Built on direction, light, movement.
            </RevealText>
          </div>

          <div className="mt-6 md:mt-0">
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-12">
              <motion.p
                className="text-sm text-bone/80 md:text-lg"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.2 }}
              >
                Ayoub Lamhamdi is a Moroccan director and cinematographer
                crafting visually driven work with meaning and emotion — from
                commercial campaigns to comedy and narrative pieces. His process
                is built on strong direction, lighting, camera movement, and
                visual effects, transforming simple ideas into memorable images.
              </motion.p>
              <motion.p
                className="hidden text-bone/65 md:block md:text-lg"
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.35 }}
              >
                For Ayoub, directing is about building emotion, delivering a
                message, and telling stories that connect. He has worked on
                advertising campaigns, digital content, and television projects
                for clients including Coca-Cola and Samsung.
              </motion.p>
            </div>
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: reduce ? 0 : 0.5 }}
            >
              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-3 text-sm text-bone/80 transition-colors duration-500 hover:text-bone"
              >
                <span className="label">Read full bio</span>
                <span aria-hidden>→</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Selected clients strip */}
      <div className="border-t border-line/60 px-edge py-8 md:py-10">
        <p className="label mb-8 text-bone/55">Selected clients</p>
        <ClientMarquee />
      </div>
    </section>
  );
}
