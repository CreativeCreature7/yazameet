"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTranslations } from "next-intl";

// In a real app, this would come from an API
const MOCK_SESSIONS = [
  {
    id: "12345",
    name: "Q2 Marketing Campaign",
    date: "2023-04-15",
    teamSession: true,
    participants: 4,
    ideas: 42,
    winningIdea:
      "Interactive social media challenge with user-generated content",
  },
  {
    id: "12346",
    name: "New Product Features",
    date: "2023-04-10",
    teamSession: true,
    participants: 3,
    ideas: 31,
    winningIdea: "AI-powered personalization for each user",
  },
  {
    id: "12347",
    name: "Website Redesign",
    date: "2023-04-05",
    teamSession: false,
    participants: 1,
    ideas: 15,
    winningIdea: "Minimalist design with focused user flows",
  },
];

export default function IdeationHistory() {
  const [sessions] = useState(MOCK_SESSIONS);
  const t = useTranslations("ideas.history");

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <Button asChild>
          <Link href="/ideas/new">{t("new_session", { ns: "ideas" })}</Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="mb-4 text-muted-foreground">{t("empty_state")}</p>
          <Button asChild>
            <Link href="/ideas/new">{t("start_first_session")}</Link>
          </Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => (
            <Card key={session.id} className="p-6">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <h2 className="text-xl font-semibold">{session.name}</h2>
                  <p className="text-muted-foreground">
                    {new Date(session.date).toLocaleDateString()} •
                    {session.teamSession
                      ? ` ${t("team_session")} (${session.participants} ${t("participants")})`
                      : ` ${t("solo_session")}`}
                  </p>
                </div>
                <Badge>
                  {session.ideas} {t("ideas_count")}
                </Badge>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="font-medium">{t("winning_idea")}</p>
                <p className="mt-1 text-muted-foreground">
                  {session.winningIdea}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/ideas/session/${session.id}`}>
                    {t("view_details")}
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  {t("export_results")}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
