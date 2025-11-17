"use client";

import { useState } from "react";
import CaptionStyleSelector from "@/layouts/CaptionStyleSelector";
import VideoPreviewSection from "@/layouts/VideoPreviewSection";
import ExportVideo from "@/layouts/ExportVideo";
import { Caption, CaptionStyle } from "@/lib/types";
import { uploadVideo } from "@/app/api/uploadApi";
import { generateCaptions } from "@/app/api/generateCaptionsApi";
import { renderVideo } from "@/app/api/renderVideoApi";
import VideoUpload from "./VideoUpload";
import CaptionGenerator from "./CaptionGenerator";

export default function MainLayout() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [selectedStyle, setSelectedStyle] =
    useState<CaptionStyle>("bottom-centered");
  const [isUploading, setIsUploading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRendering, setIsRendering] = useState(false);
  const [renderedVideoUrl, setRenderedVideoUrl] = useState("");

  const handleFileSelect = async (file: File | null) => {
    if (!file) {
      setSelectedFile(null);
      setVideoUrl("");
      setCaptions([]);
      setRenderedVideoUrl("");
      return;
    }

    setSelectedFile(file);
    setIsUploading(true);
    setCaptions([]);
    setRenderedVideoUrl("");

    try {
      const url = await uploadVideo(file);
      setVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to upload video");
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateCaptions = async () => {
    if (!videoUrl) return;
    setIsGenerating(true);
    try {
      const data = await generateCaptions(videoUrl);
      setCaptions(data);
    } catch (err) {
      console.error(err);
      alert("Failed to generate captions");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportVideo = async () => {
    if (!videoUrl || captions.length === 0) return;
    setIsRendering(true);
    try {
      const url = await renderVideo(videoUrl, captions, selectedStyle);
      setRenderedVideoUrl(url);
    } catch (err) {
      console.error(err);
      alert("Failed to render video");
    } finally {
      setIsRendering(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient from-gray-50 to-gray-100">
      <VideoUpload
        selectedFile={selectedFile}
        onFileSelect={handleFileSelect}
        isUploading={isUploading}
      />
      {videoUrl && (
        <>
          <CaptionGenerator
            captions={captions}
            isGenerating={isGenerating}
            onGenerate={handleGenerateCaptions}
          />
          <CaptionStyleSelector
            selectedStyle={selectedStyle}
            onStyleChange={setSelectedStyle}
          />
          <ExportVideo
            videoUrl={videoUrl}
            captions={captions}
            style={selectedStyle}
            isRendering={isRendering}
            onExport={handleExportVideo}
            renderedVideoUrl={renderedVideoUrl}
          />
          <VideoPreviewSection
            videoUrl={videoUrl}
            captions={captions}
            style={selectedStyle}
          />
        </>
      )}
    </div>
  );
}
