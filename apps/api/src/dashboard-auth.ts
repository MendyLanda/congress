import type { DashboardAuth } from "@congress/auth";
import { initAuth } from "@congress/auth";

import { env } from "../env";

export const dashboardAuth = initAuth({
  baseUrl: env.VERCEL_URL ?? "http://localhost:3000",
  productionUrl: env.VERCEL_URL ?? "http://localhost:3000",
  secret: env.AUTH_SECRET,
  extraPlugins: [],
}) as DashboardAuth;
