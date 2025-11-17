"use client";

import { Sparkles, Video } from "lucide-react";
import { Caption, CaptionStyle } from "@/lib/types";
import VideoPreview from "@/components/VideoPreview";

interface VideoPreviewSectionProps {
  videoUrl: string;
  captions: Caption[];
  style: CaptionStyle;
}

export default function VideoPreviewSection({
  videoUrl,
  captions,
  style,
}: VideoPreviewSectionProps) {
  return (
    <div className="lg:sticky lg:top-8 h-fit mt-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>

        {!videoUrl ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <Video className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">Upload a video to see the preview</p>
          </div>
        ) : captions.length === 0 ? (
          <div className="bg-gray-100 rounded-lg p-12 text-center">
            <Sparkles className="mx-auto text-gray-400 mb-3" size={48} />
            <p className="text-gray-500">
              Generate captions to see them on your video
            </p>
          </div>
        ) : (
          <VideoPreview videoUrl={videoUrl} captions={captions} style={style} />
        )}
      </div>
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">
          💡 Hinglish Support
        </h3>
        <p className="text-sm text-blue-800">
          This platform fully supports mixed Hindi (Devanagari) and English text
          using Noto Sans fonts for perfect rendering.
        </p>
      </div>
    </div>
  );
}
