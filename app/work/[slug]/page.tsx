import { notFound } from "next/navigation";
import { allProjects } from "@/data/projects";
import { fetchVimeoVideo } from "@/lib/vimeo";
import { SiteFooter } from "@/components/SiteFooter";

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return allProjects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) return {};

  try {
    const video = await fetchVimeoVideo(project.vimeoId);
    return {
      title: `${project.title} — Ayoub Lamhamdi`,
      openGraph: { images: [{ url: video.thumbnail }] },
    };
  } catch {
    return { title: `${project.title} — Ayoub Lamhamdi` };
  }
}

export default async function WorkDetailPage({ params }: Props) {
  const { slug } = await params;
  const project = allProjects.find((p) => p.slug === slug);
  if (!project) notFound();

  let thumbnail: string | undefined;
  let embedSrc = `https://player.vimeo.com/video/${project.vimeoId}?autoplay=0&loop=0&title=0&byline=0&portrait=0&color=ffffff`;

  try {
    const video = await fetchVimeoVideo(project.vimeoId);
    thumbnail = video.thumbnail;
    embedSrc = video.embedUrl;
  } catch {
    // embedSrc fallback above is used; no poster shown
  }

  const isReel = project.format === "reel";

  return (
    <main className="relative">
      <section className="px-edge pb-12 pt-28 md:pb-16 md:pt-48">
        {/* Header */}
        <div className="mb-8 md:mb-10">
          <p className="label text-bone/55">{project.client}</p>
          <h1 className="display mt-3 text-3xl leading-[0.95] md:mt-4 md:text-7xl">{project.title}</h1>
          <p className="mt-3 text-sm text-bone/50 md:mt-4">
            {project.role} · {project.year}
          </p>
        </div>

        {/* Video embed */}
        <div
          className={`relative mx-auto w-full overflow-hidden rounded-sm bg-line/40 ${
            isReel ? "max-w-sm" : "max-w-5xl"
          }`}
          style={thumbnail ? { backgroundImage: `url(${thumbnail})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
        >
          <div className={isReel ? "aspect-[9/16]" : "aspect-video"}>
            <iframe
              src={embedSrc}
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="h-full w-full border-0"
              title={project.title}
            />
          </div>
        </div>

        {/* Blurb + credits */}
        <div className="mx-auto mt-8 grid max-w-5xl grid-cols-12 gap-6 md:mt-12">
          {project.blurb && (
            <p className="col-span-12 text-lg text-bone/70 md:col-span-7">{project.blurb}</p>
          )}
          {project.credits && (
            <dl className="col-span-12 space-y-2 md:col-span-4 md:col-start-9">
              {Object.entries(project.credits).map(([k, v]) => (
                <div key={k} className="flex gap-4 text-sm">
                  <dt className="w-24 shrink-0 text-bone/45">{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
