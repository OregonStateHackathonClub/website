import { auth } from "@repo/auth";
import { headers } from "next/headers";
import { unauthorized } from "next/navigation";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await auth.api.getSession({ headers: await headers() });

  if (!user) {
    unauthorized();
  }

  return (
    <div className="flex min-h-dvh w-full grow bg-zinc-900 text-zinc-50">
      {children}
    </div>
  );
}
