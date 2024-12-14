import { ProjectForm } from "@/app/_components/project-form";
import { getServerAuthSession } from "@/server/auth";
import { api, HydrateClient } from "@/trpc/server";
import Projects from "@/app/_components/uprise-projects";
import { getTranslations } from "next-intl/server";
import Image from "next/image";
import LogoUprise from "@/../public/Images/uprise_logo.png";
import { getProviders } from "next-auth/react";

export default async function UpriseProjectsList() {
  void (await getTranslations());
  void (await getServerAuthSession());
  void (await getProviders());

  void api.project.infiniteProjects.prefetchInfinite({
    limit: 5,
    types: ["UPRISE"],
  });

  return (
    <HydrateClient>
      <main className="flex h-full flex-col items-start justify-start">
        <div className="mb-8 flex w-full items-center justify-center xl:mt-8">
          <Image
            src={LogoUprise}
            alt="Up-Rise Logo"
            width={600}
            height={150}
            className="object-contain"
          />
        </div>
        <div className="mb-4">
          <ProjectForm defaultType="UPRISE" />
        </div>
        <Projects />
      </main>
    </HydrateClient>
  );
}
