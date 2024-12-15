"use client";

import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { api } from "@/trpc/react";
import { Skeleton } from "@/components/ui/skeleton";

export default function LatestUsers() {
  const { data: people, isLoading } = api.user.getLatestUsers.useQuery();

  if (isLoading || !people)
    return (
      <div className="flex flex-row">
        <Skeleton className="-me-2 h-14 w-14 rounded-full" />
        <Skeleton className="-me-2 h-14 w-14 rounded-full" />
        <Skeleton className="-me-2 h-14 w-14 rounded-full" />
        <Skeleton className="-me-2 h-14 w-14 rounded-full" />
        <Skeleton className="-me-2 h-14 w-14 rounded-full" />
        <Skeleton className="h-14 w-14 rounded-full" />
      </div>
    );

  return <AnimatedTooltip items={people} />;
}
