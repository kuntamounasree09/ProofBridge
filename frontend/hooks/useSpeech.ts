"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type SpeechOptions = {
  lang?: string;
  onResult?: (text: string) => void;
  onEnd?: () => void;
};

export function useSpeech(lang = "en-US") {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    const hasTTS = typeof window !== "undefined" && "speechSynthesis" in window;
    const hasSTT =
      typeof window !== "undefined" &&
      ("SpeechRecognition" in window || "webkitSpeechRecognition" in window);
    setSupported(hasTTS || hasSTT);
  }, []);

  const speak = useCallback(
    (text: string, options?: { lang?: string; onEnd?: () => void }) => {
      if (!window.speechSynthesis) return;

      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = options?.lang || lang;
      utterance.rate = 0.95;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        options?.onEnd?.();
      };
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    },
    [lang]
  );

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const startListening = useCallback(
    (options?: SpeechOptions) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) return;

      recognitionRef.current?.stop();

      const recognition = new SpeechRecognition();
      recognition.lang = options?.lang || lang;
      recognition.interimResults = true;
      recognition.continuous = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => {
        setIsListening(false);
        options?.onEnd?.();
      };
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event) => {
        const result = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        setTranscript(result);
        options?.onResult?.(result);
      };

      recognitionRef.current = recognition;
      recognition.start();
    },
    [lang]
  );

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  return {
    speak,
    stopSpeaking,
    startListening,
    stopListening,
    isSpeaking,
    isListening,
    transcript,
    supported,
  };
}

declare global {
  interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
  }
}
