import { Hero } from "@/components/Hero";
import { ReelStrip } from "@/components/ReelStrip";
import { SelectedWork } from "@/components/SelectedWork";
import { ContactCTA } from "@/components/ContactCTA";
import { SiteFooter } from "@/components/SiteFooter";
import { fetchVimeoVideo } from "@/lib/vimeo";
import projectsData from "@/data/projects.json";

export default async function Home() {
  const heroId = projectsData.heroVimeoId;
  let heroPoster: string | undefined;
  try {
    const video = await fetchVimeoVideo(heroId);
    heroPoster = video.thumbnail;
  } catch {
    // no poster — the dark bg-ink fallback in Hero handles this
  }

  return (
    <main className="relative">
      <Hero vimeoId={heroId} poster={heroPoster} />
      <ReelStrip />
      <SelectedWork />
      <ContactCTA />
      <SiteFooter />
    </main>
  );
}
