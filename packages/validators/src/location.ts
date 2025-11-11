import { z } from "zod/v4";

export const citySearchSchema = z
  .object({
    search: z.string().trim().max(100).optional(),
  })
  .optional()
  .default({});

export const streetSearchSchema = z.object({
  cityCode: z.number().int().positive(),
  search: z.string().trim().max(100).optional(),
});
