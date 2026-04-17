'use client';

import { useState } from 'react';

interface ShareBarProps {
  title: string;
  score: number;
  slug: string;
}

export function ShareBar({ title, score, slug }: ShareBarProps) {
  const [copied, setCopied] = useState(false);

  const trackShare = (method: 'clipboard' | 'native') => {
    try {
      const payload = JSON.stringify({ reportSlug: slug, method });
      const blob = new Blob([payload], { type: 'application/json' });
      if (typeof navigator !== 'undefined' && typeof navigator.sendBeacon === 'function') {
        const queued = navigator.sendBeacon('/api/track-share', blob);
        if (queued) return;
      }
      void fetch('/api/track-share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    } catch {
      // Tracking must never affect UX.
    }
  };

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
    trackShare('clipboard');
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Robo Trope Spotter: ${title}`,
          text: `This text scored ${score} on the trope detector.`,
          url: window.location.href,
        });
        trackShare('native');
      } catch {
        // User cancelled — no event recorded
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
        className="flex items-center gap-2 rounded-2xl border-2 border-zinc-200 bg-white px-5 py-2.5 font-mono text-sm font-semibold text-zinc-500 transition-all duration-200 hover:border-candy-pink/40 hover:text-candy-pink hover:shadow-md shadow-sm"
      >
        {copied ? (
          <>
            <svg className="h-4 w-4 text-candy-green" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span className="font-bold">copied</span>
          </>
        ) : (
          <>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            copy link
          </>
        )}
      </button>

      {canShare && (
        <button
          onClick={handleShare}
          className="btn-gradient flex items-center gap-2 rounded-2xl px-5 py-2.5 font-display text-sm font-semibold text-white shadow-lg shadow-candy-pink/20 transition-all duration-200 hover:shadow-xl hover:shadow-candy-pink/30"
        >
          <svg className="h-4 w-4 relative z-10" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
          <span className="relative z-10">share</span>
        </button>
      )}
    </div>
  );
}
