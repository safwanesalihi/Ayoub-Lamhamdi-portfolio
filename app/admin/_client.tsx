"use client";

import { useState } from "react";
import { verifyLogin, addProject, deleteProject } from "./actions";

type Project = {
  slug: string;
  client: string;
  title: string;
  year: number;
  vimeoId: string;
  format: string;
  layout: string;
};

type Feedback = { type: "success" | "error"; message: string };

export function AdminClient({
  films: initialFilms,
  reels: initialReels,
}: {
  films: Project[];
  reels: Project[];
}) {
  const [isAuthed, setIsAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [films, setFilms] = useState(initialFilms);
  const [reels, setReels] = useState(initialReels);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [loading, setLoading] = useState(false);

  const year = new Date().getFullYear();

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const pwd = fd.get("password") as string;
    const result = await verifyLogin({}, fd);
    if (result.success) {
      setPassword(pwd);
      setIsAuthed(true);
      setLoginError("");
    } else {
      setLoginError(result.error ?? "Wrong password");
    }
  }

  async function handleAddProject(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setFeedback(null);
    const fd = new FormData(e.currentTarget);
    fd.set("password", password);
    const result = await addProject({}, fd);
    setLoading(false);
    if (result.success) {
      setFeedback({ type: "success", message: "Saved — Vercel is redeploying, live in ~1 min." });
      const format = fd.get("format") as string;
      const newProject: Project = {
        slug: `${fd.get("title")}-${fd.get("client")}`
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, ""),
        client: fd.get("client") as string,
        title: fd.get("title") as string,
        year: parseInt(fd.get("year") as string, 10),
        vimeoId: (fd.get("vimeoId") as string).trim(),
        format,
        layout: (fd.get("layout") as string) || "half",
      };
      if (format === "film") setFilms((prev) => [...prev, newProject]);
      else setReels((prev) => [...prev, newProject]);
      (e.target as HTMLFormElement).reset();
    } else {
      setFeedback({ type: "error", message: result.error ?? "Failed to add project" });
    }
  }

  async function handleDelete(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    setLoading(true);
    setFeedback(null);
    const fd = new FormData();
    fd.set("password", password);
    fd.set("slug", slug);
    const result = await deleteProject({}, fd);
    setLoading(false);
    if (result.success) {
      setFilms((prev) => prev.filter((p) => p.slug !== slug));
      setReels((prev) => prev.filter((p) => p.slug !== slug));
      setFeedback({ type: "success", message: "Deleted — Vercel is redeploying, live in ~1 min." });
    } else {
      setFeedback({ type: "error", message: result.error ?? "Failed to delete" });
    }
  }

  /* ── Login screen ───────────────────────────────────────────── */
  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="w-full max-w-xs">
          <p className="label mb-8 text-bone/50">Admin</p>
          {loginError && (
            <p className="mb-4 border border-red-500/30 bg-red-900/20 px-4 py-2 text-xs text-red-400">
              {loginError}
            </p>
          )}
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="password"
              name="password"
              placeholder="Password"
              autoFocus
              required
              className="w-full border border-line bg-transparent px-4 py-3 text-sm text-bone placeholder-bone/30 outline-none focus:border-bone/50"
            />
            <button
              type="submit"
              className="w-full border border-bone/40 py-3 text-sm text-bone transition-colors hover:bg-bone hover:text-ink"
            >
              Enter
            </button>
          </form>
        </div>
      </main>
    );
  }

  /* ── Admin panel ────────────────────────────────────────────── */
  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-bone md:px-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-line/40 pb-6">
          <p className="label text-bone/60">Admin Panel</p>
          <button
            onClick={() => { setIsAuthed(false); setPassword(""); setFeedback(null); }}
            className="text-xs text-bone/40 hover:text-bone"
          >
            Log out
          </button>
        </div>

        {/* Feedback */}
        {feedback && (
          <div className={`mb-8 border px-4 py-3 text-sm ${
            feedback.type === "success"
              ? "border-green-600/30 bg-green-900/10 text-green-400"
              : "border-red-500/30 bg-red-900/10 text-red-400"
          }`}>
            {feedback.message}
          </div>
        )}

        {/* Add Project */}
        <section className="mb-16">
          <p className="label mb-6 text-bone/50">Add Project</p>
          <form onSubmit={handleAddProject} className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Vimeo ID *</label>
              <input name="vimeoId" required placeholder="1043106925"
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Format *</label>
              <select name="format" required className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-bone/40">
                <option value="film">Film (landscape)</option>
                <option value="reel">Reel (vertical)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Title *</label>
              <input name="title" required placeholder="Project Title"
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Client *</label>
              <input name="client" required placeholder="Brand / Studio"
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Year *</label>
              <input name="year" type="number" required min={2000} max={2099} defaultValue={year}
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone outline-none focus:border-bone/40" />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Role *</label>
              <select name="role" required className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-bone/40">
                <option value="Director & DP">Director &amp; DP</option>
                <option value="Director">Director</option>
                <option value="DP">DP</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Grid layout</label>
              <select name="layout" className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-bone/40">
                <option value="half">Half</option>
                <option value="full">Full width</option>
                <option value="wide">Wide</option>
                <option value="offset">Offset</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs text-bone/40">Description (optional)</label>
              <textarea name="blurb" rows={2} placeholder="Short project description..."
                className="w-full resize-none border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40" />
            </div>

            <div className="col-span-2 pt-1">
              <button type="submit" disabled={loading}
                className="border border-bone/40 px-8 py-2.5 text-sm text-bone transition-colors hover:bg-bone hover:text-ink disabled:opacity-40">
                {loading ? "Saving…" : "Add →"}
              </button>
            </div>

          </form>
        </section>

        {/* Films */}
        <section className="mb-10">
          <p className="label mb-4 text-bone/50">Films <span className="text-bone/25">({films.length})</span></p>
          <div className="divide-y divide-line/30">
            {films.map((p) => (
              <div key={p.slug} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{p.title}<span className="ml-2 text-bone/35">— {p.client}</span></p>
                  <p className="mt-0.5 text-xs text-bone/25">{p.year} · {p.vimeoId}</p>
                </div>
                <button onClick={() => handleDelete(p.slug, p.title)} disabled={loading}
                  className="px-2 py-1 text-xs text-bone/30 transition-colors hover:text-red-400 disabled:opacity-40">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Reels */}
        <section>
          <p className="label mb-4 text-bone/50">Reels <span className="text-bone/25">({reels.length})</span></p>
          <div className="divide-y divide-line/30">
            {reels.map((p) => (
              <div key={p.slug} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">{p.title}<span className="ml-2 text-bone/35">— {p.client}</span></p>
                  <p className="mt-0.5 text-xs text-bone/25">{p.year} · {p.vimeoId}</p>
                </div>
                <button onClick={() => handleDelete(p.slug, p.title)} disabled={loading}
                  className="px-2 py-1 text-xs text-bone/30 transition-colors hover:text-red-400 disabled:opacity-40">
                  Delete
                </button>
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
