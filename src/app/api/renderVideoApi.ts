import { Caption, CaptionStyle } from "@/lib/types";

export async function renderVideo(
  videoUrl: string,
  captions: Caption[],
  style: CaptionStyle
) {
  const res = await fetch("/api/render-video", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl, captions, style }),
  });
  const data = await res.json();
  if (!data.success) throw new Error("Render failed");
  return data.url;
}
