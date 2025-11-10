import { createFileRoute } from "@tanstack/react-router";

import { dashboardAuth } from "@congress/auth";

export const Route = createFileRoute("/api/auth/$")({
  server: {
    handlers: {
      GET: ({ request }) => dashboardAuth.handler(request),
      POST: ({ request }) => dashboardAuth.handler(request),
    },
  },
});
