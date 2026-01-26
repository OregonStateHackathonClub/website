import { getHackathonJudges } from "@/app/actions/hackathons";
import { JudgesTable } from "./components/table";

interface JudgesPageProps {
  params: Promise<{ id: string }>;
}

export default async function JudgesPage({ params }: JudgesPageProps) {
  const { id } = await params;
  const judges = await getHackathonJudges(id);

  return <JudgesTable hackathonId={id} judges={judges} />;
}
