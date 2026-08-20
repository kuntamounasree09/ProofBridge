"use client";

import Link from "next/link";
import { logout } from "@/lib/api";
import { useI18n } from "@/contexts/I18nProvider";
import ThemeToggle from "@/components/ThemeToggle";
import LanguageSelector from "@/components/LanguageSelector";
import Button from "@/components/ui/Button";

type TopBarProps = {
  userName?: string;
  showBack?: boolean;
  backHref?: string;
};

export default function TopBar({
  userName,
  showBack,
  backHref = "/dashboard",
}: TopBarProps) {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-30 border-b border-[var(--card-border)] bg-[var(--header)]/95 backdrop-blur-md">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          {showBack && (
            <Link
              href={backHref}
              className="text-sm font-medium text-[var(--primary)] hover:underline lg:hidden"
            >
              ← {t("nav.backToDashboard")}
            </Link>
          )}
          <div className="lg:hidden">
            <Link href="/dashboard" className="font-bold text-[var(--foreground)]">
              {t("common.appName")}
            </Link>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          {userName && (
            <span className="hidden text-sm text-[var(--muted)] sm:inline">
              {userName}
            </span>
          )}
          <LanguageSelector />
          <ThemeToggle />
          <Button variant="secondary" size="sm" onClick={logout}>
            {t("nav.logout")}
          </Button>
        </div>
      </div>
    </header>
  );
}
