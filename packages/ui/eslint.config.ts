import { baseConfig } from "@congress/eslint-config/base";
import { reactConfig } from "@congress/eslint-config/react";
import { defineConfig } from "eslint/config";

export default defineConfig(
  {
    ignores: ["dist/**"],
  },
  baseConfig,
  reactConfig,
);
