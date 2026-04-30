"use client";

import { useEffect, useState } from "react";

type Tier = "on" | "paused";

/**
 * Two-state status indicator. Silent when on. Surfaces a friendly note when
 * paused for the day. Analysis quality stays consistent — there is no
 * "lighter" middle state.
 */
export function EnergyMeter() {
  const [tier, setTier] = useState<Tier | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/status", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { tier?: Tier };
        if (!cancelled && data.tier) setTier(data.tier);
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

  if (tier !== "paused") return null;

  return (
    <div
      className="inline-flex items-center gap-3 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-900"
      role="status"
      aria-live="polite"
    >
      <span aria-hidden="true" className="text-base leading-none">
        🌙
      </span>
      <span>
        <span className="font-medium">Taking a breather.</span>{" "}
        <span className="text-amber-700">Robotropes had a busy day. Back tomorrow.</span>
      </span>
    </div>
  );
}
