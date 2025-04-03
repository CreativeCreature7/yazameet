"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AutosizeTextarea } from "@/components/ui/autosize-textarea";
import { useTranslations } from "next-intl";
import { api } from "@/trpc/react";
import { IdeationPhase } from "@prisma/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";

// Phase duration in seconds
const IDEATION_PHASE_DURATION = 1 * 20; // 20 seconds
const SORTING_PHASE_DURATION = 1 * 20; // 20 seconds

// Schema for adding a new idea
const newIdeaSchema = z.object({
  text: z.string().min(1, "Idea text is required"),
});

export default function IdeationSession({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const t = useTranslations("ideas.session");
  const [timeRemaining, setTimeRemaining] = useState(IDEATION_PHASE_DURATION);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);

  // Fetch session data
  const {
    data: session,
    isLoading,
    refetch,
  } = api.ideation.getById.useQuery(
    {
      id: params.id,
    },
    {
      onError: (error) => {
        toast.error(error.message);
        router.push("/ideas/history");
      },
    },
  );

  // Setup mutations
  const { mutate: addIdea } = api.ideation.addIdea.useMutation({
    onSuccess: () => {
      form.reset({ text: "" });
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updatePhase } = api.ideation.updatePhase.useMutation({
    onSuccess: () => {
      void refetch();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: updateIdeaRanks } = api.ideation.updateIdeaRanks.useMutation({
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const { mutate: selectWinningIdea } =
    api.ideation.selectWinningIdea.useMutation({
      onSuccess: () => {
        void refetch();
        toast.success(t("winner_selected"));
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  // New idea form
  const form = useForm<z.infer<typeof newIdeaSchema>>({
    resolver: zodResolver(newIdeaSchema),
    defaultValues: {
      text: "",
    },
  });

  // Handle timer
  useEffect(() => {
    if (
      !session ||
      (session.phase !== IdeationPhase.IDEATION &&
        session.phase !== IdeationPhase.SORTING)
    ) {
      return;
    }

    const initialTime =
      session.phase === IdeationPhase.IDEATION
        ? IDEATION_PHASE_DURATION
        : SORTING_PHASE_DURATION;

    setTimeRemaining(initialTime);

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Move to next phase
          if (session.phase === IdeationPhase.IDEATION) {
            updatePhase({
              sessionId: session.id,
              phase: IdeationPhase.SORTING,
            });
            return SORTING_PHASE_DURATION;
          } else if (session.phase === IdeationPhase.SORTING) {
            updatePhase({
              sessionId: session.id,
              phase: IdeationPhase.SELECTION,
            });
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [session?.phase, session?.id, updatePhase]);

  // Format time remaining
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Add new idea
  function onSubmitNewIdea(values: z.infer<typeof newIdeaSchema>) {
    if (!session) return;

    addIdea({
      text: values.text,
      sessionId: session.id,
    });
  }

  // Handle idea sorting
  const handleIdeaRank = (ideaId: string, direction: "up" | "down") => {
    if (!session || !session.ideas) return;

    // Create a copy of the ideas array
    const ideasCopy = [...session.ideas];
    const ideaIndex = ideasCopy.findIndex((idea) => idea.id === ideaId);

    if (ideaIndex === -1) return;

    const swapIndex =
      direction === "up"
        ? Math.max(0, ideaIndex - 1)
        : Math.min(ideasCopy.length - 1, ideaIndex + 1);

    if (swapIndex === ideaIndex) return;

    // Swap items
    [ideasCopy[ideaIndex], ideasCopy[swapIndex]] = [
      ideasCopy[swapIndex],
      ideasCopy[ideaIndex],
    ];

    // Update ranks
    const updatedIdeas = ideasCopy.map((idea, index) => ({
      id: idea.id,
      rank: index,
    }));

    // Optimistically update the UI (handled by refetch in the success callback)
    updateIdeaRanks({
      sessionId: session.id,
      ideas: updatedIdeas,
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
    if (!session) return;

    selectWinningIdea({
      sessionId: session.id,
      ideaId,
    });
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <Skeleton className="mb-2 h-8 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
        <Card className="p-6">
          <Skeleton className="mb-4 h-6 w-32" />
          <Skeleton className="mb-4 h-4 w-full" />
          <div className="flex gap-2">
            <Skeleton className="h-24 flex-1" />
            <Skeleton className="h-10 w-20" />
          </div>
        </Card>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="container py-8">
        <Card className="p-6 text-center">
          <p className="text-muted-foreground">{t("session_not_found")}</p>
          <Button asChild className="mt-4">
            <a href="/ideas/history">{t("back_to_history")}</a>
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">{session.name}</h1>
          <p className="text-muted-foreground">
            {session.isTeam ? t("team_session") : t("solo_session")}
            {" • "}
            {t("session_id")} {session.id}
          </p>
        </div>

        {(session.phase === IdeationPhase.IDEATION ||
          session.phase === IdeationPhase.SORTING) && (
          <div className="text-right">
            <div className="mb-1 font-mono text-3xl">
              {formatTime(timeRemaining)}
            </div>
            <Badge className="border bg-transparent text-foreground">
              {session.phase === IdeationPhase.IDEATION
                ? t("ideation_phase")
                : t("sorting_phase")}
            </Badge>
          </div>
        )}
      </div>

      {/* Ideation Phase */}
      {session.phase === IdeationPhase.IDEATION && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("generate_ideas")}
            </h2>
            <p className="mb-4">{t("generate_ideas_description")}</p>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitNewIdea)}
                className="flex gap-2"
              >
                <FormField
                  control={form.control}
                  name="text"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <AutosizeTextarea
                          placeholder={t("idea_placeholder")}
                          className="flex-1"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <Button type="submit">{t("add_idea")}</Button>
              </form>
            </Form>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("ideas_count")} ({session.ideas.length})
            </h3>
            {session.ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_yet")}</p>
            ) : (
              <div className="space-y-2">
                {session.ideas.map((idea) => (
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
      {session.phase === IdeationPhase.SORTING && (
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="mb-4 text-xl font-semibold">
              {t("prioritize_ideas")}
            </h2>
            <p className="mb-4">{t("prioritize_ideas_description")}</p>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("rank_ideas")} ({session.ideas.length})
            </h3>
            {session.ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_to_rank")}</p>
            ) : (
              <div className="space-y-2">
                {session.ideas.map((idea, index) => (
                  <Card
                    key={idea.id}
                    className="flex items-center justify-between p-4"
                  >
                    <div className="flex items-center gap-2">
                      <Badge className="border bg-transparent text-foreground">
                        {index + 1}
                      </Badge>
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
                        disabled={index === session.ideas.length - 1}
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
      {session.phase === IdeationPhase.SELECTION && (
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
              <Badge className="border bg-transparent text-foreground">
                {selectedIdeas.length}/3 {t("selected_count")}
              </Badge>
            </div>

            {session.ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_to_select")}</p>
            ) : (
              <div className="space-y-3">
                {session.ideas.slice(0, 10).map((idea, index) => (
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
                      <Badge className="border bg-transparent text-foreground">
                        {index + 1}
                      </Badge>
                      <p>{idea.text}</p>
                      {selectedIdeas.includes(idea.id) && (
                        <Badge className="bg-primary text-primary-foreground">
                          {t("selected")}
                        </Badge>
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
                {session.ideas
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
      {session.phase === IdeationPhase.COMPLETED && session.winningIdea && (
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
              <p className="text-xl">{session.winningIdea}</p>
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
