"use client";

import { useState } from "react";

interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  disabled: boolean;
  collapsed: boolean;
}

export function UrlInput({ value, onChange, disabled, collapsed }: UrlInputProps) {
  const [expanded, setExpanded] = useState(false);

  const isOpen = !collapsed && expanded;

  return (
    <div className="flex-1">
      <button
        type="button"
        onClick={() => !collapsed && setExpanded(!expanded)}
        disabled={collapsed}
        className={`pill-toggle flex items-center gap-2 rounded-2xl border-2 py-3 px-5 text-sm font-display font-bold transition-all duration-200 ${
          isOpen
            ? "active border-candy-pink bg-candy-pink/10 text-link-pink"
            : collapsed
              ? "border-zinc-200 bg-zinc-100 text-zinc-300 cursor-not-allowed opacity-40"
              : "border-zinc-200 bg-white text-zinc-500 hover:border-candy-pink/40 hover:text-link-pink hover:bg-candy-pink/5"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
          <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
        </svg>
        {isOpen ? "close" : "paste URL"}
      </button>

      {isOpen && (
        <>
          <label htmlFor="url-input" className="sr-only">
            URL to analyze
          </label>
          <input
            id="url-input"
            type="url"
            className="focus-glow mt-3 w-full rounded-2xl bg-white border-3 border-zinc-200 px-5 py-3.5 text-sm text-zinc-900 placeholder-zinc-500 transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed font-mono shadow-sm"
            style={{ borderWidth: '3px' }}
            placeholder="https://..."
            value={value}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            autoFocus
          />
        </>
      )}
    </div>
  );
}
