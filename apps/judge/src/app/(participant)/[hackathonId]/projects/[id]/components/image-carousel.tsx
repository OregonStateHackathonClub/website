"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ImageCarouselProps {
  imageUrls: string[];
  altText: string;
  videoUrl?: string | null;
}

function getYouTubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1);
    }
    if (
      parsed.hostname === "www.youtube.com" ||
      parsed.hostname === "youtube.com"
    ) {
      return parsed.searchParams.get("v");
    }
  } catch {
    return null;
  }
  return null;
}

export function ImageCarousel({
  imageUrls,
  altText,
  videoUrl,
}: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const youtubeId = videoUrl ? getYouTubeId(videoUrl) : null;
  const hasVideo = !!youtubeId;
  const totalSlides = (hasVideo ? 1 : 0) + imageUrls.length;

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? totalSlides - 1 : prev - 1));
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev === totalSlides - 1 ? 0 : prev + 1));
  };

  if (totalSlides === 0) {
    return null;
  }

  const isVideoSlide = hasVideo && currentIndex === 0;
  const imageIndex = hasVideo ? currentIndex - 1 : currentIndex;

  return (
    <div className="relative aspect-video w-full">
      {isVideoSlide ? (
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}`}
          title="Project demo video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <Image
          quality={100}
          key={currentIndex}
          src={imageUrls[imageIndex]}
          alt={`${altText} ${imageIndex + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="animate-fade-in object-contain"
        />
      )}

      {totalSlides > 1 && (
        <>
          <button
            onClick={goToPrevious}
            type="button"
            className="-translate-y-1/2 absolute top-1/2 left-3 cursor-pointer border border-neutral-700 bg-black/50 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            className="-translate-y-1/2 absolute top-1/2 right-3 cursor-pointer border border-neutral-700 bg-black/50 p-1.5 text-white backdrop-blur transition hover:bg-black/75"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}

      {totalSlides > 1 && (
        <div className="-translate-x-1/2 absolute bottom-4 left-1/2 border border-neutral-700 bg-black/50 px-2.5 py-1 text-white text-xs backdrop-blur">
          {currentIndex + 1} / {totalSlides}
        </div>
      )}
    </div>
  );
}
