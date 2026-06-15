"use client";

import { useState } from "react";
import { Search, Loader2, Sparkles, Database } from "lucide-react";
import toast from "react-hot-toast";
import { generateBlueprint } from "@/lib/api";
import type { SearchResponse } from "@/lib/types";
import { RepoList } from "./RepoList";

const EXAMPLE_QUERIES = [
  "Connect a Tailwind login form to FastAPI JWT authentication",
  "Link a React file upload component to an S3 presigned URL endpoint",
  "Wire a Next.js data table to a Django REST Framework paginated API",
  "Integrate a shadcn/ui toast with a FastAPI error response",
];

interface Props {
  onResult: (result: SearchResponse) => void;
  onLoadingChange: (loading: boolean) => void;
}

export function SearchPanel({ onResult, onLoadingChange }: Props) {
  const [activeTab, setActiveTab] = useState<"search" | "repos">("search");
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (q: string) => {
    if (!q.trim()) return;
    setIsLoading(true);
    onLoadingChange(true);

    try {
      const result = await generateBlueprint(q.trim());
      onResult(result);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      toast.error(message);
    } finally {
      setIsLoading(false);
      onLoadingChange(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Tabs Switcher */}
      <div className="flex border-b border-zinc-900 shrink-0">
        <button
          onClick={() => setActiveTab("search")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "search"
              ? "text-violet-400 border-violet-500 bg-violet-950/10"
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/30"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          Generate
        </button>
        <button
          onClick={() => setActiveTab("repos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all cursor-pointer ${
            activeTab === "repos"
              ? "text-violet-400 border-violet-500 bg-violet-950/10"
              : "text-zinc-500 border-transparent hover:text-zinc-300 hover:bg-zinc-900/30"
          }`}
        >
          <Database className="w-4 h-4" />
          Repositories
        </button>
      </div>

      {/* Tab Contents */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === "search" ? (
          <div className="p-6 flex flex-col gap-6">
            <div>
              <h2 className="font-semibold text-base mb-1 text-zinc-100">Generate Blueprint</h2>
              <p className="text-xs text-zinc-500 font-normal">
                Describe the frontend + backend connection you need.
              </p>
            </div>

            {/* Search input */}
            <div className="flex flex-col gap-2">
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleSearch(query);
                }}
                placeholder="e.g. Connect Tailwind login form to FastAPI JWT auth..."
                className="w-full bg-zinc-900/60 border border-zinc-800 focus:border-violet-600 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-600 resize-none focus:outline-none transition-colors min-h-[120px]"
              />
              <button
                onClick={() => handleSearch(query)}
                disabled={isLoading || !query.trim()}
                className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-violet-900/20 hover:shadow-lg transition-all px-4 py-2.5 rounded-lg text-sm font-medium cursor-pointer"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                {isLoading ? "Generating..." : "Generate Blueprint"}
              </button>
              <p className="text-[10px] text-zinc-600 font-medium">⌘ + Enter to search</p>
            </div>

            {/* Example queries */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                Try an example
              </span>
              {EXAMPLE_QUERIES.map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setQuery(q);
                    handleSearch(q);
                  }}
                  className="text-left text-xs text-zinc-400 hover:text-violet-400 hover:bg-violet-950/20 px-3.5 py-2.5 rounded-lg transition-all border border-zinc-900 hover:border-violet-900 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <RepoList />
        )}
      </div>
    </div>
  );
}

