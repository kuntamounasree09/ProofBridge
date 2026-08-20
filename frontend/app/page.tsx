"use client";

import { useState } from "react";
import Link from "next/link";
import { apiPost } from "@/lib/api";
import { useI18n } from "@/contexts/I18nProvider";
import AuthLayout from "@/components/layout/AuthLayout";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";

export default function Home() {
  const { t } = useI18n();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setMessage("");
    setLoading(true);

    try {
      const data = await apiPost<{ token: string }>("/api/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      window.location.href = "/dashboard";
    } catch (error: unknown) {
      setMessage(
        error instanceof Error ? error.message : "Unable to connect to backend"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="shadow-2xl">
        <h2 className="text-2xl font-semibold text-[var(--foreground)]">
          {t("auth.welcomeBack")}
        </h2>
        <p className="mt-2 mb-6 text-[var(--muted)]">{t("auth.signInSubtitle")}</p>

        <div className="space-y-4">
          <Input
            label={t("auth.email")}
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder={t("auth.emailPlaceholder")}
          />

          <Input
            label={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleLogin()}
            placeholder={t("auth.passwordPlaceholder")}
          />

          <Button
            className="w-full"
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? t("auth.signingIn") : t("auth.signIn")}
          </Button>

          {message && (
            <p className="text-center text-sm font-medium text-red-500">{message}</p>
          )}
        </div>

        <p className="mt-6 text-center text-sm text-[var(--muted)]">
          {t("auth.noAccount")}{" "}
          <Link
            href="/register"
            className="font-semibold text-[var(--primary)] hover:underline"
          >
            {t("auth.createOne")}
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
