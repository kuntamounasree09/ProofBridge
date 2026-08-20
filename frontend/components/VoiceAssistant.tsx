"use client";

import { useState } from "react";
import { useSpeech } from "@/hooks/useSpeech";
import { useI18n } from "@/contexts/I18nProvider";
import { apiPost } from "@/lib/api";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { cn } from "@/lib/cn";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type VoiceAssistantProps = {
  caseId: string;
  caseTitle: string;
  latestAnalysis?: string | null;
  actionPlan?: string | null;
};

export default function VoiceAssistant({
  caseId,
  caseTitle,
  latestAnalysis,
  actionPlan,
}: VoiceAssistantProps) {
  const { t, speechLanguage } = useI18n();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [thinking, setThinking] = useState(false);

  const {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    supported,
  } = useSpeech(speechLanguage);

  async function handleSend(text?: string) {
    const message = (text ?? input).trim();
    if (!message) return;

    setInput("");
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setThinking(true);

    const lower = message.toLowerCase();

    if (lower.includes("read analysis") || lower.includes("विश्लेषण")) {
      if (latestAnalysis) {
        const reply = latestAnalysis.slice(0, 500) + (latestAnalysis.length > 500 ? "..." : "");
        setMessages((prev) => [...prev, { role: "assistant", content: reply }]);
        speak(latestAnalysis, { lang: speechLanguage });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "No analysis available yet." },
        ]);
      }
      setThinking(false);
      return;
    }

    if (lower.includes("read plan") || lower.includes("योजना")) {
      if (actionPlan) {
        setMessages((prev) => [...prev, { role: "assistant", content: actionPlan }]);
        speak(actionPlan, { lang: speechLanguage });
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "No action plan generated yet." },
        ]);
      }
      setThinking(false);
      return;
    }

    try {
      const result = await apiPost<{ reply: string }>("/api/ai/chat", {
        caseId,
        message,
        context: {
          caseTitle,
          latestAnalysis: latestAnalysis?.slice(0, 2000),
          actionPlan: actionPlan?.slice(0, 2000),
        },
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: result.reply },
      ]);
      speak(result.reply, { lang: speechLanguage });
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: t("common.error") },
      ]);
    } finally {
      setThinking(false);
    }
  }

  function toggleMic() {
    if (isListening) {
      stopListening();
    } else {
      startListening({
        lang: speechLanguage,
        onResult: (text) => setInput(text),
        onEnd: () => {
          /* user can review transcript before sending */
        },
      });
    }
  }

  if (!supported) return null;

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        aria-label={t("voice.open")}
        className={cn(
          "fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[var(--gradient-from)] to-[var(--gradient-to)] text-white shadow-xl transition hover:scale-105",
          open && "scale-0 opacity-0"
        )}
      >
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
      </button>

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[min(100vw-2rem,400px)] animate-fade-in">
          <Card className="shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-[var(--foreground)]">{t("voice.title")}</h3>
                <p className="text-xs text-[var(--muted)]">{t("voice.subtitle")}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
                ✕
              </Button>
            </div>

            <div className="mt-4 max-h-48 space-y-2 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-[var(--muted)]">{t("voice.askPlaceholder")}</p>
              ) : (
                messages.map((msg, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-xl px-3 py-2 text-sm",
                      msg.role === "user"
                        ? "ml-8 bg-[var(--primary)]/10 text-[var(--foreground)]"
                        : "mr-8 bg-[var(--background)] text-[var(--foreground)]"
                    )}
                  >
                    {msg.content}
                  </div>
                ))
              )}
              {thinking && (
                <p className="text-sm text-[var(--muted)]">{t("voice.thinking")}</p>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              {latestAnalysis && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSend("read analysis")}
                >
                  {t("voice.readAnalysis")}
                </Button>
              )}
              {actionPlan && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleSend("read plan")}
                >
                  {t("voice.readPlan")}
                </Button>
              )}
              {isSpeaking && (
                <Button variant="ghost" size="sm" onClick={stopSpeaking}>
                  {t("analysis.stop")}
                </Button>
              )}
            </div>

            <div className="mt-4 flex gap-2">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                placeholder={t("voice.askPlaceholder")}
                className="flex-1 rounded-xl border border-[var(--input-border)] bg-[var(--input-bg)] px-3 py-2 text-sm text-[var(--foreground)]"
              />
              <Button
                variant={isListening ? "danger" : "secondary"}
                size="sm"
                onClick={toggleMic}
                className={isListening ? "animate-pulse-ring" : ""}
              >
                🎤
              </Button>
              <Button size="sm" onClick={() => handleSend()} disabled={thinking}>
                {t("voice.send")}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
