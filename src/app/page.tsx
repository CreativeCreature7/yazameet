import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { Button } from "@/components/ui/button";
import { FlipWords } from "@/components/ui/flip-words";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { people } from "@/lib/dummy-data";
import { getServerSession } from "next-auth";

export default async function Home() {
  const t = await getTranslations();
  const session = await getServerSession();

  const words = [
    t("software_developers"),
    t("product_managers"),
    t("ui_ux_designers"),
    t("marketing_specialists"),
    t("business_development_manager"),
  ];

  return (
    <main>
      <div className="flex min-h-screen flex-col items-center justify-center">
        <div className="mx-auto text-4xl font-normal">
          <h1 className="mb-6 max-w-[800px] text-[64px] leading-[60px] -tracking-wider">
            {t("reichman_university_entrepreneurship_hub")}
          </h1>
          <span className="text-neutral-600 dark:text-neutral-400">
            {t("connect_with")}
          </span>
          <FlipWords words={words} /> <br />
          <div className="mt-2 flex flex-row items-start justify-start">
            <AnimatedTooltip items={people} />
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
