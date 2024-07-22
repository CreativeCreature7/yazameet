import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { S3 } from "aws-sdk";

const s3 = new S3({
  accessKeyId: env.S3_ACCESS_KEY,
  secretAccessKey: env.S3_SECRET_KEY,
  region: env.S3_REGION,
});

export const mediaRouter = createTRPCRouter({
  getPresignedUrl: protectedProcedure
    .input(
      z.object({
        fileName: z.string().min(1),
        fileType: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { fileName, fileType } = input;
      const params = {
        Bucket: env.S3_BUCKET_NAME,
        Key: `${ctx.session.user.id}/${crypto.randomUUID()}`,
        Expires: 60,
        ContentType: fileType,
      };
      const uploadURL = await s3.getSignedUrlPromise("putObject", params);

      return { uploadURL };
    }),
});
