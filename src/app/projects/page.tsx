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
      <main className="flex h-full flex-col items-start justify-start">
        <div className="mb-4 flex w-full items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-3 shadow-xl shadow-black/[0.1] dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]">
          <ProjectForm />
        </div>
        <Projects />
      </main>
    </HydrateClient>
  );
}
