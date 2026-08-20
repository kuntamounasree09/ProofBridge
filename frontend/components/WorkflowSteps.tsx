"use client";

import { useI18n } from "@/contexts/I18nProvider";
import { cn } from "@/lib/cn";

type WorkflowStepsProps = {
  hasDocuments: boolean;
  hasAnalysis: boolean;
  hasActionPlan: boolean;
  className?: string;
};

export default function WorkflowSteps({
  hasDocuments,
  hasAnalysis,
  hasActionPlan,
  className,
}: WorkflowStepsProps) {
  const { t } = useI18n();

  const steps = [
    { key: "step1", done: true, label: t("workflow.step1") },
    { key: "step2", done: hasDocuments, label: t("workflow.step2") },
    { key: "step3", done: hasAnalysis, label: t("workflow.step3") },
    { key: "step4", done: hasActionPlan, label: t("workflow.step4") },
    {
      key: "step5",
      done: hasActionPlan,
      label: t("workflow.step5"),
    },
  ];

  const completedCount = steps.filter((s) => s.done).length;
  const progress = Math.round((completedCount / steps.length) * 100);

  return (
    <div className={cn("rounded-2xl border border-[var(--card-border)] bg-[var(--card)] p-6 shadow-sm", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-[var(--foreground)]">{t("case.progressTitle")}</h3>
        <span className="text-sm font-semibold text-[var(--primary)]">{progress}%</span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-[var(--background)]">
        <div
          className="h-full rounded-full bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ol className="mt-6 space-y-3">
        {steps.map((step, index) => (
          <li key={step.key} className="flex items-center gap-3">
            <div
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                step.done
                  ? "bg-emerald-500 text-white"
                  : "border-2 border-[var(--card-border)] text-[var(--muted)]"
              )}
            >
              {step.done ? "✓" : index + 1}
            </div>
            <span
              className={cn(
                "text-sm",
                step.done ? "font-medium text-[var(--foreground)]" : "text-[var(--muted)]"
              )}
            >
              {step.label}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
