import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { ProjectType, Roles } from "@prisma/client";
import { sendEmail } from "@/lib/email";
import NewRequestEmail from "@/components/emails/new-request";
import ApprovedRequestEmail from "@/components/emails/approved-request";
import RejectedRequestEmail from "@/components/emails/rejected-request";
import { inngest } from "@/lib/inngest";
import { Event_NEW_PROJECT } from "@/inngest/functions";

export const projectRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1),
        description: z.string().min(1),
        rolesNeeded: z.array(z.nativeEnum(Roles)),
        type: z.array(z.nativeEnum(ProjectType)),
        id: z.number().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.id) {
        return ctx.db.project.update({
          where: { id: input.id },
          data: {
            name: input.name,
            description: input.description,
            rolesNeeded: input.rolesNeeded,
            type: input.type,
          },
          select: {
            id: true,
            name: true,
            description: true,
            rolesNeeded: true,
            type: true,
          },
        });
      } else {
        const project = await ctx.db.project.create({
          data: {
            name: input.name,
            description: input.description,
            rolesNeeded: input.rolesNeeded,
            type: input.type,
            createdBy: { connect: { id: ctx.session.user.id } },
          },
          select: {
            id: true,
            name: true,
            description: true,
            rolesNeeded: true,
            type: true,
          },
        });

        if (process.env.NODE_ENV === "production") {
          void inngest
            .send({
              name: Event_NEW_PROJECT,
              data: {
                roles: input.rolesNeeded,
                url: `https://yazameet.vercel.app/projects/`,
              },
            })
            .catch(console.error);
        }

        return project;
      }
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
          collaborators: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          CollaborationRequest: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  image: true,
                  email: true,
                },
              },
            },
          },
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

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.collaborationRequest.deleteMany({
        where: { projectId: input.id },
      });

      // Then delete the project
      return ctx.db.project.delete({
        where: { id: input.id },
      });
    }),
  requestCollaboration: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: { createdBy: true },
      });

      if (!project) throw new Error("Project not found");

      await ctx.db.collaborationRequest.create({
        data: {
          projectId: input.id,
          userId: ctx.session.user.id,
        },
      });

      if (process.env.NODE_ENV === "production") {
        await sendEmail({
          to: project.createdBy.email!,
          subject: "New Collaboration Request",
          react: NewRequestEmail({
            projectName: project.name,
            requesterName: ctx.session.user.name!,
            requestUrl: `https://yazameet.vercel.app/request/${project.id}`,
          }),
        });
      }

      return { success: true };
    }),
  getRequestStatus: protectedProcedure
    .input(z.object({ projectId: z.number() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.collaborationRequest.findFirst({
        where: { projectId: input.projectId, userId: ctx.session.user.id },
      });
    }),
  updateRequest: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        status: z.enum(["APPROVED", "REJECTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const request = await ctx.db.collaborationRequest.findUnique({
        where: { id: input.id },
        include: { project: true, user: true },
      });

      if (!request) {
        throw new Error("Request not found");
      }

      // Check if user is project owner
      if (request.project.createdById !== ctx.session.user.id) {
        throw new Error("Unauthorized");
      }

      const updatedRequest = await ctx.db.collaborationRequest.update({
        where: { id: input.id },
        data: { status: input.status },
      });

      // If approved, add user as collaborator
      if (input.status === "APPROVED") {
        await ctx.db.project.update({
          where: { id: request.projectId },
          data: {
            collaborators: {
              connect: { id: request.userId },
            },
          },
        });
        if (process.env.NODE_ENV === "production") {
          await sendEmail({
            to: request.user.email!,
            subject: `Great News, ${request.project.name} 🎉 From Yazameet`,
            react: ApprovedRequestEmail({
              projectName: request.project.name,
              requesterName: ctx.session.user.name!,
            }),
          });
        }
      }
      if (input.status === "REJECTED") {
        if (process.env.NODE_ENV === "production") {
          await sendEmail({
            to: request.user.email!,
            subject: `Update on Your Request to: ${request.project.name}`,
            react: RejectedRequestEmail({
              projectName: request.project.name,
              requesterName: ctx.session.user.name!,
            }),
          });
        }
      }

      return updatedRequest;
    }),
});
