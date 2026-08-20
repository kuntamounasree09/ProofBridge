"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useI18n } from "@/contexts/I18nProvider";
import { cn } from "@/lib/cn";

export default function Sidebar() {
  const { t } = useI18n();
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: t("nav.dashboard"), icon: DashboardIcon },
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-[var(--card-border)] bg-[var(--sidebar)] lg:flex lg:flex-col">
      <div className="border-b border-[var(--card-border)] p-6">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] text-sm font-bold text-white shadow-md">
            PB
          </div>
          <div>
            <p className="font-bold text-[var(--foreground)]">{t("common.appName")}</p>
            <p className="text-xs text-[var(--muted)]">{t("common.tagline")}</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || pathname.startsWith(href + "/");
            return (
              <li key={href}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-[var(--primary)]/10 text-[var(--primary)]"
                      : "text-[var(--muted)] hover:bg-[var(--card-border)]/30 hover:text-[var(--foreground)]"
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--card-border)] p-4">
        <div className="rounded-xl bg-[var(--background)] p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">
            {t("dashboard.workflowTitle")}
          </p>
          <ol className="mt-3 space-y-2 text-xs text-[var(--muted)]">
            <li>1. {t("workflow.step1")}</li>
            <li>2. {t("workflow.step2")}</li>
            <li>3. {t("workflow.step3")}</li>
            <li>4. {t("workflow.step4")}</li>
            <li>5. {t("workflow.step5")}</li>
          </ol>
        </div>
      </div>
    </aside>
  );
}

function DashboardIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  );
}
