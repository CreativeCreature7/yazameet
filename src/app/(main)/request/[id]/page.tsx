import { api } from "@/trpc/server";
import { getServerAuthSession } from "@/server/auth";
import { redirect } from "next/navigation";
import { RequestActions } from "@/app/_components/request-actions";
import { Badge } from "@/components/ui/badge";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import Link from "next/link";

export default async function RequestPage({
  params,
}: {
  params: { id: string };
}) {
  const t = await getTranslations();
  const session = await getServerAuthSession();

  if (!session) {
    redirect("/auth/sign-in");
  }

  const project = await api.project.getProject({
    id: parseInt(params.id),
  });

  if (!project) {
    redirect("/projects");
  }

  // Check if user is project owner
  if (project.createdById !== session.user.id) {
    redirect("/projects");
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="container mx-auto max-w-4xl p-6">
        <div className="mb-8 rounded-lg bg-white p-6 shadow-lg dark:bg-black">
          <h1 className="mb-4 text-2xl font-bold">{project.name}</h1>
          <p className="mb-4 text-gray-600 dark:text-gray-400">
            {project.description}
          </p>
          <div className="mb-4 flex flex-wrap gap-2">
            {project.type.map((type) => (
              <Badge key={type}>{t(type)}</Badge>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {project.rolesNeeded.map((role) => (
              <Badge key={role} variant="outline">
                {t(role)}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            {t("pending_collaboration_requests")}
          </h2>
          {project.CollaborationRequest.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between rounded-lg bg-white p-4 shadow-md dark:bg-black"
            >
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12">
                  <Link href={`/profile/${request.user.id}`}>
                    <Image
                      src={request.user.image ?? "/default-avatar.png"}
                      alt={request.user.name ?? ""}
                      className="rounded-full object-cover"
                      fill
                    />
                  </Link>
                </div>
                <div>
                  <Link
                    href={`/profile/${request.user.id}`}
                    className="font-medium hover:underline"
                  >
                    {request.user.name}
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {request.user.email}
                  </p>
                </div>
              </div>
              <RequestActions
                requestId={request.id}
                projectId={project.id}
                status={request.status}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
