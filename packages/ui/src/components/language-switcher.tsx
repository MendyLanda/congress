"use client";

import { LanguagesIcon } from "lucide-react";
import { useTranslation } from "react-i18next";

import { cn } from "../lib/utils";
import { Button } from "./button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const languages = [
  { code: "en", label: "English", selectedLabel: "EN" },
  { code: "he", label: "עברית", selectedLabel: "עברית" },
  // { code: "ru", label: "Русский" },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language.split("-")[0] ?? "he";

  const handleLanguageChange = (langCode: string) => {
    void i18n.changeLanguage(langCode);
  };

  const currentLang = languages.find((lang) => lang.code === currentLanguage)!;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("text-background gap-2 bg-inherit", className)}
          aria-label="Change language"
        >
          <LanguagesIcon className="size-4" />
          <span className="uppercase">{currentLang.selectedLabel}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => handleLanguageChange(lang.code)}
            className={cn(
              "cursor-pointer",
              currentLanguage === lang.code && "bg-accent",
            )}
          >
            {lang.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
