import React from 'react';
import Link from 'next/link';
import { Post } from '@/lib/api';
import { Clock, Eye, Heart, MessageSquare, ArrowUpRight, Sparkles } from 'lucide-react';

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const categoryName = typeof post.category === 'object' && post.category !== null 
    ? (post.category as any).name 
    : 'Engineering';

  const authorName = typeof post.author === 'object' && post.author !== null 
    ? (post.author as any).name 
    : 'Editorial Team';

  const authorAvatar = typeof post.author === 'object' && post.author !== null && (post.author as any).avatar
    ? (post.author as any).avatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

  const formattedDate = post.publishedAt || post.createdAt
    ? new Date(post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const viewsCount = post.views ?? post.metrics?.views ?? 0;
  const likesCount = post.likes ?? post.metrics?.likes ?? 0;
  const commentsCount = post.totalComments ?? post.commentsCount ?? 0;

  if (featured) {
    return (
      <div className="bg-linear-to-br from-gray-900/90 via-gray-900/60 to-sky-950/30 border border-sky-500/30 rounded-3xl p-6 sm:p-10 space-y-5 hover:border-sky-500/50 transition-all shadow-2xl">
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Featured Publication
          </span>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-gray-800 text-gray-300 border border-gray-700">
            {categoryName}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            {post.readTime || 4} min read
          </span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-sky-400 transition-colors">
            {post.title}
          </Link>
        </h2>

        <p className="text-gray-300 text-sm sm:text-base line-clamp-3 leading-relaxed max-w-3xl">
          {post.excerpt || 'Explore this in-depth guide on cutting-edge engineering patterns, architectural best practices, and production scalability.'}
        </p>

        <div className="pt-6 border-t border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-10 h-10 rounded-full border border-gray-700 bg-gray-800 object-cover"
            />
            <div>
              <p className="text-sm font-bold text-white">{authorName}</p>
              <p className="text-xs text-gray-400 font-medium">{formattedDate}</p>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
              <span className="flex items-center gap-1.5 text-sky-400">
                <Eye className="w-4 h-4" />
                <strong className="text-white">{viewsCount}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-rose-400">
                <Heart className="w-4 h-4" />
                <strong className="text-white">{likesCount}</strong>
              </span>
              <span className="flex items-center gap-1.5 text-emerald-400">
                <MessageSquare className="w-4 h-4" />
                <strong className="text-white">{commentsCount}</strong>
              </span>
            </div>

            <Link
              href={`/blog/${post.slug}`}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all shadow-md shadow-sky-600/30"
            >
              <span>Read Article</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-6 flex flex-col justify-between hover:border-sky-500/40 hover:-translate-y-1 transition-all">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20">
            {categoryName}
          </span>
          <span className="text-xs text-gray-400 flex items-center gap-1 font-medium">
            <Clock className="w-3.5 h-3.5 text-gray-500" />
            {post.readTime || 3} min
          </span>
        </div>

        <h3 className="text-lg font-bold text-white leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:text-sky-400 transition-colors line-clamp-2">
            {post.title}
          </Link>
        </h3>

        <p className="text-xs sm:text-sm text-gray-400 line-clamp-3 leading-relaxed">
          {post.excerpt || 'Read the full story to discover architectural principles, implementation details, and real-world techniques.'}
        </p>
      </div>

      <div className="pt-5 mt-5 border-t border-gray-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src={authorAvatar}
              alt={authorName}
              className="w-6 h-6 rounded-full border border-gray-700 bg-gray-800 object-cover"
            />
            <span className="text-xs font-semibold text-gray-300">{authorName}</span>
          </div>
          <span className="text-[11px] text-gray-500">{formattedDate}</span>
        </div>

        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-3 text-xs font-semibold text-gray-400">
            <span className="flex items-center gap-1 text-sky-400">
              <Eye className="w-3.5 h-3.5" />
              <span>{viewsCount}</span>
            </span>
            <span className="flex items-center gap-1 text-rose-400">
              <Heart className="w-3.5 h-3.5" />
              <span>{likesCount}</span>
            </span>
            <span className="flex items-center gap-1 text-emerald-400">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{commentsCount}</span>
            </span>
          </div>

          <Link
            href={`/blog/${post.slug}`}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 transition-colors"
          >
            <span>Read</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
