import { LatestProject } from "@/app/_components/project";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Projects from "@/components/projects";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { getTranslations } from "next-intl/server";

export default async function ProjectsList() {
  const t = await getTranslations();
  const session = await getServerAuthSession();

  void api.project.getLatest.prefetch();

  return (
    <HydrateClient>
      <main className="flex h-full flex-col items-start justify-start">
        <div className="mb-4 w-full rounded-3xl border border-neutral-200 bg-white p-3 shadow-xl shadow-black/[0.1] dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]">
          <Dialog>
            <DialogTrigger asChild>
              <Button disabled={!session?.user}>{t("add")}</Button>
            </DialogTrigger>
            <DialogContent>{session?.user && <LatestProject />}</DialogContent>
          </Dialog>
        </div>
        <Projects />
      </main>
    </HydrateClient>
  );
}
