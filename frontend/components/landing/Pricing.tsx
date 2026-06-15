import Link from "next/link";
import { Check, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Starter",
    price: "$5",
    period: "/month",
    desc: "For solo devs and explorers.",
    cta: "Start with Starter",
    ctaStyle: "bg-zinc-800 hover:bg-zinc-700 text-zinc-100",
    highlight: false,
    features: [
      "50 Blueprint searches / month",
      "Single-file snippet context",
      "Web dashboard",
      "Standard AI model (GPT-3.5)",
      "Copy to clipboard",
      "Source attribution links",
    ],
  },
  {
    name: "Pro",
    price: "$10",
    period: "/month",
    desc: "For developers who ship daily.",
    cta: "Start Pro",
    ctaStyle: "bg-violet-600 hover:bg-violet-500 text-white shadow-lg shadow-violet-900/40",
    highlight: true,
    badge: "Most Popular",
    features: [
      "Unlimited Blueprint searches",
      "Cross-file Integration Blueprints",
      "Web dashboard + VS Code Extension",
      "Fast-track AI (GPT-4o / Claude 3.5)",
      "Push to Repo / open PR",
      "Priority generation queue",
      "Source attribution links",
      "Team sharing (coming soon)",
    ],
  },
];

const FREE_FEATURES = [
  "5 searches / month",
  "5 core repos indexed",
  "Web dashboard only",
  "GPT-3.5",
];

export function Pricing() {
  return (
    <section id="pricing" className="py-28 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Pricing</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Simple, honest pricing
          </h2>
          <p className="mt-4 text-zinc-400 max-w-md mx-auto">
            Start free with our open-source Lite tier. Upgrade when you need more power.
          </p>
        </div>

        {/* Free tier banner */}
        <div className="mb-8 bg-zinc-900/60 border border-zinc-800 rounded-2xl px-6 py-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
          <div>
            <span className="text-sm font-semibold text-zinc-200">Free Lite tier — open source</span>
            <p className="text-xs text-zinc-500 mt-0.5">Try RepoFlow with no credit card required</p>
          </div>
          <div className="flex flex-wrap gap-3">
            {FREE_FEATURES.map((f) => (
              <span key={f} className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-800 px-2.5 py-1 rounded-full">
                <Check className="w-3 h-3 text-zinc-500" /> {f}
              </span>
            ))}
          </div>
          <Link href="/dashboard" className="shrink-0 text-sm text-violet-400 hover:text-violet-300 transition-colors font-medium">
            Get Lite free →
          </Link>
        </div>

        {/* Plan cards */}
        <div className="grid md:grid-cols-2 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 flex flex-col gap-6 border transition-all ${
                plan.highlight
                  ? "bg-violet-950/40 border-violet-700/60"
                  : "bg-zinc-900/60 border-zinc-800"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 text-xs font-semibold bg-violet-600 text-white px-4 py-1 rounded-full flex items-center gap-1">
                  <Zap className="w-3 h-3" /> {plan.badge}
                </span>
              )}

              <div>
                <h3 className="text-lg font-bold text-zinc-100">{plan.name}</h3>
                <p className="text-xs text-zinc-500 mt-1">{plan.desc}</p>
              </div>

              <div className="flex items-end gap-1">
                <span className="text-5xl font-black text-zinc-100">{plan.price}</span>
                <span className="text-zinc-500 text-sm mb-2">{plan.period}</span>
              </div>

              <ul className="flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-zinc-300">
                    <Check className={`w-4 h-4 shrink-0 mt-0.5 ${plan.highlight ? "text-violet-400" : "text-zinc-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                href="/dashboard"
                className={`mt-auto text-center px-6 py-3 rounded-xl font-semibold text-sm transition-all ${plan.ctaStyle}`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-zinc-600 mt-8">
          All plans include 14-day refund guarantee · No usage-based surprises · Cancel anytime
        </p>
      </div>
    </section>
  );
}
