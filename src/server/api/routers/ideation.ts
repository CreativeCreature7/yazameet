import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { IdeationPhase } from "@prisma/client";
import { TRPCError } from "@trpc/server";

// Schema for creating/updating an ideation session
const ideationSessionSchema = z.object({
  name: z.string().min(1, "Session name is required"),
  isTeam: z.boolean().default(false),
});

// Schema for creating an idea
const ideaSchema = z.object({
  text: z.string().min(1, "Idea text is required"),
  sessionId: z.string(),
});

// Schema for updating idea ranks
const updateIdeaRanksSchema = z.object({
  sessionId: z.string(),
  ideas: z.array(
    z.object({
      id: z.string(),
      rank: z.number(),
    }),
  ),
});

// Schema for selecting a winning idea
const selectWinningIdeaSchema = z.object({
  sessionId: z.string(),
  ideaId: z.string(),
});

// Schema for updating session phase
const updateSessionPhaseSchema = z.object({
  sessionId: z.string(),
  phase: z.nativeEnum(IdeationPhase),
});

export const ideationRouter = createTRPCRouter({
  // Create a new ideation session
  create: protectedProcedure
    .input(ideationSessionSchema)
    .mutation(async ({ ctx, input }) => {
      return ctx.db.ideationSession.create({
        data: {
          name: input.name,
          isTeam: input.isTeam,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  // Get all ideation sessions for the current user
  getUserSessions: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.ideationSession.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      include: {
        ideas: {
          select: {
            id: true,
          },
        },
      },
    });
  }),

  // Get a single ideation session by ID with its ideas
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const session = await ctx.db.ideationSession.findUnique({
        where: {
          id: input.id,
        },
        include: {
          ideas: {
            orderBy: {
              rank: "asc",
            },
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                },
              },
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ideation session not found",
        });
      }

      // Verify user has access to this session
      if (session.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      return session;
    }),

  // Add a new idea to a session
  addIdea: protectedProcedure
    .input(ideaSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if the session exists and user has access
      const session = await ctx.db.ideationSession.findUnique({
        where: {
          id: input.sessionId,
        },
        select: {
          createdById: true,
          phase: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ideation session not found",
        });
      }

      if (session.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      // Can only add ideas during the ideation phase
      if (session.phase !== IdeationPhase.IDEATION) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Ideas can only be added during the ideation phase",
        });
      }

      return ctx.db.idea.create({
        data: {
          text: input.text,
          session: { connect: { id: input.sessionId } },
          user: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  // Update idea ranks for the sorting phase
  updateIdeaRanks: protectedProcedure
    .input(updateIdeaRanksSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if the session exists and user has access
      const session = await ctx.db.ideationSession.findUnique({
        where: {
          id: input.sessionId,
        },
        select: {
          createdById: true,
          phase: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ideation session not found",
        });
      }

      if (session.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      // Can only update ranks during the sorting phase
      if (session.phase !== IdeationPhase.SORTING) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Idea ranks can only be updated during the sorting phase",
        });
      }

      // Update each idea's rank
      const updates = input.ideas.map((idea) =>
        ctx.db.idea.update({
          where: { id: idea.id },
          data: { rank: idea.rank },
        }),
      );

      return ctx.db.$transaction(updates);
    }),

  // Select a winning idea
  selectWinningIdea: protectedProcedure
    .input(selectWinningIdeaSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if the session exists and user has access
      const session = await ctx.db.ideationSession.findUnique({
        where: {
          id: input.sessionId,
        },
        select: {
          createdById: true,
          phase: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ideation session not found",
        });
      }

      if (session.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      // Can only select a winner during the selection phase
      if (session.phase !== IdeationPhase.SELECTION) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Winner can only be selected during the selection phase",
        });
      }

      // Get the winning idea's text
      const idea = await ctx.db.idea.findUnique({
        where: { id: input.ideaId },
        select: { text: true },
      });

      if (!idea) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Idea not found",
        });
      }

      // Update the idea to mark it as winner
      await ctx.db.idea.update({
        where: { id: input.ideaId },
        data: { isWinner: true },
      });

      // Update the session with the winning idea and set phase to completed
      return ctx.db.ideationSession.update({
        where: { id: input.sessionId },
        data: {
          winningIdea: idea.text,
          phase: IdeationPhase.COMPLETED,
        },
      });
    }),

  // Update the phase of a session
  updatePhase: protectedProcedure
    .input(updateSessionPhaseSchema)
    .mutation(async ({ ctx, input }) => {
      // Check if the session exists and user has access
      const session = await ctx.db.ideationSession.findUnique({
        where: {
          id: input.sessionId,
        },
        select: {
          createdById: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ideation session not found",
        });
      }

      if (session.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      return ctx.db.ideationSession.update({
        where: { id: input.sessionId },
        data: { phase: input.phase },
      });
    }),

  // Delete an ideation session
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if the session exists and user has access
      const session = await ctx.db.ideationSession.findUnique({
        where: {
          id: input.id,
        },
        select: {
          createdById: true,
        },
      });

      if (!session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Ideation session not found",
        });
      }

      if (session.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have access to this session",
        });
      }

      return ctx.db.ideationSession.delete({
        where: { id: input.id },
      });
    }),
});
