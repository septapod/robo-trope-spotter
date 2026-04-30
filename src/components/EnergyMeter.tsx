"use client";

import { useEffect, useState } from "react";

type Tier = "caffeine" | "tea" | "water" | "napping";

/**
 * Status indicator that ONLY appears in degraded modes. The user does not
 * need to know which model is running or that there's a cascade. They need
 * to know when the experience is materially different from normal (regex
 * fallback) or when the tool is paused (cap exhausted).
 *
 * caffeine and tea = silent (LLM-grade detection either way; users don't
 *   benefit from knowing the validation pass was skipped).
 * water = visible amber pill, "Lighter analysis today" copy.
 * napping = visible amber pill, "Out for today" copy.
 */
const VISIBLE_COPY: Partial<Record<Tier, { headline: string; sub: string; emoji: string }>> = {
  water: {
    headline: "Lighter analysis today",
    sub: "We got popular. Comes back stronger tomorrow.",
    emoji: "🌤️",
  },
  napping: {
    headline: "Out for today",
    sub: "Comes back tomorrow at sunrise.",
    emoji: "🌙",
  },
};

export function EnergyMeter() {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { tier?: Tier };
        if (!cancelled && data.tier) {
          setTier(data.tier);
        }
      } catch {
        // silent
      }
    };
    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!tier) return null;
  const copy = VISIBLE_COPY[tier];
  if (!copy) return null;

  return (
    <div
      className="inline-flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {copy.emoji}
      </span>
      <span>
        <span className="font-medium">{copy.headline}.</span>{" "}
        <span className="text-amber-700">{copy.sub}</span>
      </span>
    </div>
  );
}
