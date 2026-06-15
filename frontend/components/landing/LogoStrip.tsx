const STACKS = [
  { label: "React", color: "text-cyan-400" },
  { label: "Next.js", color: "text-zinc-200" },
  { label: "FastAPI", color: "text-emerald-400" },
  { label: "Django", color: "text-green-500" },
  { label: "Tailwind CSS", color: "text-sky-400" },
  { label: "shadcn/ui", color: "text-violet-400" },
  { label: "Supabase", color: "text-emerald-500" },
  { label: "Prisma", color: "text-indigo-400" },
  { label: "tRPC", color: "text-blue-400" },
  { label: "Node.js", color: "text-green-400" },
  { label: "Express", color: "text-yellow-400" },
  { label: "Vue", color: "text-lime-400" },
];

export function LogoStrip() {
  return (
    <section className="py-12 border-y border-zinc-800/50 bg-zinc-900/20 overflow-hidden">
      <p className="text-center text-xs text-zinc-600 uppercase tracking-widest mb-8">
        Works with every stack you already use
      </p>
      {/* Scrolling row */}
      <div className="flex gap-0 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
        <div className="flex gap-12 animate-scroll whitespace-nowrap">
          {[...STACKS, ...STACKS].map((s, i) => (
            <span
              key={i}
              className={`text-sm font-semibold tracking-tight ${s.color} opacity-70 hover:opacity-100 transition-opacity`}
            >
              {s.label}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
