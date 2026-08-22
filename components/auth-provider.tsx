"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { User } from "@supabase/supabase-js";
import { createClient, supabaseConfigured } from "@/lib/supabase/client";
import type { SessionUser } from "@/lib/auth-server";
import { DEMO_USER, isDemoModeActive } from "@/lib/demo-reviews";
import { AuthModal } from "./auth-modal";

type AuthContextValue = {
  user: SessionUser | null;
  loading: boolean;
  configured: boolean;
  openAuth: (mode?: "sign-in" | "sign-up") => void;
  refreshUser: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchSessionUser(): Promise<SessionUser | null> {
  const res = await fetch("/api/me", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { user: SessionUser | null };
  return data.user;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const configured = supabaseConfigured();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [loading, setLoading] = useState(configured);
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [demoMode, setDemoMode] = useState(() =>
    typeof window === "undefined" ? false : isDemoModeActive(),
  );

  useEffect(() => {
    setDemoMode(isDemoModeActive());
  }, []);

  const effectiveUser = demoMode ? DEMO_USER : user;
  const effectiveLoading = demoMode ? false : loading;

  const refreshUser = useCallback(async () => {
    if (!configured) {
      setUser(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      setUser(await fetchSessionUser());
    } finally {
      setLoading(false);
    }
  }, [configured]);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!configured) return;

    const supabase = createClient();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event: string, session: { user: User } | null) => {
      if (session?.user) {
        void refreshUser();
      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [configured, refreshUser]);

  const openAuth = useCallback((mode: "sign-in" | "sign-up" = "sign-in") => {
    setAuthMode(mode);
    setAuthOpen(true);
  }, []);

  const signOut = useCallback(async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user: effectiveUser,
      loading: effectiveLoading,
      configured,
      openAuth,
      refreshUser,
      signOut,
    }),
    [effectiveUser, effectiveLoading, configured, openAuth, refreshUser, signOut],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
      {configured ? (
        <AuthModal
          open={authOpen}
          mode={authMode}
          onClose={() => setAuthOpen(false)}
          onSuccess={() => {
            setAuthOpen(false);
            void refreshUser();
          }}
        />
      ) : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
