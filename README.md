# Ayoub Lamhamdi — Portfolio

Dark, editorial, cinematic-minimal portfolio for Moroccan filmmaker & DOP Ayoub Lamhamdi.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Framer Motion**, and **Lenis**.

---

## Getting started

```bash
pnpm install
pnpm dev
```

Open <http://localhost:3000>.

```bash
pnpm build    # production build
pnpm start    # serve production build
pnpm lint
pnpm typecheck
```

---

## Project structure

```
app/
  layout.tsx              # root layout — fonts, Lenis, nav, cursor
  page.tsx                # home
  about/page.tsx          # full about
  contact/page.tsx        # contact
  fonts.ts                # next/font configuration
  globals.css             # tokens, base styles, reduced-motion
components/
  Hero.tsx                # full-bleed showreel + Play Reel overlay
  SelectedWork.tsx        # asymmetric grid wrapper
  WorkTile.tsx            # hover-preview tile w/ hairline reveal
  AboutTeaser.tsx         # home about block
  ClientMarquee.tsx       # infinite text marquee
  ContactCTA.tsx          # closing CTA
  SiteNav.tsx             # fixed top nav (mix-blend-difference)
  SiteFooter.tsx
  SmoothScroll.tsx        # Lenis provider
  Cursor.tsx              # custom dot cursor
  RevealText.tsx          # per-word mask reveal
data/
  projects.ts             # ← swap content here
public/
  videos/                 # drop reel + project clips here
  stills/                 # posters + case-study stills
tailwind.config.ts        # design tokens
```

---

## Swapping content

All content lives in **[`data/projects.ts`](data/projects.ts)**. Each entry follows:

```ts
type Project = {
  slug: string;
  client: string;
  title: string;
  year: number;
  role: "Director" | "DP" | "Director & DP";
  previewVideo: string;
  fullVideo: string;
  poster: string;
  stills: string[];
  credits?: Record<string, string>;
  layout: "full" | "wide" | "half" | "offset";
  blurb?: string;
};
```

To swap in real work:

1. Drop the files under `public/videos/<slug>-preview.mp4`, `public/videos/<slug>-full.mp4`, and `public/stills/<slug>/01.jpg` etc.
2. Encode previews at ~720p, no audio, ~5s loops, ~1.5 MB per clip.
3. Update `data/projects.ts` with the new paths.
4. Edit the `clients` array in the same file to update the marquee.

The hero reel reads from `/videos/placeholder.mp4` (referenced inside `components/Hero.tsx`). Swap that path when you have the real reel.

---

## Design tokens

Defined in `tailwind.config.ts`:

| Token       | Value     | Use                                 |
| ----------- | --------- | ----------------------------------- |
| `bg-ink`    | `#0A0A0A` | Page background                     |
| `text-bone` | `#EDE7DC` | Primary text                        |
| `paper`     | `#F2EFEA` | Alt off-white                       |
| `muted`     | `#6B6660` | Secondary copy                      |
| `line`      | `#1C1C1C` | Hairlines, dividers                 |
| `accent`    | `#C9A66B` | Restrained gold — used sparingly    |

Typography:

- **Display:** Cormorant Garamond (next/font). Drop-in for PP Editorial New / Canela when licensed.
- **Sans:** Inter Tight (next/font). Drop-in for Neue Haas Grotesk / Söhne when licensed.

Custom utilities: `.label` for tracked small-caps, `.display` for the serif headline style.

---

## Motion

- Page-wide smooth scroll via **Lenis**.
- Per-word mask reveal in `<RevealText />`.
- Hover hairline + metadata fade on `<WorkTile />`.
- Hero reel overlay with backdrop fade + content scale-in.
- All animations honor `prefers-reduced-motion` (Lenis is not initialized; transitions zero out).

Easing curves:

- `cinema` — `cubic-bezier(0.7, 0, 0.3, 1)` for page-wide transitions.
- `editorial` — `cubic-bezier(0.16, 1, 0.3, 1)` for entrances.

---

## Accessibility

- Proper heading order, semantic landmarks (`header`, `main`, `footer`).
- `prefers-reduced-motion`: disables Lenis, mask reveals, marquee, parallax.
- Visible focus on interactive elements; cursor dot is fine-pointer only.
- Video previews are muted, looped, and decorative — never carry critical info.

---

## Deploying to Vercel

```bash
vercel
```

No env vars required out of the box. If you add a CMS, add its tokens to Vercel project settings under **Settings → Environment Variables**.

For best video performance, host large reel files on a CDN (Cloudflare Stream, Mux) and reference their playback URLs in `data/projects.ts` instead of bundling MP4s in `public/`.

---

## Roadmap

- [ ] `/work/[slug]` case-study template (next step — pending design approval of home).
- [ ] Real reel + project assets.
- [ ] Optional CMS (Sanity / Payload) for project entries.
