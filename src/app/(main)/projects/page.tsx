import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Projects from "@/app/_components/projects";
import { getTranslations } from "next-intl/server";

export default async function ProjectsList({
  params,
  searchParams,
}: {
  params: { [key: string]: string | string[] | undefined };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const t = await getTranslations();
  await getServerAuthSession();

  const createProject = searchParams.createProject === "true";
  const name = searchParams.name;
  const description = searchParams.description;

  void api.project.infiniteProjects.prefetchInfinite({
    limit: 5,
  });

  return (
    <HydrateClient>
      <main className="mt-8 flex h-full flex-col items-start justify-start">
        <Projects
          createProject={createProject}
          name={name as string}
          description={description as string}
        />
      </main>
    </HydrateClient>
  );
}
