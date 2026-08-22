"use client";

import { useEffect, useState } from "react";
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

  useEffect(() => {
    if (open) setMode(initialMode);
  }, [open, initialMode]);

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const resetMessages = () => setError(null);

  const friendlyAuthError = (message: string) => {
    const lower = message.toLowerCase();
    if (lower.includes("email not confirmed") || lower.includes("not verified")) {
      return "Your email isn't verified yet — try again in a moment or contact support.";
    }
    if (lower.includes("rate limit") || lower.includes("too many")) {
      return "Too many attempts — wait a minute and try again.";
    }
    if (lower.includes("invalid login credentials")) {
      return "Wrong email or password.";
    }
    if (lower.includes("already registered") || lower.includes("already exists")) {
      return "An account with this email already exists — try signing in.";
    }
    return message;
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

        const signupRes = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim(),
            password,
            username: cleanUsername,
            displayName: displayName.trim() || cleanUsername,
          }),
        });

        const signupBody = (await signupRes.json()) as { error?: string };

        if (!signupRes.ok) {
          throw new Error(signupBody.error ?? "Could not create account");
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (signInError) throw signInError;
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
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(friendlyAuthError(message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-modal-root" role="dialog" aria-modal="true" aria-labelledby="auth-modal-title">
      <button type="button" aria-label="Close" className="auth-modal-backdrop" onClick={onClose} />

      <div className="auth-modal-panel">
        <div className="auth-modal-glow" aria-hidden="true" />

        <button type="button" onClick={onClose} className="auth-modal-close" aria-label="Close">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
            <path
              fill="currentColor"
              d="M6.4 5.3a1 1 0 0 0-1.4 1.4L10.6 12l-5.6 5.3a1 1 0 1 0 1.4 1.4L12 13.4l5.6 5.3a1 1 0 0 0 1.4-1.4L13.4 12l5.6-5.3a1 1 0 0 0-1.4-1.4L12 10.6 6.4 5.3Z"
            />
          </svg>
        </button>

        <div className="auth-modal-brand">
          <img src="/mark.png" alt="" width={36} height={36} className="auth-modal-mark" />
          <p className="auth-modal-kicker">nothingmoe</p>
          <h2 id="auth-modal-title" className="auth-modal-title chrome-text">
            {mode === "sign-in" ? "welcome back" : "join the ranking"}
          </h2>
          <p className="auth-modal-sub">
            {mode === "sign-in"
              ? "Sign in to review sites and boost your favorites."
              : "Create an account to join the community census and leave reviews."}
          </p>
        </div>

        <div className="auth-modal-tabs" role="tablist" aria-label="Account mode">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sign-in"}
            className={`auth-modal-tab${mode === "sign-in" ? " is-active" : ""}`}
            onClick={() => {
              resetMessages();
              setMode("sign-in");
            }}
          >
            sign in
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "sign-up"}
            className={`auth-modal-tab${mode === "sign-up" ? " is-active" : ""}`}
            onClick={() => {
              resetMessages();
              setMode("sign-up");
            }}
          >
            sign up
          </button>
        </div>

        <form onSubmit={submit} className="auth-modal-form">
          {mode === "sign-up" ? (
            <div className="auth-modal-fields auth-modal-fields-signup">
              <label className="auth-field">
                <span className="auth-field-label">username</span>
                <input
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  required
                  autoComplete="username"
                  className="auth-input"
                  placeholder="your_handle"
                />
              </label>
              <label className="auth-field">
                <span className="auth-field-label">display name</span>
                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  autoComplete="nickname"
                  className="auth-input"
                  placeholder="optional"
                />
              </label>
            </div>
          ) : null}

          <label className="auth-field">
            <span className="auth-field-label">email</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="auth-input"
              placeholder="you@example.com"
            />
          </label>

          <label className="auth-field">
            <span className="auth-field-label">password</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete={mode === "sign-up" ? "new-password" : "current-password"}
              className="auth-input"
              placeholder="min. 8 characters"
            />
          </label>

          {error ? (
            <p className="auth-modal-error" role="alert">
              {error}
            </p>
          ) : null}

          <button type="submit" disabled={loading} className="auth-modal-submit">
            <span className="action-chip-shine" aria-hidden="true" />
            <span>{loading ? "one sec…" : mode === "sign-in" ? "sign in" : "create account"}</span>
          </button>
        </form>

        <p className="auth-modal-foot">
          {mode === "sign-in" ? "New here?" : "Already ranked?"}{" "}
          <button
            type="button"
            className="auth-modal-foot-link"
            onClick={() => {
              resetMessages();
              setMode(mode === "sign-in" ? "sign-up" : "sign-in");
            }}
          >
            {mode === "sign-in" ? "Create an account" : "Sign in instead"}
          </button>
        </p>
      </div>
    </div>
  );
}
