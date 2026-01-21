import {
  getHackathonJudges,
  getAvailableParticipantsForJudge,
} from "@/app/actions/hackathons";
import { JudgesClient } from "./judges-client";

interface JudgesPageProps {
  params: Promise<{ id: string }>;
}

export default async function JudgesPage({ params }: JudgesPageProps) {
  const { id } = await params;
  const [judges, availableParticipants] = await Promise.all([
    getHackathonJudges(id),
    getAvailableParticipantsForJudge(id),
  ]);

  return (
    <JudgesClient
      hackathonId={id}
      judges={judges}
      availableParticipants={availableParticipants}
    />
  );
}
