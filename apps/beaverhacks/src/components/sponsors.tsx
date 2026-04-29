import { type Sponsor, type SponsorTier, sponsors } from "@/lib/sponsors";

const TIER_ORDER: SponsorTier[] = [1, 2, 4];

const TIER_STYLES: Record<
  SponsorTier,
  { box: string; logoBox: string; label: string }
> = {
  1: {
    box: "p-6",
    logoBox: "w-60 h-[88px]",
    label: "text-sm",
  },
  2: {
    box: "p-4",
    logoBox: "w-44 h-[62px]",
    label: "text-xs",
  },
  4: {
    box: "p-3",
    logoBox: "w-32 h-[44px]",
    label: "text-[10px]",
  },
};

function SponsorCard({ sponsor }: { sponsor: Sponsor }) {
  const style = TIER_STYLES[sponsor.tier];
  return (
    <a
      href={sponsor.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex flex-col items-center gap-3 border border-amber-muted/30 bg-[#1a0f00] hover:border-amber-bright/50 transition-all ${style.box}`}
    >
      <div className={`flex items-center justify-center p-2 ${style.logoBox}`}>
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
      <span
        className={`text-amber-dim group-hover:text-amber-bright transition-colors ${style.label}`}
      >
        {sponsor.name}
      </span>
    </a>
  );
}

export const Sponsors = () => (
  <div className="font-secondary text-center h-full overflow-y-auto scrollbar-hide">
    <h2 className="text-amber-bright text-glow-base text-2xl mb-8">
      [ SPONSORS ]
    </h2>
    <div className="flex flex-col items-center gap-8">
      {TIER_ORDER.map((tier) => {
        const tierSponsors = sponsors.filter((s) => s.tier === tier);
        if (tierSponsors.length === 0) return null;
        return (
          <div
            key={tier}
            className="flex flex-wrap justify-center gap-6"
          >
            {tierSponsors.map((sponsor) => (
              <SponsorCard key={sponsor.name} sponsor={sponsor} />
            ))}
          </div>
        );
      })}
    </div>
  </div>
);
