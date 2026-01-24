"use client";

import { Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  images: string[];
  maxImages?: number;
  isUploading: boolean;
  onUpload: (files: FileList) => void;
  onDelete: (url: string) => void;
  onReorder: (images: string[]) => void;
}

export function ImageUploader({
  images,
  maxImages = 5,
  isUploading,
  onUpload,
  onDelete,
  onReorder,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...images];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    onReorder(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  return (
    <div>
      <label className="mb-2 block text-sm text-neutral-400">
        Images ({images.length}/{maxImages})
      </label>
      <div
        className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-neutral-800 bg-neutral-900/50 p-6 transition-colors hover:border-neutral-700 ${
          isUploading ? "opacity-50" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="mb-2 h-8 w-8 text-neutral-500" />
        <p className="text-sm text-neutral-500">
          Click to upload or drag and drop
        </p>
        <p className="text-xs text-neutral-600">PNG, JPG, WEBP (max 5MB)</p>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && onUpload(e.target.files)}
          disabled={isUploading}
        />
      </div>

      {images.length > 0 && (
        <div className="mt-4 space-y-2">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 border border-neutral-800 bg-neutral-900/50 p-2 ${
                draggedIndex === index ? "opacity-50" : "cursor-grab"
              }`}
            >
              <span className="w-6 text-center text-sm text-neutral-500">
                {index + 1}
              </span>
              <div className="relative h-16 w-24 overflow-hidden bg-black">
                <Image
                  src={url}
                  alt={`Image ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
              <span className="flex-1 truncate text-sm text-neutral-400">
                Image {index + 1}
              </span>
              <button
                type="button"
                onClick={() => onDelete(url)}
                className="p-1 text-neutral-500 hover:text-red-400"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
