"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type AuthModalProps = {
  open: boolean;
  mode: "sign-in" | "sign-up";
  onClose: () => void;
  onSuccess: () => void;
};

export function AuthModal({ open, mode: initialMode, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!open) return null;

  const resetMessages = () => {
    setError(null);
    setMessage(null);
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    resetMessages();
    setLoading(true);

    const supabase = createClient();

    try {
      if (mode === "sign-up") {
        const cleanUsername = username.trim().toLowerCase();
        if (!/^[a-z0-9_]{3,24}$/.test(cleanUsername)) {
          throw new Error("Username must be 3–24 chars: letters, numbers, underscore");
        }

        const { error: signUpError } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              username: cleanUsername,
              display_name: displayName.trim() || cleanUsername,
            },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) {
          setMessage("Account created. Check your email to confirm, then sign in.");
          setMode("sign-in");
          return;
        }

        onSuccess();
        return;
      }

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) throw signInError;
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="glass relative z-[1] w-full max-w-md rounded-2xl p-6 sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-sans text-[9px] tracking-[0.28em] text-faint uppercase">account</p>
            <h2 className="mt-1 font-display text-[1.5rem] font-bold tracking-[-0.04em] text-chrome">
              {mode === "sign-in" ? "sign in" : "create account"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="font-sans text-[18px] leading-none text-muted transition-colors hover:text-chrome"
          >
            ×
          </button>
        </div>

        <form onSubmit={submit} className="mt-6 space-y-4">
          {mode === "sign-up" ? (
            <>
              <label className="block space-y-1.5">
                <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">
                  username
                </span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
                  className="auth-input"
                  placeholder="your_handle"
                />
              </label>
              <label className="block space-y-1.5">
                <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">
                  display name
                </span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                  className="auth-input"
                  placeholder="optional"
                />
              </label>
            </>
          ) : null}

          <label className="block space-y-1.5">
            <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="auth-input"
            />
          </label>

          <label className="block space-y-1.5">
            <span className="font-sans text-[10px] tracking-[0.12em] text-muted uppercase">
              password
            </span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className="auth-input"
            />
          </label>

          {error ? <p className="font-sans text-[11px] text-[#ffb7c5]">{error}</p> : null}
          {message ? <p className="font-sans text-[11px] text-chrome/70">{message}</p> : null}

          <button type="submit" disabled={loading} className="action-chip action-chip-open w-full justify-center">
            <span className="action-chip-shine" aria-hidden="true" />
            <span>{loading ? "..." : mode === "sign-in" ? "sign in" : "sign up"}</span>
          </button>
        </form>

        <p className="mt-5 font-sans text-[11px] text-muted">
          {mode === "sign-in" ? "no account?" : "already have one?"}{" "}
          <button
            type="button"
            className="text-chrome/80 underline-offset-2 hover:text-chrome hover:underline"
            onClick={() => {
              resetMessages();
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            }}
          >
            {mode === "sign-in" ? "sign up" : "sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
