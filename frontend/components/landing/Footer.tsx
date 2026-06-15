import Link from "next/link";
import { GitFork } from "lucide-react";

const LINKS = {
  Product: [
    { label: "How it works", href: "#how-it-works" },
    { label: "Features", href: "#features" },
    { label: "Pricing", href: "#pricing" },
    { label: "Dashboard", href: "/dashboard" },
    { label: "VS Code Extension", href: "#" },
  ],
  Developers: [
    { label: "GitHub (Lite)", href: "https://github.com" },
    { label: "API Docs", href: "/docs" },
    { label: "Changelog", href: "#" },
    { label: "Status", href: "#" },
  ],
  Company: [
    { label: "About", href: "#" },
    { label: "Blog", href: "#" },
    { label: "Privacy", href: "#" },
    { label: "Terms", href: "#" },
  ],
};

export function Footer() {
  return (
    <footer className="border-t border-zinc-800 bg-zinc-950 px-6 pt-16 pb-10">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-base mb-3">
              <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
                <GitFork className="w-4 h-4 text-white" />
              </div>
              RepoFlow <span className="text-violet-400">AI</span>
            </Link>
            <p className="text-xs text-zinc-600 leading-relaxed max-w-[200px]">
              Integration Blueprints from real, maintained GitHub repositories.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-xs">
                GitHub
              </a>
              <span className="text-zinc-800">·</span>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-xs">
                Twitter / X
              </a>
              <span className="text-zinc-800">·</span>
              <a href="https://discord.com" target="_blank" rel="noopener noreferrer"
                className="text-zinc-600 hover:text-zinc-300 transition-colors text-xs">
                Discord
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([group, links]) => (
            <div key={group}>
              <p className="text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-4">{group}</p>
              <ul className="flex flex-col gap-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-zinc-600 hover:text-zinc-300 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="border-t border-zinc-800/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-zinc-700">
            © {new Date().getFullYear()} RepoFlow AI. All rights reserved.
          </p>
          <p className="text-xs text-zinc-700">
            Built with Next.js, FastAPI, LangChain, and Pinecone.
          </p>
        </div>
      </div>
    </footer>
  );
}
