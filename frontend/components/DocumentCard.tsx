"use client";

import { formatDateTime, formatFileSize } from "@/lib/api";
import { useI18n } from "@/contexts/I18nProvider";
import SpeakButton from "@/components/SpeakButton";
import Card from "@/components/ui/Card";
import type { Document } from "@/lib/types";

type DocumentCardProps = {
  document: Document;
};

export default function DocumentCard({ document }: DocumentCardProps) {
  const { t } = useI18n();

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--primary)]/10">
            <svg className="h-5 w-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-[var(--foreground)]">
              {document.original_name}
            </h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {formatFileSize(document.file_size)} · {formatDateTime(document.created_at)}
            </p>
          </div>
        </div>
      </div>

      {document.ai_analysis && (
        <div className="mt-5 rounded-xl border border-[var(--primary)]/20 bg-[var(--primary)]/5 p-5">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold uppercase tracking-wide text-[var(--primary)]">
              {t("analysis.title")}
            </h4>
            <SpeakButton text={document.ai_analysis} />
          </div>
          <div className="mt-3 rounded-lg bg-[var(--card)] p-4">
            <p className="whitespace-pre-wrap text-sm leading-7 text-[var(--foreground)]">
              {document.ai_analysis}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
