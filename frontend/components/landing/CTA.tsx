import Link from "next/link";
import { ArrowRight, GitFork } from "lucide-react";

export function CTA() {
  return (
    <section className="py-28 px-6">
      <div className="max-w-4xl mx-auto relative">
        {/* Background glow */}
        <div className="absolute inset-0 bg-violet-600/10 rounded-3xl blur-3xl" />

        <div className="relative bg-gradient-to-br from-violet-950/60 to-zinc-900/80 border border-violet-800/40 rounded-3xl px-8 py-16 md:py-20 text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-14 h-14 bg-violet-600 rounded-2xl mb-8 mx-auto shadow-xl shadow-violet-900/60">
            <GitFork className="w-7 h-7 text-white" />
          </div>

          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 max-w-2xl mx-auto">
            Ship your next integration{" "}
            <span className="text-violet-400">in 30 seconds</span>
          </h2>

          <p className="text-zinc-400 text-lg max-w-lg mx-auto mb-10">
            Join 2,400+ developers who stopped googling and started generating source-backed Integration Blueprints.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all px-8 py-4 rounded-xl font-bold text-base shadow-xl shadow-violet-900/40 hover:shadow-violet-800/50"
            >
              Generate your first Blueprint free
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard"
              className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
            >
              No credit card required
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
