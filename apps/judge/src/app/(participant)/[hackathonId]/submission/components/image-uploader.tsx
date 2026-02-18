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
  const draggedIndexRef = useRef<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    draggedIndexRef.current = index;
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndexRef.current === null || draggedIndexRef.current === index)
      return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    const fromIndex = draggedIndexRef.current;
    if (fromIndex === null || fromIndex === index) return;

    const reordered = [...images];
    const draggedItem = reordered[fromIndex];
    reordered.splice(fromIndex, 1);
    reordered.splice(index, 0, draggedItem);
    onReorder(reordered);
    draggedIndexRef.current = null;
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    draggedIndexRef.current = null;
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
        <div className="mt-4 space-y-2">
          {images.map((url, index) => (
            <div
              key={url}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 border border-neutral-800 bg-transparent p-2 ${
                dragOverIndex === index
                  ? "border-neutral-500"
                  : draggedIndexRef.current === index
                    ? "opacity-50"
                    : "cursor-grab"
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
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => moveImage(index, index - 1)}
                  disabled={index === 0}
                  className="p-1 text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:hover:text-neutral-500"
                >
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => moveImage(index, index + 1)}
                  disabled={index === images.length - 1}
                  className="p-1 text-neutral-500 hover:text-neutral-300 disabled:opacity-30 disabled:hover:text-neutral-500"
                >
                  <ArrowDown className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDelete(url)}
                  className="p-1 text-neutral-500 hover:text-red-400"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
