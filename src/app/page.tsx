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
    <main className="relative flex min-h-screen flex-col items-center justify-center px-4 py-16 overflow-hidden gradient-mesh">
      {/* Decorative blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob blob-shape absolute -top-24 -left-24 h-[500px] w-[500px] bg-candy-pink/[0.1] blur-3xl" />
        <div className="animate-blob-alt blob-shape-alt absolute -bottom-32 -right-32 h-[550px] w-[550px] bg-candy-yellow/[0.14] blur-3xl" style={{ animationDelay: '-3s' }} />
        <div className="animate-blob blob-shape-round absolute top-1/3 right-1/4 h-[350px] w-[350px] bg-candy-teal/[0.08] blur-3xl" style={{ animationDelay: '-7s' }} />
        <div className="animate-blob-alt blob-shape absolute bottom-1/4 left-1/6 h-[300px] w-[300px] bg-candy-purple/[0.1] blur-3xl" style={{ animationDelay: '-5s' }} />
        <div className="animate-blob-pulse blob-shape-alt absolute top-1/6 right-1/6 h-[200px] w-[200px] bg-candy-orange/[0.12] blur-2xl" style={{ animationDelay: '-2s' }} />
      </div>

      {/* Small visible decorative blobs (not blurred) */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="animate-blob blob-shape absolute top-16 right-12 h-20 w-20 bg-candy-yellow/20 sm:h-28 sm:w-28" style={{ animationDelay: '-4s' }} />
        <div className="animate-blob-alt blob-shape-alt absolute bottom-24 left-8 h-16 w-16 bg-candy-teal/15 sm:h-24 sm:w-24" style={{ animationDelay: '-6s' }} />
        <div className="animate-blob blob-shape-round absolute top-1/3 left-6 h-12 w-12 bg-candy-pink/15 sm:h-16 sm:w-16" style={{ animationDelay: '-9s' }} />
        <div className="animate-blob-alt blob-shape absolute bottom-1/3 right-10 h-14 w-14 bg-candy-purple/15 sm:h-20 sm:w-20" style={{ animationDelay: '-1s' }} />
      </div>

      <div className="relative z-10 w-full max-w-xl space-y-8">
        {/* Header */}
        <header className="text-center space-y-5">
          <p className="font-mono text-sm tracking-widest uppercase text-candy-pink font-medium">
            AI Writing Trope Detector
          </p>
          <h1 className="font-display text-7xl font-bold tracking-tight sm:text-8xl gradient-text leading-[0.95]">
            Robo Trope Spotter
          </h1>
          <p className="text-zinc-500 text-lg max-w-sm mx-auto leading-relaxed font-sans">
            Paste text. See the tropes. Get the report card.
            Send it to someone who needs it.
          </p>
        </header>

        {/* Input area */}
        <div className="space-y-4">
          <TextInput
            value={text}
            onChange={handleTextChange}
            disabled={
              loading ||
              (activeMode !== "none" && activeMode !== "text")
            }
          />

          {/* Input mode toggles */}
          <div className="flex items-center gap-3">
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
          className={`group w-full rounded-3xl font-display font-bold py-5 px-8 text-lg transition-all duration-300 ${
            canAnalyze
              ? "btn-gradient shadow-lg shadow-candy-pink/20 hover:shadow-xl hover:shadow-candy-pink/30 hover:scale-[1.02] active:scale-[0.98]"
              : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-4">
              <span className="loading-dots flex gap-1.5">
                <span />
                <span />
                <span />
              </span>
              <span className="font-display text-base font-bold tracking-wide text-white">Hunting for tropes...</span>
            </span>
          ) : (
            <span className="flex items-center justify-center gap-3">
              <span>Analyze</span>
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
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
          <div className="rounded-2xl border-2 border-red-200 bg-red-50 px-5 py-4">
            <p className="text-red-600 text-sm text-center font-medium">{error}</p>
          </div>
        )}

        {/* Footer */}
        <footer className="text-center pt-6">
          <p className="text-zinc-400 text-sm font-mono">
            Grades writing patterns, not people.
          </p>
        </footer>
      </div>
    </main>
  );
}
