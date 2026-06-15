import { Star } from "lucide-react";

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Senior Frontend Engineer @ Vercel",
    avatar: "SC",
    color: "bg-violet-700",
    quote:
      "I used to spend 2-3 hours hunting for the right pattern every time I had to wire a new frontend to an API. RepoFlow cut that to minutes. The source links are the key — I actually trust the output.",
    stars: 5,
  },
  {
    name: "Marcus Oliveira",
    role: "Fullstack Developer @ Startup",
    avatar: "MO",
    color: "bg-emerald-700",
    quote:
      "As a solo founder, context-switching to debug integration issues was killing my momentum. This tool just hands me the exact code I need. The FastAPI + Next.js blueprints are incredibly accurate.",
    stars: 5,
  },
  {
    name: "Priya Sharma",
    role: "Tech Lead @ Scale",
    avatar: "PS",
    color: "bg-sky-700",
    quote:
      "We onboarded three junior devs last month. RepoFlow became their first stop for any integration question. The integration steps are clear enough that they rarely need to ask for help anymore.",
    stars: 5,
  },
  {
    name: "Tom Wicker",
    role: "Indie Hacker",
    avatar: "TW",
    color: "bg-orange-700",
    quote:
      "Shipped a SaaS in 4 weeks because I stopped losing time to 'how do I connect X to Y' problems. The blueprint for auth with Supabase + Next.js alone saved me days.",
    stars: 5,
  },
  {
    name: "Aiko Tanaka",
    role: "Backend Engineer → Fullstack",
    avatar: "AT",
    color: "bg-fuchsia-700",
    quote:
      "I'm primarily a backend dev who has to write React sometimes. RepoFlow bridges the gap — it shows me exactly how the frontend hooks into my FastAPI endpoints without me guessing at prop shapes.",
    stars: 5,
  },
  {
    name: "Dev Rodriguez",
    role: "Engineering Manager",
    avatar: "DR",
    color: "bg-indigo-700",
    quote:
      "The 'push to PR' feature in Pro pays for itself in one sprint. My team stopped writing the same boilerplate CRUD integrations by hand. We just review and merge.",
    stars: 5,
  },
];

export function Testimonials() {
  return (
    <section className="py-28 px-6 bg-zinc-900/20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span className="text-xs font-semibold text-violet-400 uppercase tracking-widest">Testimonials</span>
          <h2 className="mt-3 text-4xl md:text-5xl font-bold tracking-tight">
            Developers trust source-backed AI
          </h2>
        </div>

        {/* Masonry grid */}
        <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
          {TESTIMONIALS.map((t) => (
            <div
              key={t.name}
              className="break-inside-avoid bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:-translate-y-0.5"
            >
              {/* Stars */}
              <div className="flex gap-0.5">
                {Array.from({ length: t.stars }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              {/* Quote */}
              <p className="text-sm text-zinc-300 leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
              {/* Author */}
              <div className="flex items-center gap-3 mt-2">
                <div className={`w-9 h-9 rounded-full ${t.color} flex items-center justify-center text-xs font-bold text-white shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <p className="text-sm font-semibold text-zinc-100">{t.name}</p>
                  <p className="text-xs text-zinc-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
