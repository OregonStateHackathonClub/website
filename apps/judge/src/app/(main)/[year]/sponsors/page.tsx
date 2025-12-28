import { prisma } from "@repo/database";
import { Card, CardContent, CardHeader, CardTitle } from "@repo/ui/components/card";

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

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sponsors.map((sponsor) => (
          <Card key={sponsor.id} className="overflow-hidden transition-all hover:shadow-lg">
            <div className="flex h-48 items-center justify-center bg-white p-6">
              {sponsor.logoUrl ? (
                <img
                  src={sponsor.logoUrl}
                  alt={sponsor.name}
                  className="max-h-full max-w-full object-contain"
                />
              ) : (
                <div className="text-xl font-bold text-gray-400">{sponsor.name}</div>
              )}
            </div>
            <CardHeader>
              <CardTitle>{sponsor.name}</CardTitle>
            </CardHeader>
            <CardContent>
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
