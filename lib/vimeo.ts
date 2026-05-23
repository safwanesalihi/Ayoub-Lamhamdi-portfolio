export type VimeoVideo = {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail: string;
  embedUrl: string;
  width: number;
  height: number;
};

type OEmbedResponse = {
  title: string;
  description: string;
  duration: number;
  thumbnail_url: string;
  width: number;
  height: number;
};

export async function fetchVimeoVideo(videoId: string, width = 1280): Promise<VimeoVideo> {
  const url = `https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=${width}`;

  const res = await fetch(url, { next: { revalidate: 86400 } });

  if (!res.ok) throw new Error(`Vimeo oEmbed error ${res.status} for video ${videoId}`);

  const data: OEmbedResponse = await res.json();

  return {
    id: videoId,
    title: data.title,
    description: data.description ?? "",
    duration: data.duration,
    thumbnail: data.thumbnail_url,
    embedUrl: `https://player.vimeo.com/video/${videoId}?autoplay=0&loop=0&title=0&byline=0&portrait=0&color=ffffff`,
    width: data.width,
    height: data.height,
  };
}

export async function fetchVimeoVideos(videoIds: string[]): Promise<VimeoVideo[]> {
  return Promise.all(videoIds.map(fetchVimeoVideo));
}

/** Returns a map of vimeoId → thumbnail URL. Failed fetches are silently skipped. */
export async function fetchThumbnailMap(videoIds: string[]): Promise<Record<string, string>> {
  const results = await Promise.allSettled(videoIds.map((id) => fetchVimeoVideo(id, 640)));
  const map: Record<string, string> = {};
  results.forEach((result, i) => {
    if (result.status === "fulfilled") map[videoIds[i]] = result.value.thumbnail;
  });
  return map;
}
