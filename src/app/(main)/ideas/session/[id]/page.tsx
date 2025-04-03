"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { useTranslations } from "next-intl";

// Phase duration in seconds
const IDEATION_PHASE_DURATION = 1 * 60; // 10 minutes
const SORTING_PHASE_DURATION = 1 * 60; // 5 minutes

type Idea = {
  id: string;
  text: string;
  createdBy: string;
  createdAt: Date;
  rank?: number;
};

type SessionPhase = "ideation" | "sorting" | "selection" | "completed";

export default function IdeationSession({
  params,
}: {
  params: { id: string };
}) {
  const searchParams = useSearchParams();
  const sessionName = searchParams.get("name") || "Ideation Session";
  const isTeamSession = searchParams.get("team") === "true";
  const t = useTranslations("ideas.session");

  const [currentPhase, setCurrentPhase] = useState<SessionPhase>("ideation");
  const [timeRemaining, setTimeRemaining] = useState(IDEATION_PHASE_DURATION);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [newIdea, setNewIdea] = useState("");
  const [username] = useState("Current User"); // Would come from auth
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [finalIdea, setFinalIdea] = useState<string | null>(null);

  // Handle timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Move to next phase
          if (currentPhase === "ideation") {
            setCurrentPhase("sorting");
            return SORTING_PHASE_DURATION;
          } else if (currentPhase === "sorting") {
            setCurrentPhase("selection");
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPhase]);

  // Format time remaining
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Add new idea
  const handleAddIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIdea.trim() && currentPhase === "ideation") {
      const idea: Idea = {
        id: Date.now().toString(),
        text: newIdea.trim(),
        createdBy: username,
        createdAt: new Date(),
      };
      setIdeas((prev) => [...prev, idea]);
      setNewIdea("");
    }
  };

  // Handle idea sorting
  const handleIdeaRank = (ideaId: string, direction: "up" | "down") => {
    setIdeas((prev) => {
      const newIdeas = [...prev];
      const ideaIndex = newIdeas.findIndex((idea) => idea.id === ideaId);

      if (ideaIndex === -1) return prev;

      const swapIndex =
        direction === "up"
          ? Math.max(0, ideaIndex - 1)
          : Math.min(newIdeas.length - 1, ideaIndex + 1);

      if (swapIndex === ideaIndex) return prev;

      // Swap ideas with type assertions
      const temp = newIdeas[ideaIndex] as Idea;
      newIdeas[ideaIndex] = newIdeas[swapIndex] as Idea;
      newIdeas[swapIndex] = temp;

      return newIdeas;
    });
  };

  // Toggle idea selection for final phase
  const toggleIdeaSelection = (ideaId: string) => {
    setSelectedIdeas((prev) => {
      if (prev.includes(ideaId)) {
        return prev.filter((id) => id !== ideaId);
      } else {
        if (prev.length < 3) {
          return [...prev, ideaId];
        }
        return prev;
      }
    });
  };

  // Finalize selection
  const finalizeSelection = (ideaId: string) => {
    setFinalIdea(ideaId);
    setCurrentPhase("completed");
  };

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{sessionName}</h1>
          <p className="text-muted-foreground">
            {isTeamSession ? t("team_session") : t("solo_session")}
            {" • "}
            {t("session_id")} {params.id}
          </p>
        </div>

        {(currentPhase === "ideation" || currentPhase === "sorting") && (
          <div className="text-right">
            <div className="mb-1 font-mono text-3xl">
              {formatTime(timeRemaining)}
            </div>
            <Badge variant="outline">
              {currentPhase === "ideation"
                ? t("ideation_phase")
                : t("sorting_phase")}
            </Badge>
          </div>
        )}
      </div>

      {/* Ideation Phase */}
      {currentPhase === "ideation" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("generate_ideas")}
            </h2>
            <p className="mb-4">{t("generate_ideas_description")}</p>

            <form onSubmit={handleAddIdea} className="flex gap-2">
              <AutosizeTextarea
                value={newIdea}
                onChange={(e) => setNewIdea(e.target.value)}
                placeholder={t("idea_placeholder")}
                className="flex-1"
              />
              <Button type="submit">{t("add_idea")}</Button>
            </form>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("ideas_count")} ({ideas.length})
            </h3>
            {ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_yet")}</p>
            ) : (
              <div className="space-y-2">
                {ideas.map((idea) => (
                  <Card key={idea.id} className="p-4">
                    <p>{idea.text}</p>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sorting Phase */}
      {currentPhase === "sorting" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("prioritize_ideas")}
            </h2>
            <p className="mb-4">{t("prioritize_ideas_description")}</p>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("rank_ideas")} ({ideas.length})
            </h3>
            {ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_to_rank")}</p>
            ) : (
              <div className="space-y-2">
                {ideas.map((idea, index) => (
                  <Card
                    key={idea.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{index + 1}</Badge>
                      <p>{idea.text}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIdeaRank(idea.id, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleIdeaRank(idea.id, "down")}
                        disabled={index === ideas.length - 1}
                      >
                        ↓
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Selection Phase */}
      {currentPhase === "selection" && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("final_selection")}
            </h2>
            <p className="mb-4">{t("final_selection_description")}</p>
          </Card>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium">{t("top_ideas")}</h3>
              <Badge variant="outline">
                {selectedIdeas.length}/3 {t("selected_count")}
              </Badge>
            </div>

            {ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_to_select")}</p>
            ) : (
              <div className="space-y-3">
                {ideas.slice(0, 10).map((idea, index) => (
                  <Card
                    key={idea.id}
                    className={`cursor-pointer p-4 ${
                      selectedIdeas.includes(idea.id) ? "border-primary" : ""
                    }`}
                    onClick={() =>
                      selectedIdeas.length < 3 ||
                      selectedIdeas.includes(idea.id)
                        ? toggleIdeaSelection(idea.id)
                        : null
                    }
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">{index + 1}</Badge>
                      <p>{idea.text}</p>
                      {selectedIdeas.includes(idea.id) && (
                        <Badge className="ml-auto">{t("selected")}</Badge>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {selectedIdeas.length === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{t("choose_winner")}</h3>
              <div className="space-y-3">
                {ideas
                  .filter((idea) => selectedIdeas.includes(idea.id))
                  .map((idea) => (
                    <Card key={idea.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <p>{idea.text}</p>
                        <Button
                          onClick={() => finalizeSelection(idea.id)}
                          size="sm"
                        >
                          {t("select_as_winner")}
                        </Button>
                      </div>
                    </Card>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Completed Phase */}
      {currentPhase === "completed" && finalIdea && (
        <div className="space-y-6">
          <Card className="border-green-500 p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("session_completed")}
            </h2>
            <p className="mb-4">{t("session_completed_description")}</p>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t("winning_idea")}</h3>
            <Card className="bg-primary/5 p-6">
              <p className="text-xl">
                {ideas.find((idea) => idea.id === finalIdea)?.text}
              </p>
            </Card>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1">
                {t("download_results")}
              </Button>
              <Button className="flex-1">{t("create_project")}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
