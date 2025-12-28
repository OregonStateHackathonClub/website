import { prisma } from "@repo/database";
import { Button } from "@repo/ui/components/button";
import { Input } from "@repo/ui/components/input";
import { Label } from "@repo/ui/components/label";
import { revalidatePath } from "next/cache";

export default async function SponsorsAdminPage(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const hackathonId = params.year;

  // Server Action to create a sponsor
  async function createSponsor(formData: FormData) {
    "use server";
    
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;
    const websiteUrl = formData.get("websiteUrl") as string;
    const logoUrl = formData.get("logoUrl") as string;

    if (!name || !hackathonId) return;

    await prisma.sponsor.create({
      data: {
        name,
        description,
        websiteUrl,
        logoUrl: logoUrl || "",
        hackathonId: hackathonId,
      },
    });

    revalidatePath(`/console/${hackathonId}/sponsors`);
  }

  // Fetch existing sponsors
  const sponsors = await prisma.sponsor.findMany({
    where: { hackathonId },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8 p-8">
      <div>
        <h1 className="text-2xl font-bold">Manage Sponsors</h1>
        <p className="text-muted-foreground">Add and remove sponsors for this hackathon.</p>
      </div>

      {/* Create Sponsor Form */}
      <div className="rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Add New Sponsor</h2>
        <form action={createSponsor} className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" placeholder="Sponsor Name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="websiteUrl">Website URL</Label>
              <Input id="websiteUrl" name="websiteUrl" placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="logoUrl">Logo URL</Label>
              <Input id="logoUrl" name="logoUrl" placeholder="https://..." required />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input id="description" name="description" placeholder="Short description" />
          </div>
          <Button type="submit">Add Sponsor</Button>
        </form>
      </div>

      {/* Sponsors List */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Current Sponsors</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sponsors.map((sponsor) => (
            <div key={sponsor.id} className="rounded-lg border p-4">
              <div className="mb-2 flex items-center justify-between">
                <h3 className="font-semibold">{sponsor.name}</h3>
              </div>
              {sponsor.logoUrl && (
                <img 
                  src={sponsor.logoUrl} 
                  alt={sponsor.name} 
                  className="mb-2 h-12 object-contain" 
                />
              )}
              <p className="text-sm text-muted-foreground">{sponsor.description}</p>
              {sponsor.websiteUrl && (
                <a 
                  href={sponsor.websiteUrl} 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-2 block text-sm text-blue-500 hover:underline"
                >
                  Visit Website
                </a>
              )}
            </div>
          ))}
          {sponsors.length === 0 && (
            <p className="text-muted-foreground">No sponsors added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
