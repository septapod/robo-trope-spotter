"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { TextInput } from "@/components/input/TextInput";
import { UrlInput } from "@/components/input/UrlInput";
import { ScreenshotInput } from "@/components/input/ScreenshotInput";

type ActiveMode = "none" | "text" | "url" | "screenshot";

export default function Home() {
  const router = useRouter();

  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(
    null
  );

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeMode: ActiveMode = (() => {
    if (text.trim().length > 0) return "text";
    if (url.trim().length > 0) return "url";
    if (screenshotFile) return "screenshot";
    return "none";
  })();

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    if (value.trim().length > 0) {
      setUrl("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
    }
    setError(null);
  }, []);

  const handleUrlChange = useCallback((value: string) => {
    setUrl(value);
    if (value.trim().length > 0) {
      setText("");
      setScreenshotFile(null);
      setScreenshotPreview(null);
    }
    setError(null);
  }, []);

  const handleScreenshotChange = useCallback(
    (file: File | null, preview: string | null) => {
      setScreenshotFile(file);
      setScreenshotPreview(preview);
      if (file) {
        setText("");
        setUrl("");
      }
      setError(null);
    },
    []
  );

  const canAnalyze = activeMode !== "none" && !loading;

  const handleAnalyze = useCallback(async () => {
    if (!canAnalyze) return;

    setLoading(true);
    setError(null);

    try {
      let type: string;
      let content: string;

      switch (activeMode) {
        case "text":
          type = "text";
          content = text.trim();
          break;
        case "url":
          type = "url";
          content = url.trim();
          break;
        case "screenshot": {
          type = "screenshot";
          const dataUrl = screenshotPreview!;
          const commaIndex = dataUrl.indexOf(",");
          const meta = dataUrl.slice(5, commaIndex);
          const mediaType = meta.replace(";base64", "");
          const base64Data = dataUrl.slice(commaIndex + 1);
          content = `${mediaType};${base64Data}`;
          break;
        }
        default:
          return;
      }

      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content }),
      });

      if (!response.ok) {
        let errorMessage = "Something went wrong. Try again.";
        try {
          const data = await response.json();
          errorMessage = data.error || errorMessage;
        } catch {
          if (response.status === 413) {
            errorMessage = "Image is too large. Try a smaller screenshot or paste the text directly.";
          } else if (response.status === 504) {
            errorMessage = "Request timed out. Try again or paste the text directly.";
          } else {
            errorMessage = `Server error (${response.status}). Try again.`;
          }
        }
        setError(errorMessage);
        return;
      }

      const data = await response.json();
      router.push(`/report/${data.slug}`);
    } catch {
      setError("Failed to connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [activeMode, text, url, screenshotPreview, canAnalyze, router]);

  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 overflow-hidden">
      {/* Playful background blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-candy-pink/[0.08] blur-3xl" />
        <div className="animate-blob absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-candy-yellow/[0.12] blur-3xl" style={{ animationDelay: '-4s' }} />
        <div className="animate-blob absolute top-1/2 left-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-candy-teal/[0.06] blur-3xl" style={{ animationDelay: '-8s' }} />
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-4">
          <p className="font-mono text-sm tracking-widest uppercase text-candy-pink font-medium">
            AI Writing Trope Detector
          </p>
          <h1 className="font-sans text-5xl font-black tracking-tight sm:text-6xl text-zinc-900">
            Robo Trope Spotter
          </h1>
          <p className="text-zinc-500 text-base max-w-sm mx-auto leading-relaxed">
            Paste text. See the tropes. Get the report card.
            Send it to someone who needs it.
          </p>
        </header>

        {/* Input area */}
        <div className="space-y-3">
          <TextInput
            value={text}
            onChange={handleTextChange}
            disabled={
              loading ||
              (activeMode !== "none" && activeMode !== "text")
            }
          />

          <div className="flex items-center gap-4">
            <UrlInput
              value={url}
              onChange={handleUrlChange}
              disabled={loading}
              collapsed={activeMode === "text" || activeMode === "screenshot"}
            />
            <ScreenshotInput
              file={screenshotFile}
              preview={screenshotPreview}
              onFile={handleScreenshotChange}
              disabled={loading}
              collapsed={activeMode === "text" || activeMode === "url"}
            />
          </div>
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`group w-full rounded-2xl font-semibold py-4 px-6 text-base transition-all duration-200 ${
            canAnalyze
              ? "bg-candy-pink text-white hover:brightness-110 hover:shadow-lg hover:shadow-candy-pink/25 active:scale-[0.98]"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-3">
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="font-mono text-sm tracking-wide">Scanning for tropes...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              Analyze
              <svg
                className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                />
              </svg>
            </span>
          )}
        </button>

        {/* Error message */}
        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <p className="text-red-600 text-sm text-center">{error}</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-8">
          <p className="text-zinc-400 text-sm font-mono">
            Grades writing patterns, not people.
          </p>
        </footer>
      </div>
    </main>
  );
}
