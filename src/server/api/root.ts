import { projectRouter } from "@/server/api/routers/project";
import { createCallerFactory, createTRPCRouter } from "@/server/api/trpc";
import { userRouter } from "@/server/api/routers/user";
import { profileRouter } from "@/server/api/routers/profile";
import { mediaRouter } from "@/server/api/routers/media";
import { blogRouter } from "@/server/api/routers/blog";
import { adminRouter } from "@/server/api/routers/admin";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  project: projectRouter,
  user: userRouter,
  profile: profileRouter,
  media: mediaRouter,
  blog: blogRouter,
  admin: adminRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
