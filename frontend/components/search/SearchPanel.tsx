"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { generateBlueprint } from "@/lib/api";
import type { SearchResponse } from "@/lib/types";

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
    <div className="p-6 flex flex-col gap-6">
      <div>
        <h2 className="font-semibold text-base mb-1">Generate Blueprint</h2>
        <p className="text-xs text-zinc-500">
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
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 focus:ring-violet-600 min-h-[100px]"
        />
        <button
          onClick={() => handleSearch(query)}
          disabled={isLoading || !query.trim()}
          className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2.5 rounded-lg text-sm font-medium"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Search className="w-4 h-4" />
          )}
          {isLoading ? "Generating..." : "Generate Blueprint"}
        </button>
        <p className="text-xs text-zinc-600">⌘ + Enter to search</p>
      </div>

      {/* Example queries */}
      <div className="flex flex-col gap-2">
        <span className="text-xs font-medium text-zinc-500 uppercase tracking-wide">
          Try an example
        </span>
        {EXAMPLE_QUERIES.map((q) => (
          <button
            key={q}
            onClick={() => {
              setQuery(q);
              handleSearch(q);
            }}
            className="text-left text-xs text-zinc-400 hover:text-violet-400 hover:bg-violet-950/50 px-3 py-2 rounded-md transition-colors border border-transparent hover:border-violet-900"
          >
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}
