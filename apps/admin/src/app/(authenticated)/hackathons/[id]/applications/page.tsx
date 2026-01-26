import { getHackathonApplications } from "@/app/actions/hackathons";
import { ApplicationsTable } from "./components/table";

interface ApplicationsPageProps {
  params: Promise<{ id: string }>;
}

export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
  const { id } = await params;
  const applications = await getHackathonApplications(id);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Applications</h2>
          <p className="text-sm text-neutral-500">
            {applications.length} applications for this hackathon
          </p>
        </div>
      </div>

      <ApplicationsTable applications={applications} hackathonId={id} />
    </div>
  );
}
