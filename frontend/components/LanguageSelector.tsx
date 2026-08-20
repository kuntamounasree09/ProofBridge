"use client";

import { useI18n } from "@/contexts/I18nProvider";
import type { Locale } from "@/i18n";

export default function LanguageSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <select
      value={locale}
      onChange={(e) => setLocale(e.target.value as Locale)}
      aria-label={t("language.label")}
      className="rounded-lg border border-[var(--card-border)] bg-[var(--card)] px-2 py-1.5 text-sm font-medium text-[var(--foreground)] transition hover:border-[var(--primary)]"
    >
      <option value="en">{t("language.en")}</option>
      <option value="hi">{t("language.hi")}</option>
    </select>
  );
}
