"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Past Ideation Sessions</h1>
        <Button asChild>
          <Link href="/ideas/new">New Session</Link>
        </Button>
      </div>

      {sessions.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="mb-4 text-muted-foreground">
            You don't have any past ideation sessions yet.
          </p>
          <Button asChild>
            <Link href="/ideas/new">Start Your First Session</Link>
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
                      ? ` Team Session (${session.participants} participants)`
                      : " Solo Session"}
                  </p>
                </div>
                <Badge>{session.ideas} ideas</Badge>
              </div>

              <div className="mt-4 border-t pt-4">
                <p className="font-medium">Winning Idea:</p>
                <p className="mt-1 text-muted-foreground">
                  {session.winningIdea}
                </p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/ideas/session/${session.id}`}>
                    View Details
                  </Link>
                </Button>
                <Button variant="ghost" size="sm">
                  Export Results
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
