"use client";

import Image from "next/image";
import Link from "next/link";
import { SiteFooter } from "@/components/SiteFooter";
import { RevealText } from "@/components/RevealText";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="relative">

      {/* ── Hero: title + photo ───────────────────────────────── */}
      <section className="relative grid min-h-[100svh] grid-cols-12 items-end gap-0 overflow-hidden">

        {/* Left — text + contact info */}
        <div className="col-span-12 order-2 flex flex-col justify-end px-edge pb-10 pt-10 md:col-span-6 md:pb-16 md:pt-0 md:self-end">
          <p className="label mb-6 text-bone/50 md:mb-10">Get in touch</p>
          <RevealText
            as="h1"
            className="display text-[clamp(2.75rem,7vw,7rem)] leading-[0.9]"
            stagger={0.04}
          >
            Let&rsquo;s make
          </RevealText>
          <RevealText
            as="p"
            className="display text-[clamp(2.75rem,7vw,7rem)] italic leading-[0.9] text-bone/45"
            stagger={0.04}
            delay={0.1}
          >
            something.
          </RevealText>

          <div className="mt-8 space-y-5 md:mt-10">
            <div>
              <p className="label text-bone/40">Email</p>
              <Link
                href="mailto:lamhamdiayoub36@gmail.com"
                className="mt-2 inline-block text-base underline decoration-bone/25 underline-offset-8 transition-colors hover:decoration-bone md:text-lg"
              >
                lamhamdiayoub36@gmail.com
              </Link>
            </div>
            <div>
              <p className="label text-bone/40">Phone</p>
              <Link
                href="tel:+212689616143"
                className="mt-2 inline-block text-base underline decoration-bone/25 underline-offset-8 transition-colors hover:decoration-bone md:text-lg"
              >
                +212 689-616143
              </Link>
            </div>
          </div>
        </div>

        {/* Right — portrait */}
        <div className="relative col-span-12 order-1 h-[60svh] md:col-span-6 md:h-[100svh]">
          <Image
            src="/ayoub-contact.jpg"
            alt="Ayoub Lamhamdi"
            fill
            priority
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Blend left edge into page on desktop */}
          <div className="absolute inset-y-0 left-0 hidden w-16 bg-gradient-to-r from-ink to-transparent md:block" />
          {/* Blend bottom on mobile */}
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-ink to-transparent md:hidden" />
        </div>

      </section>

      {/* ── Contact form ─────────────────────────────────────── */}
      <section className="border-t border-line/60 px-edge py-section">
        <div className="grid grid-cols-12 gap-6">
          <div className="col-span-12 md:col-span-4">
            <p className="label text-bone/50">Send a message</p>
            <p className="mt-4 text-sm text-bone/50">
              Fill in the form and I&rsquo;ll get back to you within 24 hours.
            </p>
            <div className="mt-10 hidden md:block">
              <p className="label text-bone/40">Elsewhere</p>
              <ul className="mt-4 space-y-2 text-sm">
                <li><a href="https://www.instagram.com/ayoublamhamdi/" target="_blank" rel="noreferrer" className="text-bone/65 transition-colors hover:text-bone">Instagram</a></li>
                <li><a href="https://vimeo.com/ayoublamhamdi" target="_blank" rel="noreferrer" className="text-bone/65 transition-colors hover:text-bone">Vimeo</a></li>
              </ul>
            </div>
          </div>

          <div className="col-span-12 md:col-span-7 md:col-start-6">
            {status === "sent" ? (
              <p className="text-lg text-bone/80">Message sent — I&rsquo;ll get back to you soon.</p>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 md:col-span-1">
                    <label className="label mb-2 block text-bone/50">Name</label>
                    <input
                      required
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full border-b border-bone/20 bg-transparent pb-3 text-base outline-none transition-colors focus:border-bone placeholder:text-bone/30"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="col-span-2 md:col-span-1">
                    <label className="label mb-2 block text-bone/50">Email</label>
                    <input
                      required
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full border-b border-bone/20 bg-transparent pb-3 text-base outline-none transition-colors focus:border-bone placeholder:text-bone/30"
                      placeholder="your@email.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="label mb-2 block text-bone/50">Subject</label>
                  <input
                    required
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full border-b border-bone/20 bg-transparent pb-3 text-base outline-none transition-colors focus:border-bone placeholder:text-bone/30"
                    placeholder="Project brief, collaboration…"
                  />
                </div>
                <div>
                  <label className="label mb-2 block text-bone/50">Message</label>
                  <textarea
                    required
                    rows={5}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    className="w-full resize-none border-b border-bone/20 bg-transparent pb-3 text-base outline-none transition-colors focus:border-bone placeholder:text-bone/30"
                    placeholder="Tell me about your project…"
                  />
                </div>
                {status === "error" && (
                  <p className="text-sm text-red-400">Something went wrong. Please try again or email directly.</p>
                )}
                <button
                  type="submit"
                  disabled={status === "sending"}
                  className="group inline-flex items-center gap-3 disabled:opacity-50"
                >
                  <span className="label">{status === "sending" ? "Sending…" : "Send message"}</span>
                  <span className="relative block h-12 w-12 overflow-hidden rounded-full border border-bone/40 transition-colors duration-700 ease-cinema group-hover:border-bone">
                    <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-base transition-transform duration-700 ease-cinema group-hover:translate-x-[10%]">
                      →
                    </span>
                  </span>
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
