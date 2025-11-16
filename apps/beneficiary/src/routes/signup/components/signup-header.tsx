import { useNavigate } from "@tanstack/react-router";
import { useTranslation } from "react-i18next";

import { Button } from "@congress/ui/button";

export function SignupHeader() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-2xl font-semibold">{t("signup_title")}</h1>
        <p className="text-muted-foreground text-sm">
          {t("signup_subtitle")}
        </p>
      </div>
      <Button
        variant="ghost"
        onClick={() => {
          void navigate({
            to: "/login",
            search: { nationalId: undefined },
          });
        }}
      >
        {t("back_to_login")}
      </Button>
    </header>
  );
}
