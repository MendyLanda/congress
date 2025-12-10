/// <reference types="vite/client" />
import type { QueryClient } from "@tanstack/react-query";
import type * as React from "react";
import {
  createRootRouteWithContext,
  HeadContent,
  Outlet,
  Scripts,
} from "@tanstack/react-router";
import { Direction } from "radix-ui";
import { useTranslation } from "react-i18next";

import { Toaster } from "@congress/ui/toast";

import type { orpc } from "~/lib/orpc";
import { BeneficiaryAuthProvider } from "~/lib/beneficiary-auth-provider";
import { getDirection, setSSRLanguage } from "~/lib/i18n";
import appCss from "~/styles.css?url";

import "@fontsource-variable/rubik";

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient;
  orpc: typeof orpc;
}>()({
  beforeLoad: async () => {
    await setSSRLanguage();
  },
  head: () => ({
    meta: [
      { name: "font-family", content: "Rubik Variable" },
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootComponent() {
  return (
    <RootDocument>
      <BeneficiaryAuthProvider>
        <Outlet />
      </BeneficiaryAuthProvider>
    </RootDocument>
  );
}

function RootDocument({ children }: { children: React.ReactNode }) {
  const { i18n } = useTranslation();
  const dir = getDirection(i18n.language);

  return (
    <Direction.Provider dir={dir}>
      <html lang={i18n.language} dir={dir} suppressHydrationWarning>
        <head>
          <HeadContent />
        </head>
        <body className="bg-background text-foreground min-h-screen font-sans antialiased">
          {children}
          <div className="absolute right-4 bottom-12"></div>
          <Toaster />
          {/* <TanStackDevtools plugins={[FormDevtoolsPlugin()]} />
          <TanStackRouterDevtools position="bottom-right" /> */}
          <Scripts />
        </body>
      </html>
    </Direction.Provider>
  );
}

function NotFoundComponent() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="text-muted-foreground mt-4 text-lg">
        {t("notFound", "Page not found")}
      </p>
    </div>
  );
}
