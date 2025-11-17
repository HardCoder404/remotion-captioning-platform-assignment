export async function generateCaptions(videoUrl: string) {
  const res = await fetch("/api/generate-captions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ videoUrl }),
  });
  const data = await res.json();
  if (!data.success) throw new Error("Caption generation failed");
  return data.captions;
}
