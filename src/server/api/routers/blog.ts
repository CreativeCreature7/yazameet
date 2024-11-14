import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";
import { Prisma } from "@prisma/client";

export const blogRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        slug: z.string().min(1),
        published: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.email !== env.ADMIN_EMAIL) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const post = await ctx.db.blogPost.create({
        data: input,
      });

      return post;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        title: z.string().min(1),
        content: z.string().min(1),
        slug: z.string().min(1),
        published: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.email !== env.ADMIN_EMAIL) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      const { id, ...data } = input;
      return ctx.db.blogPost.update({
        where: { id },
        data,
      });
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.session.user.email !== env.ADMIN_EMAIL) {
        throw new TRPCError({ code: "UNAUTHORIZED" });
      }

      return ctx.db.blogPost.delete({
        where: { id: input.id },
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.email !== env.ADMIN_EMAIL) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    return ctx.db.blogPost.findMany({
      orderBy: { createdAt: "desc" },
    });
  }),

  getPublished: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.blogPost.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
    });
  }),

  getBySlug: protectedProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.blogPost.findUnique({ where: { slug: input.slug } });
    }),
});
