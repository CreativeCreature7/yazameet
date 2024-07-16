import { z } from "zod";
import { Roles } from "@prisma/client";

export const optionRolesSchema = z.object({
  label: z.string(),
  value: z.nativeEnum(Roles),
  disable: z.boolean().optional(),
});

export const PROFILE_MAX_FILE_SIZE = 1 * 1024 * 1024;

export const profilePictureSchema = z
  .array(
    z.instanceof(File).refine((file) => file.size < PROFILE_MAX_FILE_SIZE, {
      message: "File size must be less than 1MB",
    }),
  )
  .min(1, {
    message: "profile picture is required",
  })
  .max(1, {
    message: "Maximum 1 files is allowed",
  });
