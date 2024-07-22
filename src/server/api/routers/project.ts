import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Roles } from "@prisma/client";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        rolesNeeded: z.array(z.nativeEnum(Roles)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // simulate a slow db call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      return ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          rolesNeeded: input.rolesNeeded,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  infiniteProjects: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const limit = input.limit ?? 50;
      const { cursor } = input;
      const items = await ctx.db.project.findMany({
        take: limit + 1,
        cursor: cursor ? { id: cursor } : undefined,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          collaborators: true,
          createdBy: true,
        },
      });
      let nextCursor: typeof cursor | undefined = undefined;
      if (items.length > limit) {
        const nextItem = items.pop();
        nextCursor = nextItem!.id;
      }

      const itemsWithAllCollaborators = items.map((project) => ({
        ...project,
        collaborators: [project.createdBy, ...project.collaborators],
      }));

      return {
        items: itemsWithAllCollaborators,
        nextCursor,
      };
    }),

  getProject: publicProcedure
    .input(
      z.object({
        id: z.number().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;
      const project = await ctx.db.project.findUnique({
        where: {
          id,
        },
        include: {
          collaborators: true,
          createdBy: true,
        },
      });
      if (!project) return null;

      return {
        ...project,
        collaborators: [project.createdBy, ...project.collaborators],
      };
    }),

  addCollaborator: protectedProcedure
    .input(
      z.object({
        id: z.number().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;
      const project = await ctx.db.project.update({
        where: {
          id,
        },
        data: {
          collaborators: {
            connect: { id: ctx.session?.user.id },
          },
        },
      });

      return project;
    }),
});
