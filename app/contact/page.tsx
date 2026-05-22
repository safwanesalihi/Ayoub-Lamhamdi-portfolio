"use client";

import { SiteFooter } from "@/components/SiteFooter";
import { useState } from "react";

export default function ContactPage() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ access_key: "9082d3ca-9d0c-4834-9faa-723fdd20a921", ...form }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setStatus("sent");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus("error");
    }
  }

  return (
    <main className="relative">

      {/* ── Contact form ─────────────────────────────────────── */}
      <section className="px-edge py-section pt-32">
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
