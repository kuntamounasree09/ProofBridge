"use client";

import { formatDateTime } from "@/lib/api";
import { useI18n } from "@/contexts/I18nProvider";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";
import type { CaseEvent } from "@/lib/types";

const EVENT_ICONS: Record<string, string> = {
  case_created: "📁",
  document_uploaded: "📄",
  ai_analysis_completed: "🤖",
  action_plan_generated: "📋",
};

type ActivityTimelineProps = {
  events: CaseEvent[];
};

export default function ActivityTimeline({ events }: ActivityTimelineProps) {
  const { t } = useI18n();

  if (events.length === 0) {
    return (
      <Card className="text-center">
        <p className="text-sm text-[var(--muted)]">{t("history.empty")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-[var(--foreground)]">{t("history.title")}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{t("history.subtitle")}</p>

      <ol className="mt-6 space-y-0">
        {events.map((event, index) => (
          <li key={event.id} className="relative flex gap-4 pb-6 last:pb-0">
            {index < events.length - 1 && (
              <span className="absolute left-5 top-10 h-full w-px bg-[var(--card-border)]" />
            )}
            <div
              className={cn(
                "relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--background)] text-lg"
              )}
            >
              {EVENT_ICONS[event.event_type] || "•"}
            </div>
            <div className="min-w-0 flex-1 pt-1">
              <p className="text-sm font-medium text-[var(--foreground)]">
                {event.description}
              </p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                {formatDateTime(event.created_at)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </Card>
  );
}
