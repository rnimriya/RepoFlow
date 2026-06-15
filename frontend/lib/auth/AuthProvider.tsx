"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { User, Session } from "@supabase/supabase-js";

// ── Demo user shape (matches Supabase User closely enough) ────
const DEMO_USER = {
  id: "demo-user-001",
  email: "demo@repoflow.ai",
  user_metadata: { full_name: "Demo User" },
  app_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  role: "authenticated",
  updated_at: new Date().toISOString(),
} as unknown as User;

const DEMO_SESSION = {
  access_token: "demo-token",
  token_type: "bearer",
  expires_in: 86400,
  refresh_token: "demo-refresh",
  user: DEMO_USER,
} as unknown as Session;

const DEMO_KEY = "repoflow_demo_mode";

// ── Helpers ───────────────────────────────────────────────────
function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
  return (
    url.startsWith("https://") &&
    !url.includes("placeholder") &&
    key.startsWith("eyJ") &&
    !key.includes("placeholder")
  );
}

// ── Context ───────────────────────────────────────────────────
interface AuthContextValue {
  user: User | null;
  session: Session | null;
  loading: boolean;
  isDemoMode: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  signInAsDemo: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    // Check for persisted demo session
    if (typeof window !== "undefined") {
      const demo = localStorage.getItem(DEMO_KEY);
      if (demo === "true") {
        setUser(DEMO_USER);
        setSession(DEMO_SESSION);
        setIsDemoMode(true);
        setLoading(false);
        return;
      }
    }

    // Real Supabase auth
    if (supabaseReady) {
      import("@/lib/supabase/client").then(({ createClient }) => {
        const supabase = createClient();

        supabase.auth.getSession().then(({ data: { session } }) => {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, session) => {
            setSession(session);
            setUser(session?.user ?? null);
            setLoading(false);
          }
        );

        return () => subscription.unsubscribe();
      });
    } else {
      // Supabase not configured — just stop loading
      setLoading(false);
    }
  }, []);

  // ── Demo sign-in ─────────────────────────────────────────────
  const signInAsDemo = useCallback(() => {
    localStorage.setItem(DEMO_KEY, "true");
    setUser(DEMO_USER);
    setSession(DEMO_SESSION);
    setIsDemoMode(true);
  }, []);

  // ── Real sign-up ─────────────────────────────────────────────
  const signUp = useCallback(
    async (email: string, password: string, fullName: string) => {
      if (!supabaseReady) {
        return { error: "Supabase is not configured yet. Use the Demo account to explore the app." };
      }
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
        },
      });
      return { error: error?.message ?? null };
    },
    [supabaseReady]
  );

  // ── Real sign-in ─────────────────────────────────────────────
  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabaseReady) {
        return { error: "Supabase is not configured yet. Use the Demo account to explore the app." };
      }
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error: error?.message ?? null };
    },
    [supabaseReady]
  );

  // ── Google OAuth ─────────────────────────────────────────────
  const signInWithGoogle = useCallback(async () => {
    if (!supabaseReady) {
      return { error: "Supabase is not configured yet. Use the Demo account to explore the app." };
    }
    const { createClient } = await import("@/lib/supabase/client");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/confirm?next=/dashboard`,
      },
    });
    return { error: error?.message ?? null };
  }, [supabaseReady]);

  // ── Sign out ─────────────────────────────────────────────────
  const signOut = useCallback(async () => {
    if (isDemoMode) {
      localStorage.removeItem(DEMO_KEY);
      setUser(null);
      setSession(null);
      setIsDemoMode(false);
      return;
    }
    if (supabaseReady) {
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    setUser(null);
    setSession(null);
  }, [isDemoMode, supabaseReady]);

  return (
    <AuthContext.Provider
      value={{ user, session, loading, isDemoMode, signUp, signIn, signInWithGoogle, signInAsDemo, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
