"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import DocumentUpload from "@/components/DocumentUpload";
import DocumentCard from "@/components/DocumentCard";
import ActivityTimeline from "@/components/ActivityTimeline";
import ActionPlanPanel from "@/components/ActionPlanPanel";
import WorkflowSteps from "@/components/WorkflowSteps";
import VoiceAssistant from "@/components/VoiceAssistant";
import Badge from "@/components/ui/Badge";
import Spinner from "@/components/ui/Spinner";
import Card from "@/components/ui/Card";
import { useI18n } from "@/contexts/I18nProvider";
import { apiGet, formatDateTime, getToken } from "@/lib/api";
import type { ActionPlan, Case, CaseEvent, Document, User } from "@/lib/types";

export default function CaseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useI18n();
  const caseId = params.id as string;

  const [user, setUser] = useState<User | null>(null);
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [history, setHistory] = useState<CaseEvent[]>([]);
  const [actionPlan, setActionPlan] = useState<ActionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const loadCaseData = useCallback(async () => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    try {
      const [profileData, caseResult, documentResult, historyResult, planResult] =
        await Promise.all([
          apiGet<{ user: User }>("/api/auth/profile"),
          apiGet<Case>(`/api/cases/${caseId}`),
          apiGet<Document[]>(`/api/documents/case/${caseId}`),
          apiGet<CaseEvent[]>(`/api/cases/${caseId}/history`),
          apiGet<{ actionPlan: ActionPlan | null }>(
            `/api/action-plans/case/${caseId}`
          ),
        ]);

      setUser(profileData.user);
      setCaseData(caseResult);
      setDocuments(documentResult);
      setHistory(historyResult);
      setActionPlan(planResult.actionPlan);
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : t("common.error")
      );
    } finally {
      setLoading(false);
    }
  }, [caseId, router, t]);

  useEffect(() => {
    loadCaseData();
  }, [loadCaseData]);

  const latestAnalysis = documents.find((d) => d.ai_analysis)?.ai_analysis ?? null;
  const hasAnalysis = documents.some((d) => d.ai_analysis);

  if (loading) {
    return (
      <AppShell showBack backHref="/dashboard">
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Spinner />
          <p className="text-[var(--muted)]">{t("case.loading")}</p>
        </div>
      </AppShell>
    );
  }

  if (!caseData) {
    return (
      <AppShell showBack backHref="/dashboard">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
          <Card className="border-red-200 text-center dark:border-red-900">
            <p className="font-medium text-red-600 dark:text-red-400">
              {message || t("case.notFound")}
            </p>
          </Card>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userName={user?.name} showBack backHref="/dashboard">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <Card padding="lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-[var(--foreground)]">
                {caseData.title}
              </h1>
              {caseData.description && (
                <p className="mt-3 max-w-2xl text-[var(--muted)]">
                  {caseData.description}
                </p>
              )}
              <p className="mt-3 text-sm text-[var(--muted)]">
                {t("case.created", {
                  date: formatDateTime(caseData.created_at),
                })}{" "}
                ·{" "}
                {t("case.documentCount", { count: documents.length })}
              </p>
            </div>
            <Badge variant="success">{t("common.active")}</Badge>
          </div>
        </Card>

        <div className="mt-8 grid gap-8 xl:grid-cols-3">
          <div className="space-y-8 xl:col-span-2">
            <DocumentUpload caseId={caseId} onUploaded={loadCaseData} />

            <div>
              <h2 className="text-xl font-bold text-[var(--foreground)]">
                {t("case.documentsAnalysis")}
              </h2>
              <p className="mt-1 text-sm text-[var(--muted)]">
                {t("case.documentsSubtitle")}
              </p>

              {documents.length === 0 ? (
                <Card className="mt-4 border-dashed text-center">
                  <div className="text-3xl">📄</div>
                  <p className="mt-3 text-sm text-[var(--muted)]">
                    {t("case.noDocuments")}
                  </p>
                </Card>
              ) : (
                <div className="mt-4 space-y-4">
                  {documents.map((doc) => (
                    <DocumentCard key={doc.id} document={doc} />
                  ))}
                </div>
              )}
            </div>

            <ActionPlanPanel
              caseId={caseId}
              initialPlan={actionPlan}
              hasDocuments={documents.length > 0}
              onGenerated={loadCaseData}
            />
          </div>

          <div className="space-y-8 xl:col-span-1">
            <WorkflowSteps
              hasDocuments={documents.length > 0}
              hasAnalysis={hasAnalysis}
              hasActionPlan={!!actionPlan}
            />
            <ActivityTimeline events={history} />
          </div>
        </div>
      </div>

      <VoiceAssistant
        caseId={caseId}
        caseTitle={caseData.title}
        latestAnalysis={latestAnalysis}
        actionPlan={actionPlan?.content}
      />
    </AppShell>
  );
}
