import { Hero } from "@/components/Hero";
import { SelectedWork } from "@/components/SelectedWork";
import { ReelStrip } from "@/components/ReelStrip";
import { AboutTeaser } from "@/components/AboutTeaser";
import { ContactCTA } from "@/components/ContactCTA";
import { SiteFooter } from "@/components/SiteFooter";

export default function Home() {
  return (
    <main className="relative">
      <Hero />
      <SelectedWork />
      <ReelStrip />
      <AboutTeaser />
      <ContactCTA />
      <SiteFooter />
    </main>
  );
}
