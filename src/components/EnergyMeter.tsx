"use client";

import { useEffect, useState } from "react";

type Tier = "caffeine" | "tea" | "water" | "napping";

const COPY: Record<Tier, { headline: string; sub: string; emoji: string }> = {
  caffeine: {
    headline: "Robotropes is running on caffeine",
    sub: "Full power. Sharp eyes.",
    emoji: "☕",
  },
  tea: {
    headline: "Robotropes is running on tea",
    sub: "A little slower today, still sharp.",
    emoji: "🍵",
  },
  water: {
    headline: "Robotropes is running on water",
    sub: "Pattern-matching only. Comes back stronger tomorrow.",
    emoji: "💧",
  },
  napping: {
    headline: "Robotropes is napping",
    sub: "Come back tomorrow morning, fresh batch of energy.",
    emoji: "💤",
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
        if (!cancelled && data.tier && data.tier in COPY) {
          setTier(data.tier);
        }
      } catch {
        // silent — meter just doesn't render until status returns
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

  const { headline, sub, emoji } = COPY[tier];
  const isLow = tier === "water" || tier === "napping";

  return (
    <div
      className={`inline-flex items-center gap-3 rounded-full border px-4 py-2 text-sm transition-colors ${
        isLow
          ? "border-amber-200 bg-amber-50 text-amber-900"
          : "border-zinc-200 bg-white/80 text-zinc-700"
      }`}
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" className="text-base leading-none">
        {emoji}
      </span>
      <span>
        <span className="font-medium">{headline}.</span>{" "}
        <span className="text-zinc-500">{sub}</span>
      </span>
    </div>
  );
}
