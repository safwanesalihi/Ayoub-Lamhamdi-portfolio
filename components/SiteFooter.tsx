import Link from "next/link";

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line/80">
      <div className="grid grid-cols-12 gap-6 px-edge py-16 md:py-24">
        <div className="col-span-12 md:col-span-6">
          <p className="display text-3xl md:text-4xl">
            Let&rsquo;s make something
            <br />
            <em className="font-light">worth watching.</em>
          </p>
          <Link
            href="mailto:lamhamdiayoub36@gmail.com"
            className="mt-8 inline-block text-lg underline decoration-bone/30 underline-offset-8 transition-colors hover:decoration-bone"
          >
            lamhamdiayoub36@gmail.com
          </Link>
          <Link
            href="tel:+212689616143"
            className="mt-3 block text-lg underline decoration-bone/30 underline-offset-8 transition-colors hover:decoration-bone"
          >
            +212 689-616143
          </Link>
        </div>
        <div className="col-span-6 md:col-span-3 md:col-start-8">
          <p className="label text-bone/50">Elsewhere</p>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a href="https://www.instagram.com/ayoublamhamdi/" target="_blank" rel="noreferrer" className="hover:text-bone">
                Instagram
              </a>
            </li>
            <li>
              <a href="https://vimeo.com/ayoublamhamdi" target="_blank" rel="noreferrer" className="hover:text-bone">
                Vimeo
              </a>
            </li>
          </ul>
        </div>
        <div className="col-span-6 md:col-span-3">
          <p className="label text-bone/50">Based</p>
          <p className="mt-4 text-sm">Casablanca, Morocco</p>
          <p className="text-sm text-bone/60">Working worldwide</p>
        </div>
      </div>
      <div className="flex items-center justify-between border-t border-line/80 px-edge py-6 text-xs text-bone/50">
        <span>© {year} Ayoub Lamhamdi. All rights reserved.</span>
        <span className="label">{year}</span>
      </div>
    </footer>
  );
}
