"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteNav() {
  const pathname = usePathname();
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-50">
      <nav className="pointer-events-auto flex items-center justify-between px-edge pt-6 mix-blend-difference">
        <Link href="/" className="label text-bone" aria-label="Home — Ayoub Lamhamdi">
          Ayoub&nbsp;Lamhamdi
        </Link>
        <ul className="flex items-center gap-5 md:gap-7">
          {items.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`label transition-opacity duration-400 ease-cinema ${
                    isActive ? "text-bone" : "text-bone/60 hover:text-bone"
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </header>
  );
}
