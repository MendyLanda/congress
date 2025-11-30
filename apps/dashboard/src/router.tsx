import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { setupRouterSsrQueryIntegration } from "@tanstack/react-router-ssr-query";

import { orpc, orpcClient } from "~/lib/orpc";
import { routeTree } from "./routeTree.gen";

import "~/lib/i18n";

export function getRouter() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // > 0 to prevent immediate refetching on mount
      },
    },
  });

  const router = createRouter({
    routeTree,
    context: { queryClient, orpc },
    defaultPreload: "intent",
    Wrap: (props) => <>{props.children}</>,
  });
  setupRouterSsrQueryIntegration({
    router,
    queryClient,
  });

  return router;
}

declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
}
