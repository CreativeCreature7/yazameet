import { createTRPCRouter, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { env } from "@/env";

export const adminRouter = createTRPCRouter({
  getStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.session.user.email !== env.ADMIN_EMAIL) {
      throw new TRPCError({ code: "UNAUTHORIZED" });
    }

    const [usersCount, projectsCount, postsCount, pendingRequestsCount] =
      await Promise.all([
        ctx.db.user.count(),
        ctx.db.project.count(),
        ctx.db.blogPost.count(),
        ctx.db.contactRequest.count(),
      ]);

    return {
      usersCount,
      projectsCount,
      postsCount,
      pendingRequestsCount,
    };
  }),
});
