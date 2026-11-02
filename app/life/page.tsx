import type { Metadata } from "next";
import { LifeApp } from "./LifeApp";
import "./life.css";

export const metadata: Metadata = {
  title: "Life — Daily tracker",
  description: "Prayer, training, nutrition and productivity — every day.",
  robots: { index: false, follow: false },
};

export default function LifePage() {
  return <LifeApp />;
}
