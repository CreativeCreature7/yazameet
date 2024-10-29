import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ProjectType, Roles } from "@prisma/client";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        rolesNeeded: z.array(z.nativeEnum(Roles)),
        type: z.array(z.nativeEnum(ProjectType)),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          rolesNeeded: input.rolesNeeded,
          type: input.type,
          createdBy: { connect: { id: ctx.session.user.id } },
        },
      });
    }),

  infiniteProjects: publicProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).nullish(),
        cursor: z.number().nullish(),
        query: z.string().nullish(),
        types: z.array(z.nativeEnum(ProjectType)).optional(),
        roles: z.array(z.nativeEnum(Roles)).optional(),
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
        where: {
          AND: [
            {
              OR: [
                { name: { contains: input.query ?? "", mode: "insensitive" } },
                {
                  description: {
                    contains: input.query ?? "",
                    mode: "insensitive",
                  },
                },
              ],  
            },
            input.types && input.types.length > 0
              ? { type: { hasSome: input.types } }
              : {},
            input.roles && input.roles.length > 0
              ? { rolesNeeded: { hasSome: input.roles } }
              : {},
          ],
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
