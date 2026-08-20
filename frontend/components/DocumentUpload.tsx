"use client";

import { useRef, useState } from "react";
import { useI18n } from "@/contexts/I18nProvider";
import { useSpeech } from "@/hooks/useSpeech";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";

type DocumentUploadProps = {
  caseId: string;
  onUploaded: () => void;
};

export default function DocumentUpload({
  caseId,
  onUploaded,
}: DocumentUploadProps) {
  const { t, speechLanguage } = useI18n();
  const { startListening, stopListening, isListening } = useSpeech(speechLanguage);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [voiceNote, setVoiceNote] = useState("");

  async function uploadFile(file: File) {
    setUploading(true);
    setError("");

    try {
      const { apiUpload } = await import("@/lib/api");
      const formData = new FormData();
      formData.append("document", file);
      formData.append("caseId", caseId);
      if (voiceNote) formData.append("note", voiceNote);

      await apiUpload("/api/documents/upload", formData);

      setSelectedFile(null);
      setVoiceNote("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onUploaded();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("common.error"));
    } finally {
      setUploading(false);
    }
  }

  function handleFileSelect(file: File | undefined) {
    if (!file) return;

    const allowed = [".txt", ".pdf", ".docx"];
    const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowed.includes(ext)) {
      setError(t("upload.formatError"));
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError(t("upload.sizeError"));
      return;
    }

    setSelectedFile(file);
    setError("");
  }

  function toggleVoiceNote() {
    if (isListening) {
      stopListening();
    } else {
      startListening({
        lang: speechLanguage,
        onResult: (text) => setVoiceNote(text),
      });
    }
  }

  return (
    <Card>
      <h3 className="text-lg font-bold text-[var(--foreground)]">{t("upload.title")}</h3>
      <p className="mt-1 text-sm text-[var(--muted)]">{t("upload.subtitle")}</p>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          handleFileSelect(e.dataTransfer.files[0]);
        }}
        onClick={() => fileInputRef.current?.click()}
        className={`mt-4 cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition ${
          dragOver
            ? "border-[var(--primary)] bg-[var(--primary)]/5"
            : "border-[var(--card-border)] hover:border-[var(--primary)]/50 hover:bg-[var(--background)]"
        }`}
      >
        <svg
          className="mx-auto h-10 w-10 text-[var(--muted)]"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
        <p className="mt-2 text-sm font-medium text-[var(--foreground)]">
          {selectedFile ? selectedFile.name : t("upload.dragDrop")}
        </p>
        <p className="mt-1 text-xs text-[var(--muted)]">{t("upload.aiRunsAfter")}</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".txt,.pdf,.docx"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
      </div>

      <div className="mt-4 flex items-center gap-2">
        <Button
          variant={isListening ? "danger" : "secondary"}
          size="sm"
          onClick={toggleVoiceNote}
        >
          {isListening ? t("upload.listening") : `🎤 ${t("upload.voiceInput")}`}
        </Button>
        {voiceNote && (
          <p className="truncate text-sm text-[var(--muted)]">{voiceNote}</p>
        )}
      </div>

      {error && (
        <p className="mt-3 text-sm font-medium text-red-500">{error}</p>
      )}

      {selectedFile && (
        <Button
          className="mt-4 w-full"
          onClick={() => uploadFile(selectedFile)}
          disabled={uploading}
        >
          {uploading ? t("upload.uploading") : t("upload.uploadBtn")}
        </Button>
      )}
    </Card>
  );
}
