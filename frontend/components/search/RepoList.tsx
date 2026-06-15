"use client";

import { useEffect, useState } from "react";
import { 
  GitFork, 
  Star, 
  RefreshCw, 
  Trash2, 
  ExternalLink, 
  Plus, 
  Loader2, 
  Database,
  ShieldCheck,
  Layout,
  Layers,
  Server,
  Workflow
} from "lucide-react";
import toast from "react-hot-toast";
import { listRepos, reindexRepo, deleteRepo } from "@/lib/api";
import type { Repo } from "@/lib/types";
import { ConnectRepoModal } from "./ConnectRepoModal";

export function RepoList() {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  async function fetchRepos() {
    try {
      const data = await listRepos();
      setRepos(data);
    } catch (err: unknown) {
      toast.error("Failed to load repositories");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchRepos();

    // Set up a polling interval in case repositories are indexing
    const interval = setInterval(async () => {
      try {
        const data = await listRepos();
        setRepos(data);
      } catch (e) {
        // ignore polling errors
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  async function handleReindex(repoId: string, repoName: string) {
    try {
      // Optimistic status update
      setRepos(prev => 
        prev.map(r => r.id === repoId ? { ...r, is_active: false, description: "Re-indexing in progress..." } : r)
      );
      await reindexRepo(repoId);
      toast.success(`Triggered indexing for ${repoName}`);
    } catch (err: unknown) {
      toast.error("Failed to trigger re-indexing");
      fetchRepos();
    }
  }

  async function handleDelete(repoId: string, repoName: string) {
    if (!confirm(`Are you sure you want to remove ${repoName} from your workspace?`)) return;
    try {
      setRepos(prev => prev.filter(r => r.id !== repoId));
      await deleteRepo(repoId);
      toast.success(`Removed ${repoName}`);
    } catch (err: unknown) {
      toast.error("Failed to delete repository");
      fetchRepos();
    }
  }

  function formatStars(count: number): string {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  }

  function getCategoryStyles(category: string) {
    switch (category) {
      case "frontend":
        return { bg: "bg-sky-950/50", text: "text-sky-400", border: "border-sky-900/50", icon: Layout };
      case "backend":
        return { bg: "bg-emerald-950/50", text: "text-emerald-400", border: "border-emerald-900/50", icon: Server };
      case "fullstack":
        return { bg: "bg-violet-950/50", text: "text-violet-400", border: "border-violet-900/50", icon: Layers };
      case "ui-library":
        return { bg: "bg-pink-950/50", text: "text-pink-400", border: "border-pink-900/50", icon: Layout };
      case "auth":
        return { bg: "bg-amber-950/50", text: "text-amber-400", border: "border-amber-900/50", icon: ShieldCheck };
      case "database":
        return { bg: "bg-rose-950/50", text: "text-rose-400", border: "border-rose-900/50", icon: Database };
      default:
        return { bg: "bg-zinc-950/50", text: "text-zinc-400", border: "border-zinc-800", icon: Workflow };
    }
  }

  return (
    <div className="flex flex-col h-full bg-zinc-950">
      {/* Header section */}
      <div className="p-6 border-b border-zinc-900 flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-base mb-1 text-zinc-100">Workspace Repositories</h2>
          <p className="text-xs text-zinc-500">Manage repos queried for integration blueprints.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-1 bg-violet-600 hover:bg-violet-500 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-lg hover:shadow-violet-900/20 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          Connect
        </button>
      </div>

      {/* Repo list content */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-zinc-500 py-12">
            <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
            <span className="text-xs">Loading repositories...</span>
          </div>
        ) : repos.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-3 text-zinc-600 border border-dashed border-zinc-800 rounded-xl py-12 px-4 text-center">
            <GitFork className="w-8 h-8 text-zinc-700" />
            <div>
              <p className="text-xs font-semibold text-zinc-400">No Custom Repositories Connected</p>
              <p className="text-[11px] text-zinc-500 mt-1 max-w-[260px] mx-auto">
                Connect your first GitHub repository to parse and index code for integrations.
              </p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="mt-2 text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors border border-violet-900 hover:border-violet-700 px-3 py-1.5 rounded-lg bg-violet-950/20"
            >
              Connect Repository
            </button>
          </div>
        ) : (
          repos.map((repo) => {
            const styles = getCategoryStyles(repo.category);
            const CatIcon = styles.icon;

            return (
              <div 
                key={repo.id}
                className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-xl p-4 flex flex-col gap-3 transition-all group"
              >
                {/* Repo Info Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-semibold text-zinc-200 font-mono tracking-tight break-all">
                      {repo.owner}/{repo.name}
                    </span>
                    
                    {/* Stars & Category */}
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                        <Star className="w-3 h-3 text-amber-500 fill-amber-500/20" />
                        <span>{formatStars(repo.stars)}</span>
                      </div>
                      
                      <span className="text-[10px] text-zinc-600 font-medium">•</span>

                      <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded border text-[9px] font-semibold uppercase tracking-wider ${styles.bg} ${styles.text} ${styles.border}`}>
                        <CatIcon className="w-2.5 h-2.5" />
                        <span>{repo.category}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <a
                      href={repo.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 rounded-md transition-colors"
                      title="View on GitHub"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleReindex(repo.id, `${repo.owner}/${repo.name}`)}
                      disabled={!repo.is_active}
                      className="p-1.5 text-zinc-500 hover:text-violet-400 hover:bg-zinc-800 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Trigger reindex"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(repo.id, `${repo.owner}/${repo.name}`)}
                      className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded-md transition-colors"
                      title="Remove repository"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Description */}
                <p className="text-[11px] text-zinc-500 leading-normal line-clamp-2">
                  {repo.description || "No description provided."}
                </p>

                {/* Status Indicator */}
                <div className="flex items-center justify-between border-t border-zinc-800/40 pt-2.5 mt-0.5">
                  <div className="flex items-center gap-1.5">
                    {repo.is_active ? (
                      <>
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        <span className="text-[10px] text-zinc-400 font-medium">Ready</span>
                      </>
                    ) : (
                      <>
                        <Loader2 className="w-3 h-3 animate-spin text-violet-400" />
                        <span className="text-[10px] text-violet-400 font-medium">Indexing...</span>
                      </>
                    )}
                  </div>

                  {repo.last_indexed_at && (
                    <span className="text-[9px] text-zinc-600 font-mono">
                      Indexed: {new Date(repo.last_indexed_at).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      <ConnectRepoModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConnected={(newRepo) => {
          setRepos(prev => [newRepo, ...prev]);
        }}
      />
    </div>
  );
}
