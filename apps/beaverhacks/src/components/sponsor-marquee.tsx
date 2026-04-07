"use client";

import { sponsors } from "@/lib/sponsors";

const BadgeList = () => (
  <div className="flex gap-2 shrink-0">
    {sponsors.map((sponsor) => (
      <a
        href={sponsor.url}
        target="_blank"
        key={sponsor.name}
        className="shrink-0 w-[88px] h-[31px] border border-amber-muted/40 bg-[#1a0f00] flex items-center justify-center p-1"
        title={sponsor.name}
      >
        <img
          src={sponsor.logo}
          alt={sponsor.name}
          className="max-w-full max-h-full object-contain"
          style={{
            filter:
              "brightness(0) invert(0.75) sepia(1) saturate(5) hue-rotate(345deg)",
          }}
        />
      </a>
    ))}
  </div>
);

export const SponsorMarquee = () => (
  <div className="overflow-hidden">
    <div className="flex gap-2 animate-marquee w-fit">
      <BadgeList />
      <BadgeList />
    </div>
  </div>
);
