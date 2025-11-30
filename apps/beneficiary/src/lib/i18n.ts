import { createIsomorphicFn } from "@tanstack/react-start";
import { getCookie } from "@tanstack/react-start/server";
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import enLogin from "../../../../locals/en/login.json";
import enTranslation from "../../../../locals/en/translation.json";
import heLogin from "../../../../locals/he/login.json";
import heTranslation from "../../../../locals/he/translation.json";

export const resources = {
  en: {
    translation: enTranslation,
    login: enLogin,
  },
  he: {
    translation: heTranslation,
    login: heLogin,
  },
} as const;

export const defaultNS = "translation";

const i18nCookieName = "i18nextLng";

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    defaultNS,
    fallbackLng: "he",
    supportedLngs: ["he", "en"],
    detection: {
      order: ["cookie"],
      lookupCookie: i18nCookieName,
      caches: ["cookie"],
      cookieMinutes: 60 * 24 * 365,
    },
    interpolation: { escapeValue: false },
  });

export const setSSRLanguage = createIsomorphicFn().server(async () => {
  const language = getCookie(i18nCookieName);
  await i18n.changeLanguage(language ?? "en");
});

export default i18n;
