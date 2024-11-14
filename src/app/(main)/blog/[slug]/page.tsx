"use client";

import { api } from "@/trpc/react";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

export default function BlogPost({ params }: { params: { slug: string } }) {
  const { data: post, isLoading } = api.blog.getBySlug.useQuery({
    slug: params.slug,
  });

  if (isLoading) {
    return (
      <div className="mt-32 px-4" dir="ltr">
        <div className="mx-auto max-w-2xl space-y-8">
          <div className="space-y-4">
            <div className="h-8 w-2/3 animate-pulse rounded-md bg-muted" />
            <div className="h-4 w-1/3 animate-pulse rounded-md bg-muted" />
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-4 w-full animate-pulse rounded-md bg-muted"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!post || !post.published) {
    notFound();
  }

  return (
    <div className="mt-32 px-4" dir="ltr">
      <article className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-2">
          <h1 className="text-[60px] font-bold tracking-tight">{post.title}</h1>
          <p className="flex items-center gap-2 text-muted-foreground">
            <CalendarIcon className="h-4 w-4" />
            {format(post.createdAt, "dd MMMM yyyy")}
          </p>
        </header>
        <hr className="my-8" />
        <div
          className="prose prose-neutral max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </article>
    </div>
  );
}
