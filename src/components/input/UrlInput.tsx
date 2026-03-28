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
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => !collapsed && setExpanded(!expanded)}
        disabled={collapsed}
        className="flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className={`w-4 h-4 transition-transform ${isOpen ? "rotate-90" : ""}`}
        >
          <path
            fillRule="evenodd"
            d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
            clipRule="evenodd"
          />
        </svg>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-4 h-4"
        >
          <path d="M12.232 4.232a2.5 2.5 0 013.536 3.536l-1.225 1.224a.75.75 0 001.061 1.06l1.224-1.224a4 4 0 00-5.656-5.656l-3 3a4 4 0 00.225 5.865.75.75 0 00.977-1.138 2.5 2.5 0 01-.142-3.667l3-3z" />
          <path d="M11.603 7.963a.75.75 0 00-.977 1.138 2.5 2.5 0 01.142 3.667l-3 3a2.5 2.5 0 01-3.536-3.536l1.225-1.224a.75.75 0 00-1.061-1.06l-1.224 1.224a4 4 0 005.656 5.656l3-3a4 4 0 00-.225-5.865z" />
        </svg>
        or paste a URL
      </button>

      {isOpen && (
        <input
          type="url"
          className="w-full rounded-xl bg-zinc-900 border border-zinc-800 px-4 py-3 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          placeholder="https://example.com/article"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          autoFocus
        />
      )}
    </div>
  );
}
