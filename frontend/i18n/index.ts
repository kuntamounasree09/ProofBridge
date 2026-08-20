import en from "./locales/en.json";
import hi from "./locales/hi.json";

export type Locale = "en" | "hi";

export const locales: Locale[] = ["en", "hi"];

export const localeNames: Record<Locale, string> = {
  en: "English",
  hi: "हिन्दी",
};

const dictionaries: Record<Locale, typeof en> = { en, hi };

type NestedKeyOf<T, Prefix extends string = ""> = T extends object
  ? {
      [K in keyof T & string]: T[K] extends object
        ? NestedKeyOf<T[K], `${Prefix}${K}.`>
        : `${Prefix}${K}`;
    }[keyof T & string]
  : never;

export type TranslationKey = NestedKeyOf<typeof en>;

function getNestedValue(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let current: unknown = obj;

  for (const key of keys) {
    if (current && typeof current === "object" && key in current) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path;
    }
  }

  return typeof current === "string" ? current : path;
}

export function translate(
  locale: Locale,
  key: TranslationKey,
  params?: Record<string, string | number>
): string {
  const dictionary = dictionaries[locale] ?? dictionaries.en;
  let text = getNestedValue(dictionary as Record<string, unknown>, key);

  if (params) {
    for (const [paramKey, value] of Object.entries(params)) {
      text = text.replace(`{{${paramKey}}}`, String(value));
    }
  }

  return text;
}

export const STORAGE_KEY = "proofbridge-locale";

export function getStoredLocale(): Locale {
  if (typeof window === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  return locales.includes(stored as Locale) ? (stored as Locale) : "en";
}

export function speechLang(locale: Locale): string {
  return locale === "hi" ? "hi-IN" : "en-US";
}
