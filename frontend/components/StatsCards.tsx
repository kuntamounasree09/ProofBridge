"use client";

import Card from "@/components/ui/Card";
import { useI18n } from "@/contexts/I18nProvider";

type StatsCardsProps = {
  totalCases: number;
  totalDocuments: number;
};

export default function StatsCards({
  totalCases,
  totalDocuments,
}: StatsCardsProps) {
  const { t } = useI18n();

  const stats = [
    {
      label: t("dashboard.statsCases"),
      value: totalCases,
      icon: "📁",
      color: "from-blue-500 to-blue-600",
    },
    {
      label: t("dashboard.statsDocuments"),
      value: totalDocuments,
      icon: "📄",
      color: "from-indigo-500 to-indigo-600",
    },
    {
      label: t("dashboard.statsActive"),
      value: totalCases,
      icon: "✓",
      color: "from-emerald-500 to-emerald-600",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {stats.map((stat) => (
        <Card key={stat.label} padding="md" className="relative overflow-hidden">
          <div className={`absolute -right-4 -top-4 h-20 w-20 rounded-full bg-gradient-to-br ${stat.color} opacity-10`} />
          <p className="text-sm font-medium text-[var(--muted)]">{stat.label}</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">
            {stat.value}
          </p>
        </Card>
      ))}
    </div>
  );
}
