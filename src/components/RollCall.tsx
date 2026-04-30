"use client";

import { useEffect, useState } from "react";

interface Verdict {
  label: string;
  rawScore: number | null;
  at: string;
}

const LABEL_COLORS: Record<string, string> = {
  Clean: "bg-emerald-100 text-emerald-800 border-emerald-200",
  "Light Touches": "bg-lime-100 text-lime-800 border-lime-200",
  "Noticeable Patterns": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Needs Another Pass": "bg-orange-100 text-orange-800 border-orange-200",
  "Full Robot Mode": "bg-red-100 text-red-800 border-red-200",
  "Unedited AI Output": "bg-red-200 text-red-900 border-red-300",
};

function styleFor(label: string): string {
  return LABEL_COLORS[label] ?? "bg-zinc-100 text-zinc-700 border-zinc-200";
}

export function RollCall() {
  const [verdicts, setVerdicts] = useState<Verdict[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/recent-verdicts", { cache: "no-store" });
        if (!res.ok) return;
        const data = (await res.json()) as { verdicts?: Verdict[] };
        if (!cancelled) setVerdicts(data.verdicts ?? []);
      } catch {
        if (!cancelled) setVerdicts([]);
      }
    };
    load();
    const id = setInterval(load, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (verdicts === null) return null;

  if (verdicts.length === 0) {
    return (
      <p className="text-zinc-400 text-xs font-mono">
        First one of the day. Paste away.
      </p>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-2" aria-label="Recent reports">
      <span className="text-zinc-400 text-xs font-mono uppercase tracking-wider">
        Just in
      </span>
      {verdicts.map((v, idx) => (
        <span
          key={idx}
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-mono ${styleFor(
            v.label
          )}`}
          title={`Recent: ${v.label}`}
        >
          {v.label}
        </span>
      ))}
    </div>
  );
}
