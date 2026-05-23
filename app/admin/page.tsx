import projectsData from "@/data/projects.json";
import { AdminClient } from "./_client";

export default function AdminPage() {
  return (
    <AdminClient
      films={projectsData.films}
      reels={projectsData.reels}
    />
  );
}
