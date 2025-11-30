import { onError } from "@orpc/server";
import { RPCHandler } from "@orpc/server/fetch";
import { createFileRoute } from "@tanstack/react-router";

import { appRouter, createORPCContext } from "@congress/api";
import { dashboardAuth } from "@congress/auth";

const handler = new RPCHandler(appRouter, {
  interceptors: [
    onError((error) => {
      console.error(`>>> oRPC Error`, error);
    }),
  ],
});

export const Route = createFileRoute("/api/orpc/$")({
  server: {
    handlers: {
      ANY: async ({ request }) => {
        const { response } = await handler.handle(request, {
          prefix: "/api/orpc",
          context: await createORPCContext({
            auth: dashboardAuth,
            headers: request.headers,
          }),
        });

        return response ?? new Response("Not found", { status: 404 });
      },
    },
  },
});
