import Link from "next/link";

import { LatestProject } from "@/app/_components/project";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";

export default async function Projects() {
  const session = await getServerAuthSession();

  void api.project.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col items-center justify-center">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
          {session?.user && <LatestProject />}
        </div>
      </main>
    </HydrateClient>
  );
}
