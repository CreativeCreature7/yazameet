import { nativeEnum, z } from "zod";

import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import { Roles, Year } from "@prisma/client";
import { optionRolesSchema, profilePictureSchema } from "@/lib/schemas";

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
      // TODO: handle image upload to s3 bucket
      console.log("hello");
      console.log(ctx);
      return ctx.db.user.update({
        where: {
          id: ctx.session.user.id,
        },
        data: {
          name: input.fullName,
          image:
            "https://images.unsplash.com/photo-1599566150163-29194dcaad36?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=3387&q=80",
          roles: input.roles,
          year: input.year,
        },
      });
    }),
});
