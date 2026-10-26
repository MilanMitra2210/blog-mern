'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getSocket } from '@/lib/socket';
import { Feather, ArrowUpRight } from 'lucide-react';

export default function Navbar() {
  const [activeReaders, setActiveReaders] = useState<number>(1);

  useEffect(() => {
    const socket = getSocket();
    socket.on('reader:count', (data: { activeReaders: number }) => {
      if (data?.activeReaders !== undefined) {
        setActiveReaders(data.activeReaders);
      }
    });

    return () => {
      socket.off('reader:count');
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-md border-b border-gray-800 px-4 sm:px-8 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-sky-500 via-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Feather className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-extrabold tracking-tight text-white">
                Quill<span className="text-sky-400">Forge</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20 uppercase tracking-widest">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden sm:block">Engineering & Tech Publication</p>
          </div>
        </Link>

        {/* Live Reader & Admin Button */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="hidden sm:inline">Active Online:</span>
            <span className="font-bold text-white tabular-nums">{activeReaders}</span>
          </div>

          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-white bg-linear-to-r from-sky-500 via-indigo-600 to-purple-600 hover:opacity-90 transition-all shadow-md shadow-sky-500/20"
          >
            <span>Admin Console</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
