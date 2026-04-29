export type SponsorTier = 1 | 2 | 4;

export type Sponsor = {
  name: string;
  logo: string;
  url: string;
  tier: SponsorTier;
};

export const sponsors: Sponsor[] = [
  // Tier 1 — Headline
  {
    name: "NVIDIA",
    logo: "/nvidia-logo.png",
    url: "https://nvidia.com",
    tier: 1,
  },
  {
    name: "Google",
    logo: "/google-logo.png",
    url: "https://developers.google.com/",
    tier: 1,
  },
  // Tier 2 — Major
  {
    name: "Mark III Systems",
    logo: "/markiii-logo.png",
    url: "https://www.markiiisys.com",
    tier: 2,
  },
  {
    name: "Trimble",
    logo: "/trimble-logo.png",
    url: "https://trimble.com",
    tier: 2,
  },
  {
    name: "ConductorOne",
    logo: "/c1-logo.png",
    url: "https://www.c1.ai/",
    tier: 2,
  },
];
