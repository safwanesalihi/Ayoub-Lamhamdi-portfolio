import raw from "./projects.json";

export type ProjectRole = "Director" | "DP" | "Director & DP";
export type ProjectFormat = "film" | "reel";

export type Project = {
  slug: string;
  client: string;
  title: string;
  year: number;
  role: ProjectRole;
  format: ProjectFormat;
  vimeoId: string;
  layout: "full" | "wide" | "half" | "offset";
  blurb?: string;
  credits?: Record<string, string>;
};

export const heroVimeoId: string = raw.heroVimeoId;
export const films = raw.films as Project[];
export const reels = raw.reels as Project[];
export const allProjects: Project[] = [...films, ...reels];
export const clients: string[] = raw.clients;
