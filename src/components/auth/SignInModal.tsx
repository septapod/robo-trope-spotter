"use client";

import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
}

type Phase = "form" | "sent" | "error";

export function SignInModal({ open, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<Phase>("form");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/send-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || "Could not send the sign-in link. Try again.");
        setPhase("error");
      } else {
        setPhase("sent");
      }
    } catch {
      setErrorMsg("Could not reach the server. Check your connection and try again.");
      setPhase("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <h2 id="signin-title" className="font-display text-xl font-bold text-zinc-900">
            Sign in
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 text-2xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        {phase === "form" && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <p className="text-sm text-zinc-600 leading-relaxed">
              Enter your email. We'll send you a one-time sign-in link. No password.
            </p>
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500">
                Email
              </span>
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
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-candy-pink py-3 px-4 font-display font-bold text-white transition-colors hover:bg-pink-600 disabled:bg-zinc-300 disabled:cursor-not-allowed"
            >
              {loading ? "Sending..." : "Send sign-in link"}
            </button>
          </form>
        )}

        {phase === "sent" && (
          <div className="space-y-3">
            <p className="text-sm text-zinc-700 leading-relaxed">
              Check <strong>{email}</strong> for a sign-in link. The link works once and expires in 15 minutes.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="w-full rounded-lg border border-zinc-300 py-2 px-4 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Got it
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
              onClick={() => setPhase("form")}
              className="w-full rounded-lg border border-zinc-300 py-2 px-4 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
