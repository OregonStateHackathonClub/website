"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageCarouselProps {
  imageUrls: string[];
  altText: string;
}

export function ImageCarousel({ imageUrls, altText }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? imageUrls.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === imageUrls.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  if (!imageUrls || imageUrls.length === 0) {
    return null;
  }

  return (
    <div className="relative aspect-video w-full">
      <Image
        quality={100}
        key={currentIndex}
        src={imageUrls[currentIndex]}
        alt={`${altText} ${currentIndex + 1}`}
        fill
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        className="animate-fade-in object-cover"
      />

      {/* Navigation buttons */}
      {imageUrls.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            type="button"
            className="-translate-y-1/2 absolute top-1/2 left-3 cursor-pointer rounded-full border border-neutral-700 bg-black/50 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
            aria-label="Previous image"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="-translate-y-1/2 absolute top-1/2 right-3 cursor-pointer rounded-full border border-neutral-700 bg-black/50 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
            aria-label="Next image"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {/* "X / Y" indicator */}
      {imageUrls.length > 1 && (
        <div className="-translate-x-1/2 absolute bottom-4 left-1/2 rounded-full border border-neutral-700 bg-black/50 px-2.5 py-1 text-white text-xs backdrop-blur">
          {currentIndex + 1} / {imageUrls.length}
        </div>
      )}
    </div>
  );
}
