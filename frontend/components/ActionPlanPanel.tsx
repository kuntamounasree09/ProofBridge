"use client";

import { useEffect, useState } from "react";
import { apiPost, formatDateTime } from "@/lib/api";
import { useI18n } from "@/contexts/I18nProvider";
import SpeakButton from "@/components/SpeakButton";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import type { ActionPlan } from "@/lib/types";

type ActionPlanPanelProps = {
  caseId: string;
  initialPlan: ActionPlan | null;
  hasDocuments: boolean;
  onGenerated: () => void;
};

export default function ActionPlanPanel({
  caseId,
  initialPlan,
  hasDocuments,
  onGenerated,
}: ActionPlanPanelProps) {
  const { t } = useI18n();
  const [plan, setPlan] = useState<ActionPlan | null>(initialPlan);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setPlan(initialPlan);
  }, [initialPlan]);

  async function handleGenerate() {
    setGenerating(true);
    setError("");

    try {
      const result = await apiPost<{ actionPlan: ActionPlan }>(
        `/api/action-plans/case/${caseId}/generate`
      );
      setPlan(result.actionPlan);
      onGenerated();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Card>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-[var(--foreground)]">
            {t("actionPlan.title")}
          </h3>
          <p className="mt-1 text-sm text-[var(--muted)]">
            {t("actionPlan.subtitle")}
          </p>
        </div>
        <Button
          onClick={handleGenerate}
          disabled={generating || !hasDocuments}
          className="shrink-0"
        >
          {generating
            ? t("actionPlan.generating")
            : plan
              ? t("actionPlan.regenerate")
              : t("actionPlan.generate")}
        </Button>
      </div>

      {!hasDocuments && (
        <p className="mt-4 text-sm text-amber-600 dark:text-amber-400">
          {t("actionPlan.noDocuments")}
        </p>
      )}

      {error && (
        <p className="mt-4 text-sm font-medium text-red-500">{error}</p>
      )}

      {plan && (
        <div className="mt-5 rounded-xl border border-[var(--accent)]/20 bg-[var(--accent)]/5 p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-[var(--muted)]">
              {t("actionPlan.generated", {
                date: formatDateTime(plan.created_at),
              })}
            </p>
            <SpeakButton
              text={plan.content}
              label={t("actionPlan.listen")}
            />
          </div>
          <div className="mt-3 rounded-lg bg-[var(--card)] p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
              {plan.content}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
