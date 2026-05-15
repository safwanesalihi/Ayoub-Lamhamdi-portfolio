# Public assets

Drop your real media here. The code expects these paths by default:

- `/videos/placeholder.mp4` — used for the hero reel and every project preview/full video until you swap in real files.
- `/stills/placeholder.jpg` — used for project posters and case-study stills.
- `/stills/hero-poster.jpg` — used as the poster frame for the hero showreel before the video loads.

When you add real project assets, name them by slug — e.g. `/videos/coca-cola-summer-preview.mp4`, `/videos/coca-cola-summer-full.mp4`, `/stills/coca-cola-summer/01.jpg` — and update `data/projects.ts` to point at them.

For best results, encode previews at ~720p H.264 with no audio, target ~1.5 MB per 5s clip.
