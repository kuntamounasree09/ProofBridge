"use client";

import { useSpeech } from "@/hooks/useSpeech";
import { useI18n } from "@/contexts/I18nProvider";
import Button from "@/components/ui/Button";

type SpeakButtonProps = {
  text: string;
  label?: string;
  stopLabel?: string;
  className?: string;
};

export default function SpeakButton({
  text,
  label,
  stopLabel,
  className,
}: SpeakButtonProps) {
  const { t, speechLanguage } = useI18n();
  const { speak, stopSpeaking, isSpeaking, supported } = useSpeech(speechLanguage);

  if (!supported) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      className={className}
      onClick={() =>
        isSpeaking ? stopSpeaking() : speak(text, { lang: speechLanguage })
      }
    >
      {isSpeaking ? (
        <>
          <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
          {stopLabel || t("analysis.stop")}
        </>
      ) : (
        <>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6a7 7 0 010 12m-3.536-9.536a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
          {label || t("analysis.listen")}
        </>
      )}
    </Button>
  );
}
