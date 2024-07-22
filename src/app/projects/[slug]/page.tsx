import { api } from "@/trpc/server";
import ProjectClient from "@/components/project";

export default async function Project({
  params,
}: {
  params: { slug: string };
}) {
  void api.project.getProject.prefetch({
    id: Number(params.slug),
  });

  return (
    <div>
      <ProjectClient id={Number(params.slug)} />
    </div>
  );
}
