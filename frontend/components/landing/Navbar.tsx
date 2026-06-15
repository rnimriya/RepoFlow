"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GitFork, Menu, X } from "lucide-react";
import { useAuth } from "@/lib/auth/AuthProvider";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  async function handleSignOut() {
    await signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-zinc-950/90 backdrop-blur-md border-b border-zinc-800/60"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <div className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center">
            <GitFork className="w-4 h-4 text-white" />
          </div>
          RepoFlow <span className="text-violet-400">AI</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="#how-it-works" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">How it works</Link>
          <Link href="#features" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Features</Link>
          <Link href="#pricing" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">Pricing</Link>
          <Link href="https://github.com" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">GitHub</Link>
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <>
              <Link href="/dashboard" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
                Sign in
              </Link>
              <Link
                href="/signup"
                className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
              >
                Start free
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-zinc-400 hover:text-zinc-100"
          aria-label="Toggle menu"
        >
          {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-zinc-900/95 backdrop-blur-md border-b border-zinc-800 px-6 py-4 flex flex-col gap-4">
          <Link href="#how-it-works" onClick={() => setOpen(false)} className="text-sm text-zinc-300">How it works</Link>
          <Link href="#features" onClick={() => setOpen(false)} className="text-sm text-zinc-300">Features</Link>
          <Link href="#pricing" onClick={() => setOpen(false)} className="text-sm text-zinc-300">Pricing</Link>
          {user ? (
            <>
              <Link href="/dashboard" onClick={() => setOpen(false)} className="text-sm text-zinc-300">Dashboard</Link>
              <button onClick={() => { setOpen(false); handleSignOut(); }} className="text-sm text-zinc-300 text-left">Sign out</button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setOpen(false)} className="text-sm text-zinc-300">Sign in</Link>
              <Link href="/signup" onClick={() => setOpen(false)} className="text-sm bg-violet-600 px-4 py-2 rounded-lg font-medium text-center">
                Start free
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
