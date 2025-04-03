import { ProjectForm } from "@/app/_components/project-form";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Projects from "@/app/_components/projects";
import { getTranslations } from "next-intl/server";

export default async function ProjectsList() {
  const t = await getTranslations();
  await getServerAuthSession();

  void api.project.infiniteProjects.prefetchInfinite({
    limit: 5,
  });

  return (
    <HydrateClient>
      <main className="mt-8 flex h-full flex-col items-start justify-start">
        <Projects />
      </main>
    </HydrateClient>
  );
}
