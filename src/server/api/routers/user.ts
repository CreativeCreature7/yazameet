import { z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Roles, Year } from "@prisma/client";

export const userRouter = createTRPCRouter({
  addDetails: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        profilePicture: z.string().min(1),
        year: z.nativeEnum(Year),
        roles: z.array(z.nativeEnum(Roles)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.fullName,
          image: input.profilePicture,
          roles: input.roles,
          year: input.year,
        },
      });
    }),
  getLatestUsers: publicProcedure.query(({ ctx }) => {
    return ctx.db.user.findMany({
      take: 6,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        name: true,
        year: true,
        image: true,
      },
      where: {
        image: {
          not: null,
        },
      },
    });
  }),

  getCurrentUser: protectedProcedure.query(({ ctx }) => {
    return ctx.db.user.findUnique({
      where: { id: ctx.session.user.id },
      select: {
        name: true,
        image: true,
        roles: true,
        year: true,
      },
    });
  }),
  updateDetails: protectedProcedure
    .input(
      z.object({
        fullName: z.string().min(1),
        profilePicture: z.string().min(1),
        year: z.nativeEnum(Year),
        roles: z.array(z.nativeEnum(Roles)).min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.fullName,
          image: input.profilePicture,
          roles: input.roles,
          year: input.year,
        },
      });
    }),
});
