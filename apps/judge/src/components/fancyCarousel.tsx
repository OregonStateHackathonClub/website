"use client";

import React, { useRef, useEffect } from "react";
import { Carousel } from "@fancyapps/ui";
import "@fancyapps/ui/dist/carousel/carousel.css";
// import { Autoplay } from "@fancyapps/ui/dist/carousel/carousel.autoplay.esm.js";
// import "@fancyapps/ui/dist/carousel/carousel.autoplay.css"; 

import Image from "next/image";

interface FancyCarouselProps {
    imageUrls: string[];
    altText: string;
}

export function FancyCarousel({ imageUrls, altText }: FancyCarouselProps) {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Initialize Carousel
        // The Carousel class handles the mounting to the container.
        type CarouselCtor = new (el: HTMLElement, options?: any) => { destroy: () => void };
        const CarouselClass = Carousel as unknown as CarouselCtor;

        const instance = new CarouselClass(container, {
            infinite: false,
            Dots: true,
            Navigation: true,
            // Autoplay: {
            //     timeout: 3000,
            // },
        });

        // Cleanup on unmount to prevent memory leaks
        return () => {
            instance.destroy();
        };
    }, [imageUrls]); 

    return (
        <div className="f-carousel h-full w-full" ref={containerRef}>
            <div className="f-carousel__viewport h-full w-full">
                <div className="f-carousel__track h-full">
                    {imageUrls.map((url, index) => (
                        <div key={index} className="f-carousel__slide h-full w-full flex items-center justify-center bg-neutral-900">
                            <div className="relative h-full w-full">
                                <Image
                                    src={url}
                                    alt={`${altText} ${index + 1}`}
                                    fill
                                    className="object-cover"
                                    priority={index === 0}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}