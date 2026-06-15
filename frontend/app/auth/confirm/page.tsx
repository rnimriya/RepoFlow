"use client";

/**
 * Client-side PKCE code exchange.
 * Supabase's PKCE flow stores the code_verifier in a browser cookie.
 * This page runs in the browser, picks up that cookie, and exchanges
 * the auth code for a session — then redirects to the dashboard.
 */
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { GitFork, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = searchParams.get("code");
    const next = searchParams.get("next") ?? "/dashboard";

    if (!code) {
      setError("No auth code found. Please try signing in again.");
      return;
    }

    const supabase = createClient();

    supabase.auth.exchangeCodeForSession(code).then(({ error }) => {
      if (error) {
        setError(error.message);
        return;
      }
      router.replace(next);
    });
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center px-4">
      <div className="text-center">
        {/* Logo */}
        <div className="inline-flex items-center gap-2 font-bold text-xl tracking-tight mb-8">
          <div className="w-9 h-9 bg-violet-600 rounded-xl flex items-center justify-center">
            <GitFork className="w-5 h-5 text-white" />
          </div>
          RepoFlow <span className="text-violet-400">AI</span>
        </div>

        {error ? (
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 bg-red-950/50 border border-red-800/60 rounded-full flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-red-400" />
            </div>
            <p className="text-sm text-red-300 max-w-sm">{error}</p>
            <button
              onClick={() => router.push("/login")}
              className="mt-2 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              ← Back to sign in
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
            <p className="text-sm text-zinc-400">Signing you in...</p>
          </div>
        )}
      </div>
    </div>
  );
}
