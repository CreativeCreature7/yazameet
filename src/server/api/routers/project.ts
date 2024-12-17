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
import { TRPCError } from "@trpc/server";

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
      return ctx.db.collaborationRequest.findUnique({
        where: {
          projectId_userId: {
            projectId: input.projectId,
            userId: ctx.session.user.id,
          },
        },
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
  submitContactRequest: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
        notes: z.string(),
        purpose: z.string(),
        roles: z.array(z.nativeEnum(Roles)),
        cv: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { projectId, notes, purpose, roles, cv } = input;

      // Check if project exists
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
        include: {
          createdBy: true,
        },
      });

      if (!project) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Project not found",
        });
      }
      const existingRequest = await ctx.db.contactRequest.findFirst({
        where: {
          projectId,
          userId: ctx.session.user.id,
        },
      });

      if (existingRequest) {
        throw new TRPCError({
          code: "CONFLICT",
          message: "You already have a pending request for this project",
        });
      }

      // Create contact request
      const contactRequest = await ctx.db.contactRequest.create({
        data: {
          notes,
          purpose,
          cvUrl: cv,
          roles,
          project: {
            connect: { id: projectId },
          },
          user: {
            connect: { id: ctx.session.user.id },
          },
        },
        include: {
          user: true,
        },
      });

      // Send email notification to project owner
      await sendEmail({
        to: project.createdBy.email!,
        subject: `New Contact Request for ${project.name}`,
        react: NewRequestEmail({
          projectName: project.name,
          requesterName: contactRequest.user.name!,
          requestUrl: `/dashboard/requests`,
        }),
      });

      return contactRequest;
    }),

  getContactRequests: protectedProcedure
    .input(
      z.object({
        projectId: z.number(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectId } = input;

      // Verify user is project owner
      const project = await ctx.db.project.findUnique({
        where: { id: projectId },
      });

      if (!project || project.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to view these requests",
        });
      }

      return ctx.db.contactRequest.findMany({
        where: {
          projectId,
        },
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
        orderBy: {
          createdAt: "desc",
        },
      });
    }),

  updateContactRequestStatus: protectedProcedure
    .input(
      z.object({
        requestId: z.number(),
        status: z.enum(["APPROVED", "REJECTED"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { requestId, status } = input;

      const request = await ctx.db.contactRequest.findUnique({
        where: { id: requestId },
        include: {
          project: true,
        },
      });

      if (!request) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Request not found",
        });
      }

      // Verify user is project owner
      if (request.project.createdById !== ctx.session.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You don't have permission to update this request",
        });
      }

      return ctx.db.contactRequest.update({
        where: { id: requestId },
        data: { status },
      });
    }),

  getMyProjects: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.project.findMany({
      where: {
        createdById: ctx.session.user.id,
      },
      select: {
        id: true,
        name: true,
      },
    });
  }),

  getAllContactRequests: protectedProcedure
    .input(
      z.object({
        projectIds: z.array(z.number()),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { projectIds } = input;

      // Verify user owns all projects
      const projects = await ctx.db.project.findMany({
        where: {
          id: { in: projectIds },
          createdById: ctx.session.user.id,
        },
        select: { id: true },
      });

      const authorizedProjectIds = projects.map((p) => p.id);

      return ctx.db.contactRequest.findMany({
        where: {
          projectId: { in: authorizedProjectIds },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });
    }),
});
