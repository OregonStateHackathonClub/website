import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";
import Image from "next/image";

export default async function SponsorsPage(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const hackathonId = params.year;

  const sponsors = await prisma.sponsor.findMany({
    where: { hackathonId },
    orderBy: { id: "asc" },
  });

  if (sponsors.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-12 text-center">
        <h1 className="text-3xl font-bold">Our Sponsors</h1>
        <p className="mt-4 text-muted-foreground">Sponsors coming soon!</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="mb-12 text-center">
        <h1 className="text-4xl font-bold tracking-tight">Our Sponsors</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Thank you to these amazing organizations for supporting us.
        </p>
      </div>

      <div className="flex flex-wrap gap-8 justify-center">
        {sponsors.map((sponsor) => (
          <Card 
            key={sponsor.id} 
            // 1. p-0: Remove any default padding from the card root so the image hits the edge
            // 2. border-0: Optional, if you want the image to define the top edge completely
            className="overflow-hidden transition-all hover:shadow-lg p-0 w-full max-w-xs" 
          >
            <div className="relative flex h-48 w-full items-center justify-center bg-white p-6">
              {sponsor.logoUrl ? (
                <Image
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  fill
                  className="object-contain p-6"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl font-bold text-gray-400">
                  {sponsor.name}
                </div>
              )}
            </div>
            
            {/* Add padding back to the header and content since we removed it from the root */}
            <CardHeader className="p-6 pb-2">
              <CardTitle className="text-xl">{sponsor.name}</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <p className="mb-4 text-sm text-muted-foreground">
                {sponsor.description}
              </p>
              {sponsor.websiteUrl && (
                <a
                  href={sponsor.websiteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Visit Website →
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}