"use client";

import { useState } from "react";
import { X, Loader2, GitBranch } from "lucide-react";
import toast from "react-hot-toast";
import { connectRepo } from "@/lib/api";
import type { Repo } from "@/lib/types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConnected: (repo: Repo) => void;
}

const CATEGORIES = [
  { value: "frontend", label: "Frontend App / Client" },
  { value: "backend", label: "Backend API Server" },
  { value: "fullstack", label: "Fullstack App (Next.js, T3, etc.)" },
  { value: "ui-library", label: "UI / Component Library" },
  { value: "auth", label: "Authentication Service" },
  { value: "database", label: "Database Client/Schema" },
  { value: "api", label: "Third-party Integration / SDK" },
];

export function ConnectRepoModal({ isOpen, onClose, onConnected }: Props) {
  const [githubUrl, setGithubUrl] = useState("");
  const [category, setCategory] = useState("frontend");
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!githubUrl.trim()) return;

    // Basic URL validation
    if (!githubUrl.includes("github.com/")) {
      toast.error("Please enter a valid GitHub repository URL (e.g. https://github.com/owner/repo)");
      return;
    }

    setIsLoading(true);
    try {
      const newRepo = await connectRepo(githubUrl.trim(), category);
      toast.success(`Connected ${newRepo.owner}/${newRepo.name}! Indexing started in the background.`);
      onConnected(newRepo);
      setGithubUrl("");
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to connect repository";
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      {/* Modal Card */}
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-violet-400" />
            <h3 className="font-semibold text-base text-zinc-100">Connect Repository</h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors p-1 rounded-md hover:bg-zinc-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">GitHub Repository URL</label>
            <input
              type="text"
              required
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="e.g. https://github.com/facebook/react"
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-600 rounded-lg px-3.5 py-2 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none transition-colors"
              disabled={isLoading}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-zinc-400">Repository Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-violet-600 rounded-lg px-3 py-2 text-sm text-zinc-200 focus:outline-none transition-colors cursor-pointer"
              disabled={isLoading}
            >
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value} className="bg-zinc-950 text-zinc-200">
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-zinc-500 leading-relaxed mt-1">
            * Connecting a repository scans its tree, extracts and processes supported code files (.ts, .tsx, .js, .jsx, .py), embeds them, and upserts them to the search index.
          </p>

          {/* Action buttons */}
          <div className="flex gap-3 justify-end mt-4 border-t border-zinc-800/50 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-violet-900/30 transition-all"
              disabled={isLoading || !githubUrl.trim()}
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connecting...
                </>
              ) : (
                "Connect & Index"
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
