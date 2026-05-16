import { Hero } from "@/components/Hero";
import { AboutHero } from "@/components/AboutHero";
import { ReelStrip } from "@/components/ReelStrip";
import { SelectedWork } from "@/components/SelectedWork";
import { ContactCTA } from "@/components/ContactCTA";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="relative">
      <AboutHero />
      <Hero />
      <ReelStrip />
      <SelectedWork />
      <ContactCTA />
      <SiteFooter />
    </main>
  );
}
