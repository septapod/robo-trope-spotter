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
        className={`pill-toggle flex items-center gap-2 rounded-2xl border-2 py-3 px-5 text-sm font-display font-bold transition-all duration-200 ${
          isOpen
            ? "active border-candy-teal bg-candy-teal/10 text-candy-teal"
            : collapsed
              ? "border-zinc-200 bg-zinc-100 text-zinc-300 cursor-not-allowed opacity-40"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-candy-teal/40 hover:text-candy-teal hover:bg-candy-teal/5"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path
            fillRule="evenodd"
            d="M2 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Zm10.5 5.707a.5.5 0 0 0-.146-.353l-2.5-2.5a.5.5 0 0 0-.708 0L7.5 8.5 6.354 7.354a.5.5 0 0 0-.708 0l-2.5 2.5A.5.5 0 0 0 3.5 10.5v1a.5.5 0 0 0 .5.5h8a.5.5 0 0 0 .5-.5v-1.293ZM10.5 5.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0Z"
            clipRule="evenodd"
          />
        </svg>
        {isOpen ? "close" : "screenshot"}
      </button>

      {isOpen && (
        <div className="mt-3">
          {preview ? (
            <div className="relative rounded-2xl border-3 border-zinc-200 overflow-hidden bg-white shadow-sm" style={{ borderWidth: '3px' }}>
              <img
                src={preview}
                alt="Screenshot preview"
                className="max-h-44 w-full object-contain"
              />
              <button
                type="button"
                onClick={clearFile}
                className="absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white p-2 text-zinc-500 hover:text-candy-pink transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  className="w-3.5 h-3.5"
                >
                  <path d="M5.28 4.22a.75.75 0 0 0-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 1 0 1.06 1.06L8 9.06l2.72 2.72a.75.75 0 1 0 1.06-1.06L9.06 8l2.72-2.72a.75.75 0 0 0-1.06-1.06L8 6.94 5.28 4.22Z" />
                </svg>
              </button>
              <div className="px-4 py-2 text-sm text-zinc-500 border-t border-zinc-100 font-mono bg-surface-2/50">
                {file?.name}
              </div>
            </div>
          ) : (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`rounded-2xl border-3 border-dashed p-8 text-center cursor-pointer transition-all duration-300 ${
                dragOver
                  ? "border-candy-teal/60 bg-candy-teal/5 scale-[1.02]"
                  : "border-zinc-300 hover:border-candy-teal/40 hover:bg-candy-teal/5 bg-white"
              } ${disabled ? "opacity-30 cursor-not-allowed" : ""}`}
              style={{ borderWidth: '3px' }}
            >
              <div className="flex flex-col items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-zinc-300">
                  <path fillRule="evenodd" d="M11.47 2.47a.75.75 0 011.06 0l4.5 4.5a.75.75 0 01-1.06 1.06l-3.22-3.22V16.5a.75.75 0 01-1.5 0V4.81L8.03 8.03a.75.75 0 01-1.06-1.06l4.5-4.5zM3 15.75a.75.75 0 01.75.75v2.25a1.5 1.5 0 001.5 1.5h13.5a1.5 1.5 0 001.5-1.5V16.5a.75.75 0 011.5 0v2.25a3 3 0 01-3 3H5.25a3 3 0 01-3-3V16.5a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-zinc-500 font-display font-bold">
                  drop image or click to upload
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                aria-label="Upload screenshot"
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
