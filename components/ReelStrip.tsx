import { reels } from "@/data/projects";
import { fetchThumbnailMap } from "@/lib/vimeo";
import { ReelCard } from "./ReelCard";
import { RevealText } from "./RevealText";

export async function ReelStrip() {
  const thumbnails = await fetchThumbnailMap(reels.map((r) => r.vimeoId));

  return (
    <section id="reels" className="relative border-t border-line/60 py-section">
      <div className="mb-10 px-edge md:mb-16">
        <p className="label text-bone/55">Reels — Short Form</p>
        <RevealText as="h2" className="display mt-4 text-4xl md:mt-6 md:text-7xl">
          Vertical cuts.
        </RevealText>
      </div>

      <div className="flex gap-4 overflow-x-auto scroll-smooth pb-6 pl-edge pr-edge snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {reels.map((reel, i) => (
          <ReelCard key={reel.slug} project={reel} index={i} thumbnail={thumbnails[reel.vimeoId]} />
        ))}
      </div>
    </section>
  );
}
