// shows all submissions, unjudged first, then judged.
// some kind of sorting based on rubric
import { JudgeCard } from "./judgeCard";
import { getHackathonJudges, getHackathonSubmissions } from "./server-actions";

export default async function Page(props: {
  params: Promise<{ year: string }>;
}) {
  const params = await props.params;
  const submissions = await getHackathonSubmissions(params.year);
  const judges = await getHackathonJudges(params.year);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-start py-10">
      <h1 className="text-2xl font-bold mb-4">Submissions</h1>

      <div className="w-full max-w-xl space-y-4">
        {submissions.map((submission) => (
          <JudgeCard
            key={submission.id}
            submission={submission}
            judges={judges}
          />
        ))}
      </div>
    </div>
  );
}
