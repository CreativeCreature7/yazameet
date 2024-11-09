import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { env } from "@/env";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const s3 = new S3Client({
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY,
    secretAccessKey: env.S3_SECRET_KEY,
  },
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
        ContentType: fileType,
      };
      const uploadURL = await getSignedUrl(s3, new PutObjectCommand(params), {
        expiresIn: 60,
      });

      return { uploadURL };
    }),
});
