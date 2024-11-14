"use client";

import { api } from "@/trpc/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { format } from "date-fns";

export default function BlogPage() {
  const t = useTranslations();
  const { data: posts, isLoading } = api.blog.getPublished.useQuery();

  if (isLoading) {
    return (
      <div className="mx-4 mt-32">
        <h1 className="mb-4 text-3xl font-bold tracking-tight">{t("blog")}</h1>
        <div className="grid gap-4 px-4 sm:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-6 w-2/3 rounded-md bg-muted" />
                <div className="h-4 w-1/3 rounded-md bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-4 w-full rounded-md bg-muted" />
                  <div className="h-4 w-4/5 rounded-md bg-muted" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-32 space-y-8 px-4">
      <h1 className="text-3xl font-bold tracking-tight">{t("blog")}</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {posts?.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`}>
            <Card className="transition-all hover:scale-[1.02] hover:shadow-lg">
              <CardHeader className="space-y-1">
                <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(post.createdAt, "dd MMMM yyyy")}
                </p>
              </CardHeader>
              <CardContent>
                <div
                  className="line-clamp-3 text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: post.content.substring(0, 150) + "...",
                  }}
                />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
