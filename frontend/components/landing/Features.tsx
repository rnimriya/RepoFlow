import {
  Shield,
  Zap,
  GitFork,
  Code2,
  Layers,
  RefreshCw,
} from "lucide-react";

const FEATURES = [
  {
    icon: <Shield className="w-5 h-5 text-violet-400" />,
    title: "Source attribution on every line",
    desc: "Developers don't trust blind AI output. Every snippet links back to the original GitHub file, commit, and line range. Show your team the receipts.",
    highlight: true,
  },
  {
    icon: <Zap className="w-5 h-5 text-yellow-400" />,
    title: "Fast-track AI models",
    desc: "Pro users get GPT-4o and Claude 3.5 Sonnet — the two highest-accuracy models for code generation. Starter uses GPT-3.5 for quick searches.",
    highlight: false,
  },
  {
    icon: <Code2 className="w-5 h-5 text-emerald-400" />,
    title: "Cross-file Integration Blueprints",
    desc: "Not just a single snippet — full end-to-end blueprints with shared TypeScript types, custom hooks, middleware, and step-by-step wiring instructions.",
    highlight: false,
  },
  {
    icon: <GitFork className="w-5 h-5 text-sky-400" />,
    title: "Push to PR with one click",
    desc: "Pro users can push generated glue code directly to a GitHub branch and open a PR — no copy-paste, no context switching.",
    highlight: false,
  },
  {
    icon: <Layers className="w-5 h-5 text-fuchsia-400" />,
    title: "Semantic search, not keyword matching",
    desc: "Search for 'user login flow' and find actual authentication code — not files named 'login.ts'. Powered by OpenAI embeddings + Pinecone vector search.",
    highlight: false,
  },
  {
    icon: <RefreshCw className="w-5 h-5 text-orange-400" />,
    title: "Always up-to-date index",
    desc: "GitHub Actions re-indexes all curated repos every Monday. You're always getting code from the latest main branch, not a 2-year-old snapshot.",
    highlight: false,
  },
];

export function Features() {
  return (
    <section id="features" className="py-28 px-6 bg-zinc-900/30">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Features</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Built for developers who ship
          </h2>
          <p className="mt-4 text-zinc-400 max-w-xl mx-auto">
            Every feature is designed to collapse the gap between "I know what I want" and "it's running in production."
          </p>
        </div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className={`relative flex flex-col gap-4 rounded-2xl p-6 border transition-all duration-300 hover:-translate-y-0.5 ${
                f.highlight
                  ? "bg-violet-950/40 border-violet-700/50 hover:border-violet-600/70"
                  : "bg-zinc-900/60 border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {f.highlight && (
                <span className="absolute -top-3 left-5 text-xs font-semibold bg-violet-600 text-white px-3 py-0.5 rounded-full">
                  Key differentiator
                </span>
              )}
              <div className="w-10 h-10 bg-zinc-800 rounded-xl flex items-center justify-center">
                {f.icon}
              </div>
              <h3 className="font-semibold text-zinc-100">{f.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
