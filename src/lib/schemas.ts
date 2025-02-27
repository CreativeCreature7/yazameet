import { z } from "zod";
import { Roles, ProjectType } from "@prisma/client";

export const optionRolesSchema = z.object({
  label: z.string(),
  value: z.nativeEnum(Roles),
  disable: z.boolean().optional(),
});

export const optionProjectTypeSchema = z.object({
  label: z.string(),
  value: z.nativeEnum(ProjectType),
  disable: z.boolean().optional(),
});

export const PROFILE_MAX_FILE_SIZE = 4 * 1024 * 1024;

export const profilePictureSchema = z
  .array(
    z.instanceof(File).refine((file) => file.size < PROFILE_MAX_FILE_SIZE, {
      message: "File size must be less than 1MB",
    }),
  )
  .max(1, {
    message: "Maximum 1 files is allowed",
  })
  .optional();
