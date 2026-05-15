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
  /** Vimeo CDN thumbnail — used as poster before the player loads. */
  poster: string;
  /** Layout hint for the asymmetric work grid (films only). */
  layout: "full" | "wide" | "half" | "offset";
  blurb?: string;
  credits?: Record<string, string>;
};

export const films: Project[] = [
  {
    slug: "katewka3-bahat-ep04",
    client: "2M TV",
    title: "Katewka3 Bahat — EP04",
    year: 2024,
    role: "Director & DP",
    format: "film",
    vimeoId: "1043106925",
    poster:
      "https://i.vimeocdn.com/video/1966237447-97ce7784906fd8051b078a9c1b2edced76dc1f7d8e443017a7b4f5fc3c84f667-d_1280?region=us",
    layout: "full",
    blurb: "Episode 4 of the comedy series Katewka3 Bahat — shot for 2M TV.",
  },
  {
    slug: "micro-brottoire-ep06",
    client: "2M TV",
    title: "Micro Brottoire — EP06",
    year: 2024,
    role: "Director & DP",
    format: "film",
    vimeoId: "1039665387",
    poster:
      "https://i.vimeocdn.com/video/1962084631-75d6e1d4aaeb8d9a29c1326d3a601dbdf2566f0ee4f22243f41915d569886cb7-d_1280?region=us",
    layout: "half",
    blurb: "Street interview segment — Episode 6 for 2M TV.",
  },
  {
    slug: "katewka3-bahat-ep06",
    client: "2M TV",
    title: "Katewka3 Bahat — EP06",
    year: 2024,
    role: "Director & DP",
    format: "film",
    vimeoId: "1039382427",
    poster:
      "https://i.vimeocdn.com/video/1961750267-a16550250cb07851ab95dee0c092c7b7775748e4f69f0990f3f0337e9be83472-d_1280?region=us",
    layout: "offset",
    blurb: "Episode 6 of the hit comedy series — shot for 2M TV.",
  },
  {
    slug: "olla",
    client: "Independent",
    title: "Olla",
    year: 2023,
    role: "Director & DP",
    format: "film",
    vimeoId: "917310792",
    poster:
      "https://i.vimeocdn.com/video/1805557413-968162f5ff2291b0d4a80f8b9f7ab27ed589a641de5e10614c03bad0708f9eaf-d_1280?region=us",
    layout: "wide",
    blurb: "An independent short film.",
  },
  {
    slug: "hayati-nouman-belayyachi",
    client: "Nouman Belayyachi",
    title: "Hayati",
    year: 2023,
    role: "Director & DP",
    format: "film",
    vimeoId: "897142646",
    poster:
      "https://i.vimeocdn.com/video/1772794889-a4d336774b4f2bc329a0f24545080ddebee3fd09a34d393d9ff39d24c9915b79-d_1280?region=us",
    layout: "half",
    blurb: "Music video for Nouman Belayyachi.",
  },
  {
    slug: "jobup",
    client: "Jobup",
    title: "Jobup App",
    year: 2023,
    role: "Director & DP",
    format: "film",
    vimeoId: "893024413",
    poster:
      "https://i.vimeocdn.com/video/1766548912-2e448586d60512dd78a84724a4d2b9ffd05d08ff328e2f996d6ee22d3536315f-d_1280?region=us",
    layout: "full",
    blurb: "Brand film for the Jobup recruitment app.",
  },
  {
    slug: "kfc-maroc",
    client: "KFC Maroc",
    title: "KFC Maroc",
    year: 2023,
    role: "Director & DP",
    format: "film",
    vimeoId: "834402092",
    poster:
      "https://i.vimeocdn.com/video/1681257504-a6d2b61e083a239625683a186ff49b37340f178009d7cbae99910ac9e74c1480-d_1280?region=us",
    layout: "wide",
    blurb: "Commercial for KFC Maroc.",
  },
];

export const reels: Project[] = [
  {
    slug: "dounia-boutazot-mzia",
    client: "Mzia",
    title: "Dounia Boutazot x Mzia",
    year: 2025,
    role: "Director & DP",
    format: "reel",
    vimeoId: "1188713351",
    poster:
      "https://i.vimeocdn.com/video/2153050567-26978af27eacc5c23d99b0cf89e33810c6fbf9d7dd1ebcce1544c557f13fc2d3-d_1280?region=us",
    layout: "half",
  },
  {
    slug: "sketchosi9a-soho-snacks",
    client: "Soho Snacks",
    title: "Sketchosi9a x Soho Snacks",
    year: 2025,
    role: "Director & DP",
    format: "reel",
    vimeoId: "1188628037",
    poster:
      "https://i.vimeocdn.com/video/2152946663-81a3545782857a4c5e978c1c6a25f4e9448301e1a4e4def251c3e46ed7c1b125-d_1280?region=us",
    layout: "half",
  },
  {
    slug: "raja-club-athletic",
    client: "Raja Club Athletic",
    title: "Raja Club Athletic",
    year: 2025,
    role: "Director & DP",
    format: "reel",
    vimeoId: "1188627962",
    poster:
      "https://i.vimeocdn.com/video/2152946532-b72944c77cb1d492d2a5e859091d99c446f5bb1385b11eac01d9b6c932e6f4a7-d_1280?region=us",
    layout: "half",
  },
  {
    slug: "samsung-maroc",
    client: "Samsung Maroc",
    title: "Samsung Maroc",
    year: 2023,
    role: "Director & DP",
    format: "reel",
    vimeoId: "892951390",
    poster:
      "https://i.vimeocdn.com/video/1766396495-153e0852d58fa1038249a00dd6a020176e5fb54850e414b46319aea4a9536d97-d_1280?region=us",
    layout: "half",
  },
  {
    slug: "mcdonalds-maroc",
    client: "McDonald's Maroc",
    title: "McDonald's Maroc",
    year: 2023,
    role: "Director & DP",
    format: "reel",
    vimeoId: "852855706",
    poster:
      "https://i.vimeocdn.com/video/1708156961-c28a0d6cae4c656a8892baaae1d1b9c6c577bcf42eec854a4685756889f666b2-d_1280?region=us",
    layout: "half",
  },
  {
    slug: "tobigo-ayoub-idri",
    client: "Tobigo",
    title: "Tobigo x Ayoub Idri",
    year: 2023,
    role: "Director & DP",
    format: "reel",
    vimeoId: "837356237",
    poster:
      "https://i.vimeocdn.com/video/1685781950-0853fb45db80313c083501412bfbabb9b20917e2f05b7c800bf9cbc8b94787d2-d_1280?region=us",
    layout: "half",
  },
];

/** All projects combined — used for the detail page lookup. */
export const allProjects: Project[] = [...films, ...reels];

export const clients = [
  "2m tv",
  "kfc maroc",
  "samsung maroc",
  "mcdonald's maroc",
  "jobup",
  "raja club athletic",
  "soho snacks",
  "mzia",
];
