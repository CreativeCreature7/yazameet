import { ProjectForm } from "@/app/_components/project-form";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Projects from "@/app/_components/uprise-projects";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import LogoUprise from "@/../public/Images/uprise_logo.png";
import { LoginDialog } from "@/app/_components/login-dialog";
import { getProviders } from "next-auth/react";

export default async function UpriseProjectsList() {
  const t = await getTranslations();
  const session = await getServerAuthSession();
  const providers = await getProviders();

  void api.project.infiniteProjects.prefetchInfinite({
    limit: 5,
    types: ["UPRISE"],
  });

  return (
    <HydrateClient>
      <LoginDialog providers={providers} />
      <main className="flex h-full flex-col items-start justify-start">
        <div className="mb-8 flex w-full items-center justify-center">
          <Image
            src={LogoUprise}
            alt="Up-Rise Logo"
            width={600}
            height={150}
            className="object-contain"
          />
        </div>
        <div className="mb-4 flex w-full items-center gap-4 rounded-3xl border border-neutral-200 bg-white p-3 shadow-xl shadow-black/[0.1] dark:border-white/[0.1] dark:bg-black dark:shadow-white/[0.05]">
          <ProjectForm defaultType="UPRISE" />
        </div>
        <Projects />
      </main>
    </HydrateClient>
  );
}
