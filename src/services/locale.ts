"use server";

import { cookies } from "next/headers";
import { headers } from "next/headers";
import { Locale, defaultLocale, locales } from "@/i18n-config";

const COOKIE_NAME = "NEXT_LOCALE";

export async function detectBrowserLocale(): Promise<Locale> {
  try {
    const headersList = headers();
    const acceptLanguage = headersList.get("accept-language");

    if (!acceptLanguage) return defaultLocale;

    const browserLocale = acceptLanguage?.split(",")[0]?.split("-")[0];

    return locales.includes(browserLocale as Locale)
      ? (browserLocale as Locale)
      : defaultLocale;
  } catch {
    return defaultLocale;
  }
}

export async function getUserLocale() {
  const cookieLocale = cookies().get(COOKIE_NAME)?.value;
  if (cookieLocale) return cookieLocale;

  return detectBrowserLocale();
}

export async function setUserLocale(locale: Locale) {
  cookies().set(COOKIE_NAME, locale);
}
