'use client';

import { useState } from 'react';

interface ShareBarProps {
  title: string;
  score: number;
}

export function ShareBar({ title, score }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = window.location.href;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Robo Trope Spotter: ${title}`,
          text: `This text scored ${score} on the trope detector.`,
          url: window.location.href,
        });
      } catch {
        // User cancelled
      }
    } else {
      handleCopy();
    }
  };

  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 rounded-xl border border-zinc-200 bg-white px-3 py-1.5 font-mono text-sm text-zinc-500 transition-all hover:border-candy-pink/40 hover:text-candy-pink shadow-sm"
      >
        {copied ? (
          <>
            <svg className="h-3 w-3 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            copied
          </>
        ) : (
          <>
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            copy link
          </>
        )}
      </button>

      {canShare && (
        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 rounded-xl bg-candy-pink px-3 py-1.5 font-mono text-sm text-white transition-all hover:brightness-110 shadow-sm"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          share
        </button>
      )}
    </div>
  );
}
