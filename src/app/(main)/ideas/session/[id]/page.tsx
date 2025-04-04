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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  GripVertical,
  Sparkles,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LoadingButton } from "@/components/ui/loading-button";

// Phase duration in seconds
const IDEATION_PHASE_DURATION = 10 * 60; // 10 minutes
const SORTING_PHASE_DURATION = 3 * 60; // 3 minutes

// Define the Idea interface to match the session.ideas structure
type Idea = {
  id: string;
  text: string;
  rank: number | null;
  isWinner: boolean;
  createdAt: Date;
  sessionId: string;
  userId: string;
  user: {
    name: string | null;
    id: string;
    image: string | null;
  };
};

// Schema for adding a new idea
const newIdeaSchema = z.object({
  text: z.string().min(1, "Idea text is required"),
});

// Sortable Item Component
const SortableIdeaItem = ({ idea, index }: { idea: Idea; index: number }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
    touchAction: "none", // Prevent browser touch actions like scrolling
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={`cursor-move select-none border-solid p-4 transition-all duration-200 active:scale-[1.01] ${
        isDragging
          ? "scale-[1.02] shadow-lg ring-2 ring-primary"
          : "hover:bg-accent hover:shadow-sm"
      }`}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-1 items-center gap-3">
          <Badge
            className={`min-w-8 border text-center ${
              isDragging
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-foreground"
            }`}
          >
            {index + 1}
          </Badge>
          <p className="flex-1">{idea.text}</p>
        </div>
        <div className="text-muted-foreground">
          <GripVertical size={20} />
        </div>
      </div>
    </Card>
  );
};

export default function IdeationSession({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const t = useTranslations("ideas.session");
  const [timeRemaining, setTimeRemaining] = useState(IDEATION_PHASE_DURATION);
  const [localIdeas, setLocalIdeas] = useState<Idea[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [isLoadingAiSuggestions, setIsLoadingAiSuggestions] = useState(false);
  const [showSubmitReminderDialog, setShowSubmitReminderDialog] =
    useState(false);
  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);

  // Setup sensors for drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        // Make drag activation easier on mobile
        distance: 5, // Reduced from 8
        // Remove delay that might be causing issues on mobile
        delay: 0,
        // Increase tolerance for touch inaccuracy
        tolerance: 10,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Fetch session data
  const {
    data: session,
    isLoading,
    refetch,
  } = api.ideation.getById.useQuery({
    id: params.id,
  });

  // Update local ideas when session changes
  useEffect(() => {
    if (session?.ideas) {
      setLocalIdeas(session.ideas);
    }
  }, [session]);

  // Handle error for session fetch
  useEffect(() => {
    if (!session && !isLoading) {
      toast.error("Session not found");
      router.push("/ideas/history");
    }
  }, [session, isLoading, router]);

  // Setup mutations
  const { mutate: addIdea } = api.ideation.addIdea.useMutation({
    onSuccess: () => {
      form.reset({ text: "" });
      void refetch();
      setIsSubmittingIdea(false);
    },
    onError: (error) => {
      toast.error(error.message);
      setIsSubmittingIdea(false);
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

          // Check if there's unsaved text in the ideation form
          if (
            session.phase === IdeationPhase.IDEATION &&
            form.getValues().text.trim().length > 0
          ) {
            // Show confirmation dialog
            setShowSubmitReminderDialog(true);

            // Don't auto-advance until user makes a choice
            return 0;
          }

          // Only auto-advance if not showing the dialog
          if (
            session.phase === IdeationPhase.IDEATION &&
            !showSubmitReminderDialog
          ) {
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
  }, [
    session?.phase,
    session?.id,
    updatePhase,
    form,
    showSubmitReminderDialog,
  ]);

  // Format time remaining
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  }, []);

  // Function to handle submitting the remaining idea and moving to next phase
  const handleSubmitRemainingIdea = () => {
    if (!session) return;

    // Submit the idea
    const text = form.getValues().text;
    if (text.trim()) {
      // Use a local flag to track if the idea was added successfully
      let ideaAddedSuccessfully = false;

      // Add the idea first
      addIdea(
        {
          text,
          sessionId: session.id,
        },
        {
          onSuccess: () => {
            ideaAddedSuccessfully = true;
            toast.success(t("idea_added_success"));

            // Close dialog
            setShowSubmitReminderDialog(false);

            // Move to next phase after idea is successfully added
            updatePhase({
              sessionId: session.id,
              phase: IdeationPhase.SORTING,
            });
          },
        },
      );
    } else {
      // No idea to submit, just close and move on
      setShowSubmitReminderDialog(false);
      updatePhase({
        sessionId: session.id,
        phase: IdeationPhase.SORTING,
      });
    }
  };

  // Function to skip without submitting the idea
  const handleSkipRemainingIdea = () => {
    if (!session) return;

    // Close dialog
    setShowSubmitReminderDialog(false);

    // Reset form
    form.reset();

    // Move to next phase
    updatePhase({
      sessionId: session.id,
      phase: IdeationPhase.SORTING,
    });
  };

  // Add new idea
  function onSubmitNewIdea(values: z.infer<typeof newIdeaSchema>) {
    if (!session) return;

    setIsSubmittingIdea(true);
    addIdea({
      text: values.text,
      sessionId: session.id,
    });
  }

  // Handle Enter key press to submit
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter, but allow Shift+Enter for new lines
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void form.handleSubmit(onSubmitNewIdea)();
    }
  };

  // Handle drag start for sorting
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    setIsDragging(true); // Add this to track dragging state
  };

  // Handle drag end for sorting
  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    setIsDragging(false); // Reset dragging state

    const { active, over } = event;

    if (!over || active.id === over.id) return;

    setLocalIdeas((items) => {
      const oldIndex = items.findIndex((item) => item.id === active.id);
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Update local state immediately for better UX
      const newItems = arrayMove(items, oldIndex, newIndex);

      // Send update to server
      if (session) {
        const updatedIdeas = newItems.map((idea, index) => ({
          id: idea.id,
          rank: index,
        }));

        updateIdeaRanks({
          sessionId: session.id,
          ideas: updatedIdeas,
        });
      }

      return newItems;
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

  // Skip to next phase
  const skipToNextPhase = () => {
    if (!session) return;

    let nextPhase;

    if (session.phase === IdeationPhase.IDEATION) {
      nextPhase = IdeationPhase.SORTING;
    } else if (session.phase === IdeationPhase.SORTING) {
      nextPhase = IdeationPhase.SELECTION;
    } else if (session.phase === IdeationPhase.SELECTION) {
      // Cannot skip from SELECTION to COMPLETED without choosing a winner
      toast.error(t("must_select_winner"));
      return;
    } else {
      return; // Already completed
    }

    updatePhase({
      sessionId: session.id,
      phase: nextPhase,
    });
  };

  // Go back to previous phase
  const goToPreviousPhase = () => {
    if (!session) return;

    let previousPhase;

    if (session.phase === IdeationPhase.SORTING) {
      previousPhase = IdeationPhase.IDEATION;
    } else if (session.phase === IdeationPhase.SELECTION) {
      previousPhase = IdeationPhase.SORTING;
    } else if (session.phase === IdeationPhase.COMPLETED) {
      previousPhase = IdeationPhase.SELECTION;
    } else {
      return; // Already at the first phase (IDEATION)
    }

    updatePhase({
      sessionId: session.id,
      phase: previousPhase,
    });
  };

  // Generate AI suggestions
  const generateAiSuggestions = useCallback(async () => {
    if (!session || session.ideas.length < 3) return;

    try {
      setIsLoadingAiSuggestions(true);

      // Extract the existing idea texts for sending to API
      const ideaTexts = session.ideas.map((idea) => idea.text);

      // Call our API endpoint
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sessionName: session.name,
          ideas: ideaTexts,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI suggestions");
      }

      const data = await response.json();
      setAiSuggestions(data.suggestions);
    } catch (error) {
      console.error("Failed to generate AI suggestions:", error);
      toast.error("Failed to generate AI suggestions");
    } finally {
      setIsLoadingAiSuggestions(false);
    }
  }, [session]);

  // Add AI suggestion as an idea
  const addAiSuggestionAsIdea = useCallback(
    (suggestion: string) => {
      if (!session) return;

      addIdea({
        text: suggestion,
        sessionId: session.id,
      });

      // Immediately request a single new suggestion to replace the used one
      const fetchNewSuggestion = async () => {
        try {
          // Extract the existing idea texts for sending to API
          const ideaTexts = [
            ...session.ideas.map((idea) => idea.text),
            suggestion,
          ];

          // Call our API endpoint with a specific flag to get just one suggestion
          const response = await fetch("/api/ai-suggestions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              sessionName: session.name,
              ideas: ideaTexts,
              requestSingleSuggestion: true,
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to fetch new AI suggestion");
          }

          const data = await response.json();

          // Replace the used suggestion with the new one
          setAiSuggestions((prev) => {
            const newSuggestions = [...prev];
            const index = newSuggestions.indexOf(suggestion);
            if (index !== -1 && data.suggestions.length > 0) {
              // Replace the used suggestion with a new one
              newSuggestions[index] = data.suggestions[0];
            } else if (index !== -1) {
              // If no new suggestion returned, remove the used one
              newSuggestions.splice(index, 1);
            }
            return newSuggestions;
          });
        } catch (error) {
          console.error("Failed to generate new AI suggestion:", error);
          // Still remove the used suggestion even if we fail to get a new one
          setAiSuggestions((prev) => prev.filter((s) => s !== suggestion));
        }
      };

      // Start fetching a new suggestion
      void fetchNewSuggestion();
    },
    [session, addIdea],
  );

  // Check if we should show AI suggestions (when there are at least 3 user ideas)
  useEffect(() => {
    if (
      session?.phase === IdeationPhase.IDEATION &&
      session.ideas.length >= 3 &&
      aiSuggestions.length === 0 &&
      !isLoadingAiSuggestions
    ) {
      void generateAiSuggestions();
    }
  }, [
    session?.phase,
    session?.ideas.length,
    aiSuggestions.length,
    isLoadingAiSuggestions,
    generateAiSuggestions,
  ]);

  // Add function to handle creating a new project
  const handleCreateProject = () => {
    if (!session?.winningIdea) return;

    // Encode the winning idea and session name for URL parameters
    const projectName = encodeURIComponent(session.winningIdea);
    const description = encodeURIComponent(
      `${t("based_on_session")}: ${session.name}`,
    );

    // Navigate to projects page with query parameters
    router.push(
      `/projects?createProject=true&name=${projectName}&description=${description}`,
    );
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
          {/* <p className="text-muted-foreground">
            {session.isTeam ? t("team_session") : t("solo_session")}
            {" • "}
            {t("session_id")} {session.id}
          </p> */}
        </div>

        {(session.phase === IdeationPhase.IDEATION ||
          session.phase === IdeationPhase.SORTING ||
          session.phase === IdeationPhase.SELECTION ||
          session.phase === IdeationPhase.COMPLETED) && (
          <div className="text-center">
            <div className="mb-1 font-mono text-3xl">
              {session.phase !== IdeationPhase.COMPLETED &&
                formatTime(timeRemaining)}
            </div>
            <div className="flex flex-col gap-2">
              <Badge className="border bg-transparent text-foreground">
                {session.phase === IdeationPhase.IDEATION
                  ? t("ideation_phase")
                  : session.phase === IdeationPhase.SORTING
                    ? t("sorting_phase")
                    : session.phase === IdeationPhase.SELECTION
                      ? t("selection_phase")
                      : t("completed_phase")}
              </Badge>
              <div className="flex items-center justify-center gap-2">
                <TooltipProvider>
                  {session.phase !== IdeationPhase.IDEATION && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={goToPreviousPhase}
                          className="h-8 w-8"
                        >
                          <ChevronLeft className="h-4 w-4 rtl:rotate-180" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("go_to_previous_phase")}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                  {session.phase !== IdeationPhase.COMPLETED && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          size="icon"
                          onClick={skipToNextPhase}
                          className="h-8 w-8"
                        >
                          <ChevronRight className="h-4 w-4 rtl:rotate-180" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{t("go_to_next_phase")}</p>
                      </TooltipContent>
                    </Tooltip>
                  )}
                </TooltipProvider>
              </div>
            </div>
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
                className="flex flex-col gap-2"
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
                          onKeyDown={handleKeyDown}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <LoadingButton
                  className="block"
                  type="submit"
                  loading={isSubmittingIdea}
                >
                  {t("add_idea")}
                </LoadingButton>
              </form>
            </Form>

            {/* AI Suggestions as Chips */}
            {session.ideas.length >= 3 && (
              <div className="mt-4">
                <div className="mb-2 flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">
                    {t("ai_suggestions")}
                  </span>
                </div>

                {isLoadingAiSuggestions ? (
                  <div className="flex flex-wrap gap-2">
                    <Skeleton className="h-8 w-44 rounded-full" />
                    <Skeleton className="h-8 w-52 rounded-full" />
                    <Skeleton className="h-8 w-48 rounded-full" />
                  </div>
                ) : aiSuggestions.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {aiSuggestions.map((suggestion, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="h-auto w-full max-w-full justify-start whitespace-normal break-words rounded-md border-primary/20 bg-primary/5 px-4 py-2 text-start text-sm hover:bg-primary/10 sm:max-w-[80%]"
                        onClick={() => addAiSuggestionAsIdea(suggestion)}
                      >
                        <span className="inline-block">{suggestion}</span>
                      </Button>
                    ))}
                  </div>
                ) : null}
              </div>
            )}
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
            <p className="mb-2 text-sm text-muted-foreground">
              {t("drag_to_reorder")}
            </p>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">
              {t("rank_ideas")} ({localIdeas.length})
            </h3>
            {localIdeas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_to_rank")}</p>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                modifiers={[]} // Remove any restrictive modifiers
                autoScroll={true} // Enable auto-scrolling for long lists
              >
                <SortableContext
                  items={localIdeas.map((idea) => idea.id)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-2">
                    {localIdeas.map((idea, index) => (
                      <SortableIdeaItem
                        key={idea.id}
                        idea={idea}
                        index={index}
                      />
                    ))}
                  </div>
                </SortableContext>

                <DragOverlay adjustScale={true} className="cursor-grabbing">
                  {activeId ? (
                    <Card className="select-none rounded-md border-2 border-primary bg-background p-4 shadow-lg">
                      <div className="flex items-center gap-3">
                        <Badge className="min-w-8 border bg-primary text-primary-foreground">
                          {localIdeas.findIndex(
                            (item) => item.id === activeId,
                          ) + 1}
                        </Badge>
                        <p>
                          {
                            localIdeas.find((item) => item.id === activeId)
                              ?.text
                          }
                        </p>
                      </div>
                    </Card>
                  ) : null}
                </DragOverlay>
              </DndContext>
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
            <h3 className="text-lg font-medium">{t("top_ideas")}</h3>

            {session.ideas.length === 0 ? (
              <p className="text-muted-foreground">{t("no_ideas_to_select")}</p>
            ) : (
              <div className="space-y-3">
                {session.ideas.slice(0, 10).map((idea, index) => (
                  <Card key={idea.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Badge className="border bg-transparent text-foreground">
                          {index + 1}
                        </Badge>
                        <p>{idea.text}</p>
                      </div>
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
            )}
          </div>
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

            <div className="flex">
              <Button className="flex-1" onClick={handleCreateProject}>
                {t("create_project")}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Dialog for unsubmitted idea reminder */}
      <Dialog
        open={showSubmitReminderDialog}
        onOpenChange={setShowSubmitReminderDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("time_up_title")}</DialogTitle>
            <DialogDescription>{t("unsaved_idea_prompt")}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={handleSkipRemainingIdea}
              className="sm:flex-1"
            >
              {t("discard_and_continue")}
            </Button>
            <Button onClick={handleSubmitRemainingIdea} className="sm:flex-1">
              {t("submit_and_continue")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
