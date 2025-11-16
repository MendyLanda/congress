import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { SquareLogo } from "@congress/ui/square-logo";
import { WideLogo } from "@congress/ui/wide-logo";

interface SignupLayoutProps {
  children: ReactNode;
}

export function SignupLayout({ children }: SignupLayoutProps) {
  const { t } = useTranslation();

  return (
    <main className="bg-primary flex min-h-screen">
      {/* Mobile Logo - Fixed at top */}
      <div className="bg-primary fixed top-0 z-10 flex w-full justify-center px-4 py-8 lg:hidden">
        <WideLogo
          className="text-background w-3/4 max-w-72"
          aria-label={t("beneficiary_logo_alt")}
        />
      </div>

      {/* Left side - Form Card */}
      <div className="flex flex-1 items-center justify-center px-4 py-8 pt-32 lg:pt-8">
        <div className="h-full w-full max-w-2xl">
          <div className="bg-background relative z-20 w-full space-y-8 rounded-3xl p-8 shadow-xl">
            {children}
          </div>
        </div>
      </div>

      {/* Right side - Logo and Branding */}
      <div className="hidden lg:flex lg:w-1/2 lg:flex-col lg:items-center lg:justify-center lg:px-12">
        <div className="fixed end-0 top-0 flex h-full w-1/2 items-center justify-center">
          <SquareLogo
            className="text-background size-1/4 max-w-48"
            aria-label={t("beneficiary_logo_alt")}
          />
        </div>
      </div>
    </main>
  );
}
