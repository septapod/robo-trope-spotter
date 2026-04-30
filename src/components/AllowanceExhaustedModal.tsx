"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

type Phase = "menu" | "newsletter" | "newsletter-sent" | "tip-thanks" | "error";

export function AllowanceExhaustedModal({ open, onClose, onUnlocked }: Props) {
  const [phase, setPhase] = useState<Phase>("menu");
  const [email, setEmail] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [busy, setBusy] = useState(false);

  if (!open) return null;

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not subscribe right now.");
        setPhase("error");
      } else {
        setPhase("newsletter-sent");
        onUnlocked();
      }
    } catch {
      setErrorMsg("Could not reach the server.");
      setPhase("error");
    } finally {
      setBusy(false);
    }
  };

  const handleTip = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setErrorMsg(data.error || "Could not start checkout.");
        setPhase("error");
        return;
      }
      window.location.href = data.url;
    } catch {
      setErrorMsg("Could not reach the server.");
      setPhase("error");
    } finally {
      setBusy(false);
    }
  };

  const handleNoThanks = async () => {
    if (busy) return;
    setBusy(true);
    setErrorMsg("");
    try {
      const res = await fetch("/api/unlock", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not unlock right now.");
        setPhase("error");
        return;
      }
      onUnlocked();
      onClose();
    } catch {
      setErrorMsg("Could not reach the server.");
      setPhase("error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exhausted-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 id="exhausted-title" className="font-display text-xl font-bold text-zinc-900">
            You've used your free analyses for today.
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none ml-2"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {phase === "menu" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-600 leading-relaxed">
              Three ways to keep going. Pick whichever feels right.
            </p>

            <button
              type="button"
              onClick={() => setPhase("newsletter")}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-4 text-left transition-colors hover:border-link-pink hover:bg-pink-50"
            >
              <div className="font-display font-bold text-zinc-900">Subscribe to AI for FIs</div>
              <div className="text-xs text-zinc-500 mt-1">
                Free weekly newsletter. Unlocks unlimited analyses for 30 days.
              </div>
            </button>

            <button
              type="button"
              onClick={handleTip}
              disabled={busy}
              className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-4 text-left transition-colors hover:border-link-pink hover:bg-pink-50 disabled:opacity-50"
            >
              <div className="font-display font-bold text-zinc-900">Buy Brent a coffee</div>
              <div className="text-xs text-zinc-500 mt-1">
                Pay what feels right. Unlocks today's quota.
              </div>
            </button>

            <button
              type="button"
              onClick={handleNoThanks}
              disabled={busy}
              className="w-full rounded-xl px-4 py-3 text-sm text-zinc-600 transition-colors hover:bg-zinc-50 disabled:opacity-50"
            >
              No thanks, just unlock today
            </button>

            <p className="text-xs text-zinc-400 text-center pt-1">
              Or come back tomorrow — quota resets at midnight UTC.
            </p>
          </div>
        )}

        {phase === "newsletter" && (
          <form onSubmit={handleNewsletterSubmit} className="space-y-4">
            <p className="text-sm text-zinc-600 leading-relaxed">
              The newsletter is one weekly read on AI in financial services. Drop your email; we'll add you and unlock 30 days of unlimited analyses.
            </p>
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">Email</span>
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-base focus:border-candy-pink focus:outline-none focus:ring-2 focus:ring-candy-pink/20"
              />
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPhase("menu")}
                className="flex-1 rounded-lg border border-zinc-300 py-2 px-4 text-sm text-zinc-700 hover:bg-zinc-50"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={busy}
                className="flex-1 rounded-lg bg-candy-pink py-2 px-4 font-display font-bold text-white hover:bg-pink-600 disabled:bg-zinc-300"
              >
                {busy ? "Subscribing..." : "Subscribe + unlock"}
              </button>
            </div>
          </form>
        )}

        {phase === "newsletter-sent" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-700 leading-relaxed">
              You're on the list. Unlimited analyses for the next 30 days. Check your inbox for a welcome from AI for FIs.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg bg-candy-pink py-2 px-4 font-display font-bold text-white hover:bg-pink-600"
            >
              Run another analysis
            </button>
          </div>
        )}

        {phase === "error" && (
          <div className="space-y-3">
            <p role="alert" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              {errorMsg}
            </p>
            <button
              type="button"
              onClick={() => setPhase("menu")}
              className="w-full rounded-lg border border-zinc-300 py-2 px-4 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
