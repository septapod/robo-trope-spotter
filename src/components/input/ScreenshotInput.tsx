"use client";

import { useState, useRef, useCallback } from "react";

interface ScreenshotInputProps {
  file: File | null;
  preview: string | null;
  onFile: (file: File | null, preview: string | null) => void;
  disabled: boolean;
  collapsed: boolean;
}

export function ScreenshotInput({
  file,
  preview,
  onFile,
  disabled,
  collapsed,
}: ScreenshotInputProps) {
  const [expanded, setExpanded] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOpen = !collapsed && expanded;

  const handleFile = useCallback(
    (f: File) => {
      if (!f.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = () => {
        onFile(f, reader.result as string);
      };
      reader.readAsDataURL(f);
    },
    [onFile]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOver(false);
  }, []);

  const clearFile = useCallback(() => {
    onFile(null, null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [onFile]);

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => !collapsed && setExpanded(!expanded)}
        disabled={collapsed}
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-candy-pink transition-colors disabled:opacity-20 disabled:cursor-not-allowed font-mono"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path d="M2.5 3A1.5 1.5 0 0 0 1 4.5v7A1.5 1.5 0 0 0 2.5 13h11a1.5 1.5 0 0 0 1.5-1.5v-7A1.5 1.5 0 0 0 13.5 3h-11Zm3.21 7.907a.75.75 0 0 1-1.06.02L2.4 8.742a.75.75 0 0 1 0-1.083l2.25-2.134a.75.75 0 0 1 1.042 1.082L4.327 7.88l1.383 1.31Z" />
          <path d="M10.29 10.907a.75.75 0 0 0 1.06.02l2.25-2.185a.75.75 0 0 0 0-1.083l-2.25-2.134a.75.75 0 0 0-1.042 1.082L11.673 7.88l-1.383 1.31a.75.75 0 0 0 .02 1.06Z" />
        </svg>
        {isOpen ? "close" : "screenshot"}
      </button>

      {isOpen && (
        <div className="mt-2">
          {preview ? (
            <div className="relative rounded-2xl border-2 border-zinc-200 overflow-hidden bg-white shadow-sm">
              <img
                src={preview}
                alt="Screenshot preview"
                className="max-h-40 w-full object-contain"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white p-1.5 text-zinc-400 hover:text-candy-pink transition-colors shadow-sm"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3 h-3"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
              <div className="px-3 py-1.5 text-xs text-zinc-500 border-t border-zinc-100 font-mono">
                {file?.name}
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-2 border-dashed p-6 text-center cursor-pointer transition-all duration-200 ${
                dragOver
                  ? "border-candy-pink/60 bg-candy-pink/5"
                  : "border-zinc-300 hover:border-candy-pink/40 bg-white"
              } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
            >
              <p className="text-xs text-zinc-500 font-mono">
                drop image or click
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
                disabled={disabled}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
