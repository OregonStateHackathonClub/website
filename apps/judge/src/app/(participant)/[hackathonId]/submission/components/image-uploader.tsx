"use client";

import { ArrowDown, ArrowUp, Loader2, Upload, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";

interface ImageUploaderProps {
  images: string[];
  maxImages?: number;
  isUploading: boolean;
  uploadProgress?: number;
  onUpload: (files: FileList) => void;
  onDelete: (url: string) => void;
  onReorder: (images: string[]) => void;
}

export function ImageUploader({
  images,
  maxImages = 10,
  isUploading,
  uploadProgress = 0,
  onUpload,
  onDelete,
  onReorder,
}: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...images];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);
    onReorder(reordered);
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const moveImage = (fromIndex: number, toIndex: number) => {
    const reordered = [...images];
    const [item] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, item);
    onReorder(reordered);
  };

  return (
    <div>
      <label className="mb-2 block text-sm text-neutral-400">
        Images ({images.length}/{maxImages})
      </label>
      <div
        className={`flex min-h-[120px] cursor-pointer flex-col items-center justify-center border-2 border-dashed border-neutral-800 bg-transparent p-6 transition-colors hover:border-neutral-700 ${
          isUploading ? "pointer-events-none" : ""
        }`}
        onClick={() => fileInputRef.current?.click()}
      >
        {isUploading ? (
          <>
            <Loader2 className="mb-2 h-8 w-8 animate-spin text-neutral-500" />
            <p className="text-sm text-neutral-400">
              Uploading... {uploadProgress}%
            </p>
            <div className="mt-3 h-1.5 w-48 overflow-hidden bg-neutral-800">
              <div
                className="h-full bg-white transition-all duration-200"
                style={{ width: `${uploadProgress}%` }}
              />
            </div>
          </>
        ) : (
          <>
            <Upload className="mb-2 h-8 w-8 text-neutral-500" />
            <p className="text-sm text-neutral-500">
              Click to upload or drag and drop
            </p>
            <p className="text-xs text-neutral-600">
              PNG, JPG, WEBP (max 5MB)
            </p>
          </>
        )}
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
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`group relative aspect-square border bg-neutral-900 ${
                dragOverIndex === index
                  ? "border-neutral-500"
                  : draggedIndex === index
                    ? "opacity-50 border-neutral-800"
                    : "cursor-grab border-neutral-800"
              }`}
            >
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                fill
                className="object-contain p-1"
              />
              <span className="absolute top-1 left-1 bg-black/70 px-1.5 py-0.5 text-xs text-neutral-400">
                {index + 1}
              </span>
              <div className="absolute top-1 right-1 flex gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                  className="bg-black/70 p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowUp className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1}
                  className="bg-black/70 p-1 text-neutral-400 hover:text-white disabled:opacity-30"
                >
                  <ArrowDown className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(url)}
                  className="bg-black/70 p-1 text-neutral-400 hover:text-red-400"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
