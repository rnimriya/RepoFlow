import { Search, Cpu, FileCode2, GitPullRequest } from "lucide-react";

const STEPS = [
  {
    icon: <Search className="w-5 h-5" />,
    number: "01",
    title: "Describe the integration",
    desc: 'Type what you\'re trying to connect — e.g. "Link my React file upload component to an S3 presigned URL endpoint". No boilerplate, no Stack Overflow tabs.',
    color: "from-violet-600 to-violet-800",
    glow: "group-hover:shadow-violet-900/60",
  },
  {
    icon: <Cpu className="w-5 h-5" />,
    number: "02",
    title: "RAG retrieves real code",
    desc: "Semantic search finds the best matching frontend and backend snippets from 10,000+ indexed files across curated, high-star GitHub repos.",
    color: "from-indigo-600 to-indigo-800",
    glow: "group-hover:shadow-indigo-900/60",
  },
  {
    icon: <FileCode2 className="w-5 h-5" />,
    number: "03",
    title: "AI synthesizes the Blueprint",
    desc: "GPT-4o or Claude 3.5 Sonnet acts as the bridge — rewriting both sides so they speak the same language, with inline comments and step-by-step wiring instructions.",
    color: "from-purple-600 to-purple-800",
    glow: "group-hover:shadow-purple-900/60",
  },
  {
    icon: <GitPullRequest className="w-5 h-5" />,
    number: "04",
    title: "Ship it — with sources",
    desc: "Copy the glue code or push it straight to a PR. Every line links back to its GitHub source file so your team can audit, trust, and extend it.",
    color: "from-fuchsia-600 to-fuchsia-800",
    glow: "group-hover:shadow-fuchsia-900/60",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">How it works</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            From prompt to production code
            <br />
            <span className="text-zinc-500">in 30 seconds</span>
          </h2>
        </div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {STEPS.map((step) => (
            <div
              key={step.number}
              className="group relative flex flex-col gap-4 bg-zinc-900/60 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1"
            >
              {/* Icon */}
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center text-white shadow-lg ${step.glow} transition-shadow`}>
                {step.icon}
              </div>
              {/* Number */}
              <span className="absolute top-5 right-5 text-3xl font-black text-zinc-800 select-none group-hover:text-zinc-700 transition-colors">
                {step.number}
              </span>
              <h3 className="font-semibold text-zinc-100 text-base leading-snug">{step.title}</h3>
              <p className="text-sm text-zinc-500 leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>

        {/* Connector line (desktop) */}
        <div className="hidden lg:flex items-center justify-center mt-8 gap-0">
          {STEPS.map((_, i) => (
            <div key={i} className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-violet-500" />
              </div>
              {i < STEPS.length - 1 && (
                <div className="w-32 h-px bg-gradient-to-r from-zinc-700 to-zinc-700" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
