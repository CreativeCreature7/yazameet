import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { getServerAuthSession } from "@/server/auth";
import { api } from "@/trpc/server";
import LatestUsers from "@/app/_components/latest-users";

export default async function Home() {
  const t = await getTranslations();
  const session = await getServerAuthSession();

  void api.user.getLatestUsers.prefetch();

  const words = [
    t("software_developers"),
    t("product_managers"),
    t("ui_ux_designers"),
    t("marketing_specialists"),
  ];

  return (
    <main className="mx-6 md:mx-0">
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mx-auto text-xl font-normal md:text-4xl">
          <h1 className="mb-6 max-w-[800px] text-[38px] leading-[36px] -tracking-wider md:text-[64px] md:leading-[60px]">
            {t("reichman_university_entrepreneurship_hub")}
          </h1>
          <span className="text-neutral-600 dark:text-neutral-400">
            {t("connect_with")}
          </span>
          <FlipWords words={words} /> <br />
          <div className="mt-2 flex flex-row items-start justify-start">
            <LatestUsers />
          </div>
        </div>
      </div>
      {!session?.user ? (
        <Link href={"/auth/sign-in"}>
          <Button
            className="fixed bottom-10 left-1/2 -translate-x-1/2 font-sans text-2xl"
            variant="expandIcon"
            iconPlacement="right"
            Icon={ArrowRight}
            size="lg"
          >
            {t("join")}
          </Button>
        </Link>
      ) : (
        <Link href={"/projects"}>
          <Button
            className="fixed bottom-10 left-1/2 -translate-x-1/2 font-sans text-2xl"
            variant="expandIcon"
            iconPlacement="right"
            Icon={ArrowRight}
            size="lg"
          >
            {t("projects")}
          </Button>
        </Link>
      )}
    </main>
  );
}
