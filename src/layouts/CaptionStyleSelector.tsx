"use client";

import { CaptionStyle } from "@/lib/types";

interface CaptionStyleSelectorProps {
  selectedStyle: CaptionStyle;
  onStyleChange: (style: CaptionStyle) => void;
}

export default function CaptionStyleSelector({
  selectedStyle,
  onStyleChange,
}: CaptionStyleSelectorProps) {
  const styles: CaptionStyle[] = ["bottom-centered", "top-bar", "karaoke"];

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        3. Choose Caption Style
      </h2>
      <div className="flex flex-wrap gap-3">
        {styles.map((style) => (
          <button
            key={style}
            onClick={() => onStyleChange(style)}
            className={`px-4 py-2 rounded-lg font-medium border ${
              selectedStyle === style
                ? "bg-blue-600 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            {style.replace("-", " ")}
          </button>
        ))}
      </div>
    </div>
  );
}
