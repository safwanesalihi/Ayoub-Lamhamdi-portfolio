import { Hero } from "@/components/Hero";
import { ReelStrip } from "@/components/ReelStrip";
import { SelectedWork } from "@/components/SelectedWork";
import { ContactCTA } from "@/components/ContactCTA";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchVimeoVideo } from "@/lib/vimeo";

const HERO_VIMEO_ID = "1043106925";

export default async function Home() {
  let heroPoster: string | undefined;
  try {
    const video = await fetchVimeoVideo(HERO_VIMEO_ID);
    heroPoster = video.thumbnail;
  } catch {
    // no poster — the dark bg-ink fallback in Hero handles this
  }

  return (
    <main className="relative">
      <Hero poster={heroPoster} />
      <ReelStrip />
      <SelectedWork />
      <ContactCTA />
      <SiteFooter />
    </main>
  );
}
