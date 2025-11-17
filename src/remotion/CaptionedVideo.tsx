import { AbsoluteFill, Html5Video, staticFile } from "remotion";
import { Caption } from "./Caption";
import { Caption as CaptionType, CaptionStyle } from "@/lib/types";

interface CaptionedVideoProps {
  videoUrl: string;
  captions: CaptionType[];
  style: CaptionStyle;
}

export const CaptionedVideo: React.FC<CaptionedVideoProps> = ({
  videoUrl,
  captions,
  style,
}) => {

  const filename = videoUrl.split(/[\\/]/).pop() || "";
  const videoSrc = staticFile(`uploads/${filename}`);

  return (
    <AbsoluteFill>
      <AbsoluteFill>
        <Html5Video
          src={videoSrc}
          style={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      </AbsoluteFill>
      <AbsoluteFill>
        {captions.map((caption) => (
          <Caption key={caption.id} caption={caption} style={style} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
