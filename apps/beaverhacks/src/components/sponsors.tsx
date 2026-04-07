import { sponsors } from "@/lib/sponsors";

export const Sponsors = () => (
  <div className="font-secondary text-center h-full overflow-y-auto scrollbar-hide">
    <h2 className="text-amber-bright text-glow-base text-2xl mb-8">
      [ SPONSORS ]
    </h2>
    <div className="flex flex-wrap justify-center gap-6">
      {sponsors.map((sponsor) => (
        <a
          key={sponsor.name}
          href={sponsor.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col items-center gap-3 border border-amber-muted/30 bg-[#1a0f00] p-4 hover:border-amber-bright/50 transition-all"
        >
          <div className="w-44 h-[62px] flex items-center justify-center p-2">
            <img
              src={sponsor.logo}
              alt={sponsor.name}
              className="max-w-full max-h-full object-contain"
              style={{
                filter:
                  "brightness(0) invert(0.75) sepia(1) saturate(5) hue-rotate(345deg)",
              }}
            />
          </div>
          <span className="text-amber-dim text-xs group-hover:text-amber-bright transition-colors">
            {sponsor.name}
          </span>
        </a>
      ))}
    </div>
  </div>
);
