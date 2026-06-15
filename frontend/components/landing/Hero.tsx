import Link from "next/link";
import { ArrowRight, Sparkles, Star } from "lucide-react";

export function Hero() {
  return (
    <section className="relative pt-32 pb-24 px-6 flex flex-col items-center text-center overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-40 left-1/4 w-[300px] h-[300px] bg-violet-800/10 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute top-40 right-1/4 w-[300px] h-[300px] bg-indigo-800/10 rounded-full blur-[80px] pointer-events-none" />

      {/* Badge */}
      <div className="relative inline-flex items-center gap-2 bg-violet-950/80 border border-violet-700/50 text-violet-300 text-xs font-medium px-4 py-1.5 rounded-full mb-8">
        <Sparkles className="w-3 h-3" />
        RAG-powered · Source-backed · No hallucinations
      </div>

      {/* Headline */}
      <h1 className="relative text-5xl md:text-7xl font-extrabold tracking-tight max-w-4xl leading-[1.08] mb-6">
        Stop Googling.<br />
        <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
          Start Shipping.
        </span>
      </h1>

      {/* Sub */}
      <p className="relative text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed mb-10">
        RepoFlow AI generates <span className="text-zinc-200 font-medium">Integration Blueprints</span> — the exact glue code to connect your frontend component to any backend architecture. Every snippet is sourced from top GitHub repos.
      </p>

      {/* CTAs */}
      <div className="relative flex flex-col sm:flex-row items-center gap-4 mb-16">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all duration-200 px-7 py-3.5 rounded-xl font-semibold text-base shadow-lg shadow-violet-900/40 hover:shadow-violet-800/50"
        >
          Generate your first Blueprint
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="https://github.com"
          target="_blank"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-100 transition-colors text-sm"
        >
          <Star className="w-4 h-4" />
          Star on GitHub (Lite is free)
        </Link>
      </div>

      {/* Social proof */}
      <div className="relative flex flex-col sm:flex-row items-center gap-6 text-sm text-zinc-500">
        <span className="flex items-center gap-2">
          <span className="flex -space-x-2">
            {["🧑‍💻","👩‍💻","🧑‍🔬","👨‍💻","🧑‍🎨"].map((e, i) => (
              <span
                key={i}
                className="w-7 h-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-xs"
              >
                {e}
              </span>
            ))}
          </span>
          <span>2,400+ developers already shipped faster</span>
        </span>
        <span className="hidden sm:block text-zinc-700">·</span>
        <span className="flex items-center gap-1">
          {[1,2,3,4,5].map(i => (
            <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          ))}
          <span className="ml-1">4.9 / 5 from early users</span>
        </span>
      </div>

      {/* Hero terminal mockup */}
      <div className="relative mt-20 w-full max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-900/60 backdrop-blur overflow-hidden shadow-2xl shadow-black/60">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-green-500/70" />
          <span className="ml-4 text-xs text-zinc-500 font-mono">RepoFlow AI — Blueprint Workspace</span>
        </div>
        <div className="grid md:grid-cols-2 min-h-[320px]">
          {/* Left: prompt */}
          <div className="border-r border-zinc-800 p-6">
            <p className="text-xs text-zinc-500 font-mono mb-3">// your query</p>
            <p className="text-sm text-zinc-200 leading-relaxed">
              Connect a{" "}
              <span className="text-violet-400">Tailwind login form</span>{" "}
              to a{" "}
              <span className="text-emerald-400">FastAPI JWT auth endpoint</span>
            </p>
            <button className="mt-6 flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors text-sm px-4 py-2 rounded-lg font-medium">
              Generate Blueprint <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {/* Right: output */}
          <div className="p-6 bg-zinc-950/40">
            <p className="text-xs text-zinc-500 font-mono mb-3">// generated glue code</p>
            <pre className="text-xs text-zinc-300 font-mono leading-relaxed overflow-hidden">
{`// useAuth.ts — frontend glue
export async function loginUser(
  email: string,
  password: string
) {
  const res = await fetch(
    \`\${process.env.NEXT_PUBLIC_API_URL}/auth/token\`,
    {
      method: "POST",
      headers: {"Content-Type":"application/x-www-form-urlencoded"},
      body: new URLSearchParams({username:email,password})
    }
  );
  if (!res.ok) throw new Error("Auth failed");
  return res.json(); // { access_token, token_type }
}`}
            </pre>
          </div>
        </div>
        {/* Source attribution strip */}
        <div className="border-t border-zinc-800 px-6 py-2.5 flex items-center gap-4 bg-zinc-900/80">
          <span className="text-xs text-zinc-500">Sources:</span>
          <a href="#" className="text-xs text-violet-400 hover:underline font-mono">tiangolo/fastapi → oauth2.py</a>
          <span className="text-zinc-700">·</span>
          <a href="#" className="text-xs text-violet-400 hover:underline font-mono">shadcn-ui/ui → LoginForm.tsx</a>
        </div>
      </div>
    </section>
  );
}
