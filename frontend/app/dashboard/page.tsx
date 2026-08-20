"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import StatsCards from "@/components/StatsCards";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Spinner from "@/components/ui/Spinner";
import Badge from "@/components/ui/Badge";
import { useI18n } from "@/contexts/I18nProvider";
import { useSpeech } from "@/hooks/useSpeech";
import { apiGet, apiPost, formatDateTime, getToken } from "@/lib/api";
import type { Case, User } from "@/lib/types";

export default function Dashboard() {
  const router = useRouter();
  const { t, speechLanguage } = useI18n();
  const { startListening, stopListening, isListening } = useSpeech(speechLanguage);

  const [user, setUser] = useState<User | null>(null);
  const [cases, setCases] = useState<Case[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      router.push("/");
      return;
    }

    async function loadData() {
      try {
        const profileData = await apiGet<{ user: User }>("/api/auth/profile");
        setUser(profileData.user);
        setCases(await apiGet<Case[]>("/api/cases"));
      } catch (error: unknown) {
        setMessage(
          error instanceof Error ? error.message : "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [router]);

  async function handleCreateCase() {
    if (!title.trim()) {
      setMessage(t("dashboard.titleRequired"));
      return;
    }

    setCreating(true);
    setMessage("");

    try {
      const newCase = await apiPost<Case>("/api/cases", { title, description });
      setCases((prev) => [newCase, ...prev]);
      setTitle("");
      setDescription("");
      setShowForm(false);
      setMessage(t("dashboard.caseCreated"));
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : t("common.error"));
    } finally {
      setCreating(false);
    }
  }

  function toggleVoiceDescription() {
    if (isListening) {
      stopListening();
    } else {
      startListening({
        lang: speechLanguage,
        onResult: (text) => setDescription(text),
      });
    }
  }

  const totalDocuments = cases.reduce(
    (sum, c) => sum + (c.document_count ?? 0),
    0
  );

  if (loading) {
    return (
      <AppShell>
        <div className="flex flex-col items-center justify-center gap-4 py-24">
          <Spinner />
          <p className="text-[var(--muted)]">{t("common.loading")}</p>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell userName={user?.name}>
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="rounded-2xl bg-gradient-to-r from-[var(--gradient-from)] to-[var(--gradient-to)] p-8 text-white shadow-lg">
          <p className="text-sm font-medium text-blue-100">{t("dashboard.workspace")}</p>
          <h2 className="mt-2 text-3xl font-bold">
            {t("dashboard.welcome", { name: user?.name || "User" })}
          </h2>
          <p className="mt-2 text-blue-100">{user?.email}</p>
        </div>

        <div className="mt-8">
          <StatsCards totalCases={cases.length} totalDocuments={totalDocuments} />
        </div>

        {message && (
          <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50 px-5 py-4 text-sm font-medium text-blue-700 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-300">
            {message}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-2xl font-bold text-[var(--foreground)]">
              {t("dashboard.myCases")}
            </h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {t("dashboard.caseCount", { count: cases.length })}
            </p>
          </div>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? t("common.cancel") : `+ ${t("dashboard.newCase")}`}
          </Button>
        </div>

        {showForm && (
          <Card className="mt-6">
            <h3 className="text-xl font-bold text-[var(--foreground)]">
              {t("dashboard.createCase")}
            </h3>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[var(--foreground)]">
                {t("dashboard.caseTitle")}
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t("dashboard.caseTitlePlaceholder")}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-semibold text-[var(--foreground)]">
                  {t("dashboard.description")}
                </label>
                <Button
                  variant={isListening ? "danger" : "ghost"}
                  size="sm"
                  onClick={toggleVoiceDescription}
                >
                  {isListening ? t("upload.listening") : `🎤 ${t("upload.voiceInput")}`}
                </Button>
              </div>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t("dashboard.descriptionPlaceholder")}
                rows={4}
                className="w-full rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-4 py-3 text-[var(--foreground)] focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              />
            </div>

            <Button
              variant="success"
              className="mt-5"
              onClick={handleCreateCase}
              disabled={creating}
            >
              {creating ? t("dashboard.creating") : t("dashboard.createCaseBtn")}
            </Button>
          </Card>
        )}

        {cases.length === 0 ? (
          <Card className="mt-8 border-dashed text-center">
            <div className="text-4xl">📁</div>
            <h3 className="mt-4 text-lg font-bold text-[var(--foreground)]">
              {t("dashboard.noCases")}
            </h3>
            <p className="mt-2 text-sm text-[var(--muted)]">{t("dashboard.noCasesHint")}</p>
          </Card>
        ) : (
          <div className="mt-6 grid gap-4">
            {cases.map((item) => (
              <Link key={item.id} href={`/cases/${item.id}`}>
                <Card className="transition hover:-translate-y-0.5 hover:border-[var(--primary)]/30 hover:shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--primary)]/10 text-xl">
                        📁
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-[var(--foreground)]">
                          {item.title}
                        </h3>
                        {item.description && (
                          <p className="mt-1 line-clamp-2 text-sm text-[var(--muted)]">
                            {item.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-[var(--muted)]">
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-2">
                      <Badge variant="success">{t("common.active")}</Badge>
                      <span className="text-xs text-[var(--muted)]">
                        {t("dashboard.documents", {
                          count: item.document_count ?? 0,
                        })}
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
