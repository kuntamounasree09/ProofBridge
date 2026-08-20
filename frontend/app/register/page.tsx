"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { useI18n } from "@/contexts/I18nProvider";
import AuthLayout from "@/components/layout/AuthLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function RegisterPage() {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleRegister() {
    setMessage("");
    setLoading(true);

    try {
      await apiPost("/api/auth/register", { name, email, password });
      setSuccess(true);
      setMessage(t("auth.accountCreated"));
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
    } catch (error: unknown) {
      setMessage(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="shadow-2xl">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          {t("auth.getStarted")}
        </h2>
        <p className="mt-2 mb-6 text-[var(--muted)]">{t("auth.registerSubtitle")}</p>

        <div className="space-y-4">
          <Input
            label={t("auth.fullName")}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t("auth.namePlaceholder")}
          />

          <Input
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("auth.emailPlaceholder")}
          />

          <Input
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("auth.passwordMinPlaceholder")}
          />

          <Button
            className="w-full"
            onClick={handleRegister}
            disabled={loading || success}
          >
            {loading ? t("auth.creatingAccount") : t("auth.createAccount")}
          </Button>

          {message && (
            <p
              className={`text-center text-sm font-medium ${
                success ? "text-emerald-500" : "text-red-500"
              }`}
            >
              {message}
            </p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          {t("auth.hasAccount")}{" "}
          <Link
            href="/"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            {t("auth.signInLink")}
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
