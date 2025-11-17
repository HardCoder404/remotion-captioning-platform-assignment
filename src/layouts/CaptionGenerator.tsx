"use client";

import { Caption } from "@/lib/types";
import { Sparkles } from "lucide-react";

interface CaptionGeneratorProps {
  captions: Caption[];
  isGenerating: boolean;
  onGenerate: () => void;
}

export default function CaptionGenerator({
  captions,
  isGenerating,
  onGenerate,
}: CaptionGeneratorProps) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        2. Generate Captions
      </h2>
      {isGenerating ? (
        <p>Generating captions with AI...</p>
      ) : (
        <div className="space-y-4">
          <button
            onClick={onGenerate}
            disabled={captions.length > 0}
            className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              captions.length > 0
                ? "bg-green-100 text-green-700 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            <Sparkles size={20} />
            {captions.length > 0
              ? "Captions Generated ✓"
              : "Auto-generate Captions"}
          </button>

          {captions.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Generated {captions.length} caption
                {captions.length !== 1 ? "s" : ""}
              </p>
              <div className="max-h-40 overflow-y-auto space-y-2">
                {captions.slice(0, 3).map((caption) => (
                  <div
                    key={caption.id}
                    className="text-sm text-gray-600 bg-white p-2 rounded"
                  >
                    {caption.text}
                  </div>
                ))}
                {captions.length > 3 && (
                  <p className="text-sm text-gray-500 italic">
                    ...and {captions.length - 3} more
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
