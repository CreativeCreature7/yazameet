"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export default function IdeationHistory() {
  const t = useTranslations("ideas.history");

  // Fetch sessions using tRPC
  const { data: sessions, isLoading } = api.ideation.getUserSessions.useQuery();

  // Create a function to render session status based on phase
  const getSessionStatusBadge = (phase: string) => {
    switch (phase) {
      case "COMPLETED":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "SELECTION":
        return <Badge className="bg-yellow-500">Final Selection</Badge>;
      case "SORTING":
        return <Badge className="bg-blue-500">Sorting Ideas</Badge>;
      case "IDEATION":
        return <Badge>In Progress</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/ideas/new">
            {t("start_new_session", { ns: "ideas" })}
          </Link>
        </Button>
      </div>

      {isLoading ? (
        // Loading state
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="p-6">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <Skeleton className="mb-2 h-6 w-48" />
                  <Skeleton className="h-4 w-32" />
                </div>
                <Skeleton className="h-6 w-20" />
              </div>
              <div className="mt-4 border-t pt-4">
                <Skeleton className="mb-2 h-4 w-24" />
                <Skeleton className="h-4 w-full" />
              </div>
              <div className="mt-4 flex gap-2">
                <Skeleton className="h-8 w-24" />
                <Skeleton className="h-8 w-24" />
              </div>
            </Card>
          ))}
        </div>
      ) : sessions?.length === 0 ? (
        // Empty state
        <Card className="p-6 text-center">
          <p className="mb-4 text-muted-foreground">{t("empty_state")}</p>
          <Button asChild>
            <Link href="/ideas/new">{t("start_first_session")}</Link>
          </Button>
        </Card>
      ) : (
        // Sessions list
        <div className="space-y-4">
          {sessions?.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{session.name}</h2>
                  <p className="text-muted-foreground">
                    {format(new Date(session.createdAt), "PPP")} •
                    {session.isTeam
                      ? ` ${t("team_session")}`
                      : ` ${t("solo_session")}`}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge>
                    {session.ideas.length} {t("ideas_count")}
                  </Badge>
                  {getSessionStatusBadge(session.phase)}
                </div>
              </div>

              {session.phase === "COMPLETED" && session.winningIdea && (
                <div className="mt-4 border-t pt-4">
                  <p className="font-medium">{t("winning_idea")}</p>
                  <p className="mt-1 text-muted-foreground">
                    {session.winningIdea}
                  </p>
                </div>
              )}

              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/ideas/session/${session.id}`}>
                    {t("view_details")}
                  </Link>
                </Button>
                {session.phase === "COMPLETED" && (
                  <Button variant="ghost" size="sm">
                    {t("export_results")}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
