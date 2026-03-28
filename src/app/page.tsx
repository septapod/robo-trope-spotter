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

  // Determine which mode is active based on what has content
  const activeMode: ActiveMode = (() => {
    if (text.trim().length > 0) return "text";
    if (url.trim().length > 0) return "url";
    if (screenshotFile) return "screenshot";
    return "none";
  })();

  const handleTextChange = useCallback((value: string) => {
    setText(value);
    // Clear other inputs when text is entered
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
          // screenshotPreview is a data URL like "data:image/png;base64,iVBOR..."
          // The API expects "mediaType;base64data" (e.g., "image/png;iVBOR...")
          const dataUrl = screenshotPreview!;
          const commaIndex = dataUrl.indexOf(",");
          const meta = dataUrl.slice(5, commaIndex); // "image/png;base64"
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

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Something went wrong. Try again.");
        return;
      }

      router.push(`/report/${data.slug}`);
    } catch {
      setError("Failed to connect. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, [activeMode, text, url, screenshotPreview, canAnalyze, router]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl font-bold tracking-tight">
            Robo Trope Spotter
          </h1>
          <p className="text-zinc-400 text-lg">
            Paste text. See the tropes. Get the report card.
          </p>
        </div>

        {/* Input area */}
        <div className="space-y-4">
          {/* Primary: Text area */}
          <TextInput
            value={text}
            onChange={handleTextChange}
            disabled={
              loading ||
              (activeMode !== "none" &&
                activeMode !== "text")
            }
          />

          {/* Secondary: URL input */}
          <UrlInput
            value={url}
            onChange={handleUrlChange}
            disabled={loading}
            collapsed={activeMode === "text" || activeMode === "screenshot"}
          />

          {/* Tertiary: Screenshot drop zone */}
          <ScreenshotInput
            file={screenshotFile}
            preview={screenshotPreview}
            onFile={handleScreenshotChange}
            disabled={loading}
            collapsed={activeMode === "text" || activeMode === "url"}
          />
        </div>

        {/* Analyze button */}
        <button
          onClick={handleAnalyze}
          disabled={!canAnalyze}
          className={`w-full rounded-xl font-semibold py-3.5 px-6 transition-all text-white ${
            canAnalyze
              ? "bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99]"
              : "bg-indigo-600/50 cursor-not-allowed"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2 opacity-80">
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
              Analyzing...
            </span>
          ) : (
            "Analyze"
          )}
        </button>

        {/* Error message */}
        {error && (
          <p className="text-red-400 text-sm text-center -mt-4">{error}</p>
        )}

        {/* Footer */}
        <p className="text-zinc-600 text-xs text-center pt-4">
          This tool grades writing patterns, not people. Built for laughs and
          learning.
        </p>
      </div>
    </main>
  );
}
