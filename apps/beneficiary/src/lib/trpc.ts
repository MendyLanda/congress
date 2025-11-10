import {
  createTRPCClient,
  httpBatchLink,
  httpBatchStreamLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCContext } from "@trpc/tanstack-react-query";
import SuperJSON from "superjson";

import type { AppRouter } from "@congress/api/types";

import { env } from "~/env";

export const trpcClient = createTRPCClient<AppRouter>({
  links: [
    loggerLink({
      enabled: (op) =>
        env.NODE_ENV === "development" ||
        (op.direction === "down" && op.result instanceof Error),
    }),
    splitLink({
      condition(op) {
        // Use httpBatchLink (non-streaming) for auth routes that need to set cookies
        return op.path.startsWith("beneficiaryAuth.");
      },
      true: httpBatchLink({
        transformer: SuperJSON,
        url: env.VITE_API_URL + "/trpc",
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include", // Include cookies in requests
          });
        },
        headers() {
          const headers = new Headers();
          headers.set("x-trpc-source", "beneficiary-app");
          return headers;
        },
      }),
      false: httpBatchStreamLink({
        transformer: SuperJSON,
        url: env.VITE_API_URL + "/trpc",
        fetch(url, options) {
          return fetch(url, {
            ...options,
            credentials: "include", // Include cookies in requests
          });
        },
        headers() {
          const headers = new Headers();
          headers.set("x-trpc-source", "beneficiary-app");
          return headers;
        },
      }),
    }),
  ],
});

export const { useTRPC, TRPCProvider } = createTRPCContext<AppRouter>();
