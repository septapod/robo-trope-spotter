"use client";

import { useEffect, useState } from "react";
import { SignInModal } from "./SignInModal";

interface UserShape {
  id: string;
  email: string;
  displayName: string | null;
  profileUrl: string | null;
}

/**
 * Top-right auth indicator. When anonymous: "Sign in" link.
 * When signed in: small display name + sign-out link.
 *
 * Kept intentionally minimal. No avatars, no dropdown menus. Adding accounts
 * is a quiet feature, not a hero one.
 */
export function AuthMenu() {
  const [user, setUser] = useState<UserShape | null | undefined>(undefined);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : { user: null }))
      .then((data) => {
        if (!cancelled) setUser(data.user ?? null);
      })
      .catch(() => {
        if (!cancelled) setUser(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSignOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setUser(null);
  };

  if (user === undefined) return null;

  return (
    <>
      <div className="absolute top-4 right-4 z-20 text-xs font-mono">
        {user ? (
          <div className="flex items-center gap-2 text-zinc-500">
            <span className="text-zinc-700">{user.displayName ?? user.email}</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleSignOut}
              className="text-link-pink underline underline-offset-4 hover:no-underline"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="text-link-pink underline underline-offset-4 hover:no-underline"
          >
            Sign in
          </button>
        )}
      </div>
      <SignInModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  );
}
