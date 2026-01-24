import { Button } from "@repo/ui/components/button";
import Link from "next/link";
import { Suspense } from "react";
import { getCurrentHackathonId } from "@/app/actions/participant";

export default function Unauthorized() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-white">
      <p>You must be a judge, admin, or superadmin to access this interface</p>
      <p>
        If you&apos;re a judge/admin, talk to your organizers to obtain access
      </p>
      <p>
        If you&apos;re configuring this application, ensure that you whitelist
        an account as a superadmin. See the setup guide for more info
      </p>
      <Button>
        <Suspense fallback={<Link href="/">Back to home</Link>}>
          <HomeButton />
        </Suspense>
      </Button>
    </div>
  );
}

async function HomeButton() {
  const hackathonId = await getCurrentHackathonId();

  return <Link href={`/${hackathonId}`}>Back to home</Link>;
}
