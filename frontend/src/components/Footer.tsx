import React from 'react';
import Link from 'next/link';
import { Feather } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-gray-800 bg-gray-950/80 py-10 px-4 sm:px-8 mt-20">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <Feather className="w-4 h-4" />
          </div>
          <span className="font-bold text-gray-200 text-sm">
            Quill<span className="text-sky-400">Forge</span> Engineering Publication
          </span>
        </div>

        <p className="text-xs text-gray-500 text-center md:text-left">
          Powered by MERN Stack • Real-time Socket.io Sync • RESTful API v1
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-400">
          <a
            href="http://localhost:5174"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400 transition-colors"
          >
            Admin Panel
          </a>
          <span>•</span>
          <a
            href="/api/blogs"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-sky-400 transition-colors"
          >
            Public API Route
          </a>
        </div>
      </div>
    </footer>
  );
}
