import type { Metadata } from "next";
import { LifeApp } from "./LifeApp";

export const metadata: Metadata = {
  title: "Life — Daily tracker",
  description: "Salat, gym, makla w productivity — kol nhar.",
  robots: { index: false, follow: false },
};

export default function LifePage() {
  return <LifeApp />;
}
