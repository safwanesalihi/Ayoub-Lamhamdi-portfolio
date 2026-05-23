import { cookies } from "next/headers";
import projectsData from "@/data/projects.json";
import { login, logout, addProject } from "./actions";
import { DeleteButton } from "./_delete-button";

type SearchParams = Promise<{ success?: string; error?: string }>;

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const { success, error } = await searchParams;
  const cookieStore = await cookies();
  const isAuthed =
    !!process.env.ADMIN_SECRET &&
    cookieStore.get("admin_token")?.value === process.env.ADMIN_SECRET;

  const year = new Date().getFullYear();

  if (!isAuthed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-ink px-4">
        <div className="w-full max-w-xs">
          <p className="label mb-8 text-bone/50">Admin</p>
          {error && (
            <p className="mb-4 border border-red-500/30 bg-red-900/20 px-4 py-2 text-xs text-red-400">
              {decodeURIComponent(error)}
            </p>
          )}
          <form action={login} className="space-y-3">
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

  return (
    <main className="min-h-screen bg-ink px-6 py-10 text-bone md:px-12">
      <div className="mx-auto max-w-2xl">

        {/* Header */}
        <div className="mb-10 flex items-center justify-between border-b border-line/40 pb-6">
          <p className="label text-bone/60">Admin Panel</p>
          <form action={logout}>
            <button type="submit" className="text-xs text-bone/40 hover:text-bone">
              Log out
            </button>
          </form>
        </div>

        {/* Feedback */}
        {success && (
          <div className="mb-8 border border-green-600/30 bg-green-900/10 px-4 py-3 text-sm text-green-400">
            Saved — Vercel is redeploying, changes will be live in ~1 minute.
          </div>
        )}
        {error && (
          <div className="mb-8 border border-red-500/30 bg-red-900/10 px-4 py-3 text-sm text-red-400">
            Error: {decodeURIComponent(error)}
          </div>
        )}

        {/* Add Project */}
        <section className="mb-16">
          <p className="label mb-6 text-bone/50">Add Project</p>
          <form action={addProject} className="grid grid-cols-2 gap-4">

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Vimeo ID *</label>
              <input
                name="vimeoId"
                required
                placeholder="1043106925"
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Format *</label>
              <select
                name="format"
                required
                className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-bone/40"
              >
                <option value="film">Film (landscape)</option>
                <option value="reel">Reel (vertical)</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Title *</label>
              <input
                name="title"
                required
                placeholder="Project Title"
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Client *</label>
              <input
                name="client"
                required
                placeholder="Brand / Studio"
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Year *</label>
              <input
                name="year"
                type="number"
                required
                min={2000}
                max={2099}
                defaultValue={year}
                className="w-full border border-line bg-transparent px-3 py-2 text-sm text-bone outline-none focus:border-bone/40"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Role *</label>
              <select
                name="role"
                required
                className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-bone/40"
              >
                <option value="Director & DP">Director &amp; DP</option>
                <option value="Director">Director</option>
                <option value="DP">DP</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs text-bone/40">Grid layout</label>
              <select
                name="layout"
                className="w-full border border-line bg-ink px-3 py-2 text-sm text-bone outline-none focus:border-bone/40"
              >
                <option value="half">Half</option>
                <option value="full">Full width</option>
                <option value="wide">Wide</option>
                <option value="offset">Offset</option>
              </select>
            </div>

            <div className="col-span-2">
              <label className="mb-1.5 block text-xs text-bone/40">Description (optional)</label>
              <textarea
                name="blurb"
                rows={2}
                placeholder="Short project description..."
                className="w-full resize-none border border-line bg-transparent px-3 py-2 text-sm text-bone placeholder-bone/20 outline-none focus:border-bone/40"
              />
            </div>

            <div className="col-span-2 pt-1">
              <button
                type="submit"
                className="border border-bone/40 px-8 py-2.5 text-sm text-bone transition-colors hover:bg-bone hover:text-ink"
              >
                Add →
              </button>
            </div>

          </form>
        </section>

        {/* Films */}
        <section className="mb-10">
          <p className="label mb-4 text-bone/50">
            Films <span className="text-bone/25">({projectsData.films.length})</span>
          </p>
          <div className="divide-y divide-line/30">
            {projectsData.films.map((p) => (
              <div key={p.slug} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">
                    {p.title}
                    <span className="ml-2 text-bone/35">— {p.client}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-bone/25">{p.year} · {p.vimeoId}</p>
                </div>
                <DeleteButton slug={p.slug} title={p.title} />
              </div>
            ))}
          </div>
        </section>

        {/* Reels */}
        <section>
          <p className="label mb-4 text-bone/50">
            Reels <span className="text-bone/25">({projectsData.reels.length})</span>
          </p>
          <div className="divide-y divide-line/30">
            {projectsData.reels.map((p) => (
              <div key={p.slug} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm">
                    {p.title}
                    <span className="ml-2 text-bone/35">— {p.client}</span>
                  </p>
                  <p className="mt-0.5 text-xs text-bone/25">{p.year} · {p.vimeoId}</p>
                </div>
                <DeleteButton slug={p.slug} title={p.title} />
              </div>
            ))}
          </div>
        </section>

      </div>
    </main>
  );
}
