import { trpcServer } from "@hono/trpc-server"; // Deno 'npm:@hono/trpc-server'

import { Hono } from "hono";
import { cors } from "hono/cors";

import { betterUploadRouter, handleBetterUploadRequest } from "./better-upload";
import { dashboardAuth } from "./dashboard-auth";
import { isProd } from "./is-prod";
import { appRouter } from "./root";
import { createTRPCContext } from "./trpc";

const prodOrigins = ["https://app.bucharim.com", "https://my.bucharim.com"];
const devOrigins = ["http://localhost:3001", "http://localhost:3002"];

const app = new Hono();

app.use(
  "*",
  cors({
    origin: isProd ? prodOrigins : devOrigins,
    allowHeaders: [
      "Content-Type",
      "Authorization",
      "trpc-accept",
      "x-trpc-source",
    ],
    allowMethods: ["POST", "GET", "OPTIONS", "DELETE", "PUT", "PATCH", "HEAD"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
    credentials: true,
  }),
);

app.on(["POST", "GET"], "/auth/*", (c) => {
  return dashboardAuth.handler(c.req.raw);
});

app.use(
  "/trpc/*",
  trpcServer({
    router: appRouter,
    createContext(_, c) {
      return createTRPCContext({
        auth: dashboardAuth,
        hono: c,
      });
    },
    onError({ error, path }) {
      console.error(`>>> tRPC Error on '${path}'`, error);
    },
  }),
);

app.post("/upload", (c) => {
  return handleBetterUploadRequest(c.req.raw, betterUploadRouter);
});

export default app;
