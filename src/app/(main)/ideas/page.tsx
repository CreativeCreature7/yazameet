import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import IdeationLogo from "@/../public/Images/ideation_1.svg";
import Image from "next/image";
export default async function IdeasPage() {
  const t = await getTranslations("ideas");

  return (
    <div className="container flex flex-1 flex-col items-center justify-center">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("description")}</p>

      <div className="flex max-w-md flex-col gap-4">
        <Button asChild className="w-full" size="lg">
          <Link href="/ideas/new">{t("start_new_session")}</Link>
        </Button>

        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/ideas/history">{t("view_past_sessions")}</Link>
        </Button>
        <div className="mt-6">
          <Image
            src={IdeationLogo}
            alt="Ideation Logo"
            width={300}
            height={300}
          />
        </div>
      </div>
    </div>
  );
}
