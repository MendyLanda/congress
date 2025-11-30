import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function transactionalEnv() {
  return createEnv({
    server: {
      YEMOT_API_KEY: z.string(),
      NODE_ENV: z.enum(["development", "production"]).optional(),
    },
    runtimeEnv: process.env,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}

export const env = transactionalEnv();
