import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export default async function IdeasPage() {
  const t = await getTranslations("ideas");

  return (
    <div className="container py-8">
      <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
      <p className="mb-8 text-muted-foreground">{t("description")}</p>

      <div className="flex max-w-md flex-col gap-4">
        <Button asChild className="w-full" size="lg">
          <Link href="/ideas/new">{t("start_new_session")}</Link>
        </Button>

        <Button asChild variant="outline" className="w-full" size="lg">
          <Link href="/ideas/history">{t("view_past_sessions")}</Link>
        </Button>
      </div>
    </div>
  );
}
