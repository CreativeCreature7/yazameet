"use client";

import { AnimatedTooltip } from "@/components/ui/animated-tooltip";
import { api } from "@/trpc/react";

export default function LatestUsers() {
  const { data: people } = api.user.getLatestUsers.useQuery();

  if (!people) return null;

  return <AnimatedTooltip items={people} />;
}
