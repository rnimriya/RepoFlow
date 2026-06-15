"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { SearchPanel } from "@/components/search/SearchPanel";
import { BlueprintViewer } from "@/components/blueprint/BlueprintViewer";
import { useAuth } from "@/lib/auth/AuthProvider";
import type { SearchResponse } from "@/lib/types";

export default function DashboardPage() {
  const [result, setResult] = useState<SearchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="h-screen flex flex-col bg-zinc-950">
      {/* Top bar */}
      <header className="border-b border-zinc-800 px-6 py-3 flex items-center gap-3 shrink-0">
        <span className="font-bold tracking-tight">
          RepoFlow <span className="text-violet-400">AI</span>
        </span>
        <span className="text-zinc-600 text-sm">/ Workspace</span>

        {/* Spacer */}
        <div className="flex-1" />

        {/* User info + sign out */}
        {user && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 hidden sm:block">{user.email}</span>
            <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-xs font-bold text-white">
              {(user.user_metadata?.full_name || user.email || "?")[0].toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-300 transition-colors bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 rounded-lg"
              title="Sign out"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        )}
      </header>

      {/* Split-screen workspace */}
      <div className="flex-1 grid md:grid-cols-[420px_1fr] overflow-hidden">
        {/* Left: Search */}
        <div className="border-r border-zinc-800 overflow-y-auto">
          <SearchPanel
            onResult={setResult}
            onLoadingChange={setIsLoading}
          />
        </div>

        {/* Right: Blueprint Viewer */}
        <div className="overflow-y-auto">
          <BlueprintViewer result={result} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
