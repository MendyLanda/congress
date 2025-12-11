import type { TFunction } from "i18next";
import { createFileRoute } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@congress/ui/button";

import { useBeneficiaryAuth } from "~/lib/beneficiary-auth-provider";

export const Route = createFileRoute("/_authed/dashboard")({
  component: Dashboard,
});

function getGreeting(t: TFunction, firstName: string) {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) {
    return t("good_morning", { firstName });
  } else if (hour >= 12 && hour < 17) {
    return t("good_noon", { firstName });
  } else {
    return t("good_evening", { firstName });
  }
}

function Dashboard() {
  const { session } = useBeneficiaryAuth();
  const { t } = useTranslation();

  if (!session) {
    return (
      <main className="container flex h-screen items-center justify-center py-16">
        <div>{t("loading")}</div>
      </main>
    );
  }

  const firstName = session.person.firstName || "";

  return (
    <main className="container h-screen py-16">
      <div className="flex flex-col gap-4">
        <div className="flex w-full items-center justify-between">
          {firstName && (
            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              {getGreeting(t, session.person.firstName ?? "")}
            </h1>
          )}
        </div>
        {session.account.status === "pending" && (
          <div className="w-full max-w-2xl rounded-lg border border-yellow-500 bg-yellow-50 p-4 text-yellow-800">
            <p className="font-semibold">{t("account_pending_verification")}</p>
            <p className="text-sm">{t("account_pending_message")}</p>
          </div>
        )}

        {/* Dashboard content will be added here */}
        {/* <div className="w-full max-w-2xl">
          <p className="text-muted-foreground">
            {t("dashboard_welcome_message")}
          </p>
        </div> */}
      </div>
    </main>
  );
}
