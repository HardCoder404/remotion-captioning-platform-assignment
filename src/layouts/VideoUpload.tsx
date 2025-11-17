"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import FileUpload from "@/components/FileUpload";

interface VideoUploadProps {
  selectedFile: File | null;
  onFileSelect: (file: File | null) => void | Promise<void>;
  isUploading: boolean;
}

export default function VideoUpload({
  selectedFile,
  onFileSelect,
  isUploading,
}: VideoUploadProps) {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          1. Upload Video
        </h2>
        {isUploading ? (
          <LoadingSpinner message="Uploading video..." />
        ) : (
          <FileUpload
            onFileSelect={onFileSelect}
            selectedFile={selectedFile}
            onClear={() => onFileSelect(null)}
          />
        )}
      </div>
    </div>
  );
}
