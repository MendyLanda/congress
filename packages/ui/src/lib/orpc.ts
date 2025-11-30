import type { RouterClient } from "@orpc/server";
import type * as React from "react";
import { createORPCClient } from "@orpc/client";
import { RPCLink } from "@orpc/client/fetch";
import { createTanstackQueryUtils } from "@orpc/tanstack-query";
import { createIsomorphicFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";

import type { AppRouter } from "@congress/api";

import { getBaseUrl } from "../lib/url";

const getORPCClient = createIsomorphicFn()
  .server((): RouterClient<AppRouter> => {
    // Use HTTP link on server to go through route handler for proper context
    const link = new RPCLink({
      url: getBaseUrl() + "/api/orpc",
      headers: () => {
        const headers = getRequestHeaders();
        headers.set("x-orpc-source", "server-app");
        return headers;
      },
    });

    return createORPCClient(link);
  })
  .client((): RouterClient<AppRouter> => {
    const link = new RPCLink({
      url: getBaseUrl() + "/api/orpc",
      headers() {
        const headers = new Headers();
        headers.set("x-orpc-source", "client-app");
        return headers;
      },
    });

    return createORPCClient(link);
  });

export const orpcClient: RouterClient<AppRouter> = getORPCClient();

export const orpc = createTanstackQueryUtils(orpcClient);
