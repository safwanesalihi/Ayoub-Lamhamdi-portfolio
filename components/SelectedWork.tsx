import { films } from "@/data/projects";
import { fetchThumbnailMap } from "@/lib/vimeo";
import { WorkTile } from "./WorkTile";
import { RevealText } from "./RevealText";

const layoutMap = [
  "md:col-span-12",
  "md:col-span-7 md:col-start-1",
  "md:col-span-5 md:col-start-8 md:translate-y-[10vh]",
  "md:col-span-8 md:col-start-3",
];

export async function SelectedWork() {
  const thumbnails = await fetchThumbnailMap(films.map((f) => f.vimeoId));

  return (
    <section id="work" className="relative px-edge py-section">
      <div className="mb-10 flex items-end justify-between md:mb-24">
        <div>
          <p className="label text-bone/55">Selected Work — 2020 / 2025</p>
          <RevealText as="h2" className="display mt-6 text-5xl md:text-7xl">
            A decade of frames.
          </RevealText>
        </div>
        <p className="hidden max-w-xs text-sm text-bone/60 md:block">
          A short selection of commercial, narrative, and editorial work — for clients
          including 2M TV, KFC, and Samsung.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-y-12 md:grid-cols-12 md:gap-x-6 md:gap-y-40">
        {films.map((project, i) => (
          <div key={project.slug} className={`col-span-1 ${layoutMap[i % layoutMap.length]}`}>
            <WorkTile
              project={project}
              index={i}
              priority={i === 0}
              thumbnail={thumbnails[project.vimeoId]}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
