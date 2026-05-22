import { NextResponse } from "next/server";
import { fetchVimeoVideo, fetchVimeoVideos } from "@/lib/vimeo";

// GET /api/vimeo?id=VIDEO_ID         → single video
// GET /api/vimeo?ids=ID1,ID2,ID3     → multiple videos
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const ids = searchParams.get("ids");

  try {
    if (id) {
      const video = await fetchVimeoVideo(id);
      return NextResponse.json(video);
    }

    if (ids) {
      const list = ids.split(",").map((s) => s.trim()).filter(Boolean);
      if (list.length === 0) return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
      const videos = await fetchVimeoVideos(list);
      return NextResponse.json(videos);
    }

    return NextResponse.json({ error: "Provide ?id= or ?ids= query param" }, { status: 400 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("404") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
