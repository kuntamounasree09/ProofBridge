"use client";

import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import { useI18n } from "@/contexts/I18nProvider";

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const { t } = useI18n();

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 dark:from-black dark:via-slate-950 dark:to-indigo-950" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-600/20 via-transparent to-transparent" />

      <div className="absolute right-4 top-4 z-20 flex items-center gap-2">
        <LanguageSelector />
        <ThemeToggle />
      </div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-xl font-bold text-white shadow-xl shadow-blue-600/30">
              PB
            </div>
            <h1 className="text-4xl font-bold text-white">{t("common.appName")}</h1>
            <p className="mt-2 text-slate-400">{t("common.tagline")}</p>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
