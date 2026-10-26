import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Compass, ArrowLeft, ArrowUpRight, Search, FileQuestion, Sparkles } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-sky-500/30 selection:text-sky-200">
      <Navbar />

      <main className="relative flex-1 flex items-center justify-center px-4 sm:px-6 py-20 overflow-hidden">
        {/* Ambient background glows */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-140 h-140 bg-linear-to-tr from-sky-500/15 via-indigo-600/15 to-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl w-full text-center space-y-8 glass-card rounded-3xl p-8 sm:p-14 border border-white/10 shadow-2xl">
          {/* Status Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold tracking-wider uppercase">
            <FileQuestion className="w-4 h-4" />
            <span>404 • Resource Not Found</span>
          </div>

          {/* Glowing 404 Display */}
          <div className="relative">
            <h1 className="text-8xl sm:text-9xl font-black tracking-tighter text-transparent bg-clip-text bg-linear-to-b from-white via-slate-300 to-slate-700 select-none">
              404
            </h1>
            <div className="absolute -inset-4 bg-sky-500/10 rounded-full blur-2xl -z-10" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Lost in the Engineering Void
            </h2>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-md mx-auto">
              The publication, slug, or destination you are searching for does not exist or has been relocated by editorial moderators.
            </p>
          </div>

          {/* Quick Search */}
          <form action="/" method="GET" className="max-w-md mx-auto flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                name="q"
                placeholder="Search publications..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#06080f]/70 border border-white/10 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-sky-500 transition-all shadow-inner"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs sm:text-sm font-semibold transition-all border border-white/10"
            >
              Search
            </button>
          </form>

          {/* Navigation Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-white bg-linear-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-90 transition-all shadow-lg shadow-sky-500/25"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home Feed</span>
            </Link>

            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-xs sm:text-sm font-bold text-slate-300 hover:text-white bg-white/5 hover:bg-white/10 transition-all border border-white/10"
            >
              <span>Admin Console</span>
              <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
