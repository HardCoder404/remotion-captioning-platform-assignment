"use client";

import { Download } from "lucide-react";
import { Caption, CaptionStyle } from "@/lib/types";

interface ExportVideoProps {
  videoUrl: string;
  captions: Caption[];
  style: CaptionStyle;
  isRendering: boolean;
  onExport: () => void;
  renderedVideoUrl: string;
}

export default function ExportVideo({
  isRendering,
  onExport,
  renderedVideoUrl,
}: ExportVideoProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        4. Export Video
      </h2>
      {isRendering ? (
        <p>Rendering video... This may take a few minutes.</p>
      ) : (
        <button
          onClick={onExport}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          <Download size={20} />
          Export Captioned Video
        </button>
      )}
      {renderedVideoUrl && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4">
          <p className="text-green-800 font-medium">
            ✓ Video exported successfully!
          </p>
          <p className="text-sm text-green-600 mt-1">
            Your video has been downloaded automatically.
          </p>
        </div>
      )}
      <p className="text-sm text-gray-500 text-center mt-2">
        Note: Rendering may take 2-5 minutes depending on video length
      </p>
    </div>
  );
}
