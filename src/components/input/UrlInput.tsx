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
        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-candy-pink transition-colors disabled:opacity-20 disabled:cursor-not-allowed font-mono"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          fill="currentColor"
          className="w-3.5 h-3.5"
        >
          <path d="M8.914 6.025a.75.75 0 0 1 1.06 0 3.5 3.5 0 0 1 0 4.95l-2 2a3.5 3.5 0 0 1-5.396-4.402.75.75 0 0 1 1.251.827 2 2 0 0 0 3.085 2.514l2-2a2 2 0 0 0 0-2.828.75.75 0 0 1 0-1.06Z" />
          <path d="M7.086 9.975a.75.75 0 0 1-1.06 0 3.5 3.5 0 0 1 0-4.95l2-2a3.5 3.5 0 0 1 5.396 4.402.75.75 0 0 1-1.251-.827 2 2 0 0 0-3.085-2.514l-2 2a2 2 0 0 0 0 2.828.75.75 0 0 1 0 1.06Z" />
        </svg>
        {isOpen ? "close" : "paste URL"}
      </button>

      {isOpen && (
        <input
          type="url"
          className="focus-glow mt-2 w-full rounded-xl bg-white border-2 border-zinc-200 px-4 py-3 text-sm text-zinc-900 placeholder-zinc-400 transition-all disabled:opacity-30 disabled:cursor-not-allowed font-mono shadow-sm"
          placeholder="https://..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoFocus
        />
      )}
    </div>
  );
}
