'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import LikeButton from '@/components/LikeButton';
import CommentsSection from '@/components/CommentsSection';
import { Post, Section, SubSection, recordPostView } from '@/lib/api';
import { renderContentToHtml } from '@/lib/contentRenderer';
import { getSocket } from '@/lib/socket';
import { 
  Clock, 
  Eye, 
  Calendar, 
  ArrowLeft, 
  Share2, 
  Check, 
  MessageSquare, 
  Users,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Copy,
  Code2,
  Quote as QuoteIcon,
  Sparkles,
  ExternalLink,
  BookOpen
} from 'lucide-react';

interface BlogPostClientProps {
  post: Post;
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const postId = post.id || post._id;
  const [scrollProgress, setScrollProgress] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeOnPost, setActiveOnPost] = useState<number>(1);
  const [openFaqIndices, setOpenFaqIndices] = useState<Record<string, boolean>>({});
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  // Scroll depth tracking for top progress bar
  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (windowHeight > 0) {
        setScrollProgress((totalScroll / windowHeight) * 100);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Socket room join & active reader tracking
  useEffect(() => {
    if (!postId) return;
    const socket = getSocket();

    socket.emit('join:post', postId);

    const handleActive = (data: { postId: string; count: number }) => {
      if (data?.postId === postId) {
        setActiveOnPost(Math.max(1, data.count));
      }
    };

    socket.on('post:active_readers', handleActive);

    // Record view beacon once per browser session
    const sessionKey = `viewed_${postId}`;
    if (typeof window !== 'undefined' && !sessionStorage.getItem(sessionKey)) {
      sessionStorage.setItem(sessionKey, '1');
      recordPostView(postId);
    }

    return () => {
      socket.emit('leave:post', postId);
      socket.off('post:active_readers', handleActive);
    };
  }, [postId]);

  const toggleFaq = (key: string) => {
    setOpenFaqIndices((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleCopyCode = (code: string, idx: number) => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(code);
      setCopiedCodeIndex(idx);
      setTimeout(() => setCopiedCodeIndex(null), 2000);
    }
  };

  const categoryName = typeof post.category === 'object' && post.category !== null 
    ? (post.category as any).name 
    : 'Engineering';

  const authorName = typeof post.author === 'object' && post.author !== null 
    ? (post.author as any).name 
    : (typeof post.author === 'string' ? post.author : 'QuillForge Author');

  const authorAvatar = typeof post.author === 'object' && post.author !== null && (post.author as any).avatar
    ? (post.author as any).avatar
    : `https://api.dicebear.com/7.x/avataaars/svg?seed=${authorName}`;

  const authorBio = typeof post.author === 'object' && post.author !== null && (post.author as any).bio
    ? (post.author as any).bio
    : 'Lead systems architect and engineering contributor focusing on scalable architectures, real-time distributed systems, and performance.';

  const authorDesignation = typeof post.author === 'object' && post.author !== null && (post.author as any).designation
    ? (post.author as any).designation
    : 'Principal Architect';

  const formattedDate = post.publishDate || post.publishedAt || post.createdAt
    ? new Date(post.publishDate || post.publishedAt || post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  const coverImageUrl = post.bannerImage?.url || post.featuredImage || post.seo?.ogImage || null;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scrollToComments = () => {
    const el = document.getElementById('comments-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Helper to extract video ID from youtube / vimeo url
  const getEmbedIframeSrc = (url?: string, provider?: string) => {
    if (!url) return null;
    if (url.includes('youtube.com/watch?v=')) {
      const vid = url.split('v=')[1]?.split('&')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('youtu.be/')) {
      const vid = url.split('youtu.be/')[1]?.split('?')[0];
      return `https://www.youtube.com/embed/${vid}`;
    }
    if (url.includes('vimeo.com/')) {
      const vid = url.split('vimeo.com/')[1]?.split('?')[0];
      return `https://player.vimeo.com/video/${vid}`;
    }
    return url;
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-950 text-gray-100 selection:bg-sky-500/30 selection:text-sky-200">
      {/* Top Reading Progress Bar */}
      <div 
        className="fixed top-0 left-0 h-1 bg-linear-to-r from-sky-400 via-indigo-500 to-purple-500 z-50 transition-all duration-100" 
        style={{ width: `${scrollProgress}%` }} 
      />

      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 w-full flex-1 space-y-10">
        {/* Header Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-white transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 text-sky-400 group-hover:-translate-x-1 transition-transform" />
            <span>Back to Publications</span>
          </Link>

          {/* Real-time Socket Post Reader Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold shadow-inner">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
            <Users className="w-3.5 h-3.5" />
            <span><strong>{activeOnPost}</strong> reading now</span>
          </div>
        </div>

        {/* Article Header */}
        <header className="space-y-6">
          <div className="flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <span className="px-3 py-1 rounded-md bg-sky-500/10 text-sky-400 border border-sky-500/20 font-bold uppercase tracking-wider text-[11px]">
              {categoryName}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Calendar className="w-3.5 h-3.5 text-gray-400" />
              {formattedDate}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              {post.readTime || 4} min read
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <Eye className="w-3.5 h-3.5 text-gray-400" />
              {post.views ?? post.metrics?.views ?? 0} views
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg sm:text-xl text-gray-300 leading-relaxed border-l-4 border-sky-500 pl-4 py-1 font-normal bg-sky-950/10 rounded-r-xl">
              {post.excerpt}
            </p>
          )}

          {/* Author bar & interactions */}
          <div className="pt-6 pb-6 border-y border-gray-800 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src={authorAvatar}
                alt={authorName}
                className="w-12 h-12 rounded-full border-2 border-sky-500/30 bg-gray-800 object-cover shadow"
              />
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-white">{authorName}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    Verified
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">{authorDesignation}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LikeButton postId={postId} initialLikes={post.likes ?? post.metrics?.likes ?? 0} />

              <button
                type="button"
                onClick={scrollToComments}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Comments ({post.totalComments ?? post.commentsCount ?? 0})</span>
              </button>

              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gray-900 hover:bg-gray-800 text-gray-300 border border-gray-800 transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-sky-400" />}
                <span>{copied ? 'Copied Link!' : 'Share'}</span>
              </button>
            </div>
          </div>
        </header>

        {/* Featured Cover Image if present */}
        {coverImageUrl && (
          <div className="rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-900">
            <img 
              src={coverImageUrl} 
              alt={post.bannerImage?.altText || post.title} 
              className="w-full h-auto object-cover max-h-125" 
            />
            {post.bannerImage?.altText && (
              <p className="text-center text-xs text-gray-400 py-2 border-t border-gray-800 bg-gray-900/50">
                {post.bannerImage.altText}
              </p>
            )}
          </div>
        )}

        {/* Article Body */}
        <article className="space-y-8 text-gray-300 leading-relaxed text-base sm:text-lg">
          {/* Main compiled content if present */}
          {post.content && (
            <div
              dangerouslySetInnerHTML={{ __html: renderContentToHtml(post.content) }}
              className="space-y-4"
            />
          )}

          {/* Render Diverse Sections */}
          {post.sections && post.sections.length > 0 && (
            <div className="space-y-10 mt-10">
              {post.sections.map((section: Section, sIdx: number) => {
                const sectionType = section.sectionType || 'content';
                const sHtml = renderContentToHtml(section.content);

                // ==================== 1. FAQ SECTION ====================
                if (sectionType === 'faq') {
                  const faqItems = (section.subSections && section.subSections.length > 0)
                    ? section.subSections
                    : section.title ? [{ title: section.title, content: section.content }] : [];

                  return (
                    <div 
                      key={section.id || section._id || sIdx}
                      className="rounded-2xl bg-linear-to-b from-gray-900/80 to-gray-900/40 border border-teal-500/30 p-6 sm:p-8 space-y-6 shadow-xl"
                    >
                      <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
                        <div className="w-10 h-10 rounded-xl bg-teal-500/10 text-teal-400 flex items-center justify-center shrink-0 border border-teal-500/20">
                          <HelpCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-500/10 text-teal-400 border border-teal-500/20">
                              FAQ & Structured Schema
                            </span>
                          </div>
                          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight mt-0.5">
                            {section.title || 'Frequently Asked Questions'}
                          </h2>
                        </div>
                      </div>

                      {sHtml && (
                        <div 
                          dangerouslySetInnerHTML={{ __html: sHtml }} 
                          className="text-gray-300 text-sm sm:text-base leading-relaxed"
                        />
                      )}

                      {/* Interactive Expandable Accordions */}
                      <div className="space-y-3">
                        {faqItems.map((faq: SubSection | any, itemIdx: number) => {
                          const faqKey = `${sIdx}-${itemIdx}`;
                          const isOpen = openFaqIndices[faqKey] ?? true; // Default open for first glance
                          const answerHtml = renderContentToHtml(faq.content);

                          return (
                            <div 
                              key={itemIdx}
                              className="rounded-xl border border-gray-800 bg-gray-950/60 overflow-hidden transition-all duration-200 hover:border-gray-700"
                            >
                              <button
                                type="button"
                                onClick={() => toggleFaq(faqKey)}
                                className="w-full flex items-center justify-between p-4 sm:p-5 text-left font-bold text-white hover:text-teal-300 transition-colors cursor-pointer select-none gap-4"
                              >
                                <span className="text-base sm:text-lg flex items-center gap-3">
                                  <span className="text-teal-400 font-mono text-sm">Q{itemIdx + 1}.</span>
                                  {faq.title || 'Question'}
                                </span>
                                {isOpen ? (
                                  <ChevronUp className="w-5 h-5 text-teal-400 shrink-0" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-500 shrink-0" />
                                )}
                              </button>

                              {isOpen && (
                                <div className="px-4 pb-5 sm:px-5 sm:pb-5 text-gray-300 text-sm sm:text-base border-t border-gray-800/80 pt-4 leading-relaxed bg-gray-900/20">
                                  {answerHtml ? (
                                    <div dangerouslySetInnerHTML={{ __html: answerHtml }} />
                                  ) : (
                                    <p className="text-gray-500 italic">No answer provided.</p>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                }

                // ==================== 2. CODE SECTION ====================
                if (sectionType === 'code') {
                  const code = section.codeBlock || '';
                  const lang = section.codeLanguage || 'typescript';
                  const isCopied = copiedCodeIndex === sIdx;

                  return (
                    <div 
                      key={section.id || section._id || sIdx}
                      className="rounded-2xl bg-gray-950 border border-gray-800 overflow-hidden shadow-2xl"
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 bg-gray-900 border-b border-gray-800">
                        <div className="flex items-center gap-2">
                          <Code2 className="w-4 h-4 text-sky-400" />
                          <span className="text-xs font-mono font-bold uppercase text-sky-300">
                            {lang}
                          </span>
                          {section.title && (
                            <span className="text-xs text-gray-400 border-l border-gray-700 pl-2">
                              {section.title}
                            </span>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopyCode(code, sIdx)}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-gray-800 hover:bg-gray-700 text-gray-300 transition-colors cursor-pointer"
                        >
                          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                          <span>{isCopied ? 'Copied' : 'Copy'}</span>
                        </button>
                      </div>
                      <pre className="p-4 sm:p-6 overflow-x-auto text-sm sm:text-base font-mono text-sky-200 leading-relaxed bg-gray-950/90">
                        <code>{code}</code>
                      </pre>
                    </div>
                  );
                }

                // ==================== 3. QUOTE SECTION ====================
                if (sectionType === 'quote') {
                  const qText = typeof section.content === 'object' && section.content !== null ? section.content.text : sHtml;
                  const qAuthor = typeof section.content === 'object' && section.content !== null ? section.content.author : '';
                  const qDesig = typeof section.content === 'object' && section.content !== null ? section.content.designation : '';

                  return (
                    <div 
                      key={section.id || section._id || sIdx}
                      className="rounded-2xl bg-linear-to-r from-sky-950/40 via-indigo-950/20 to-purple-950/20 border-l-4 border-sky-400 border-y border-r p-6 sm:p-8 space-y-4"
                    >
                      <QuoteIcon className="w-8 h-8 text-sky-400/60" />
                      <div 
                        dangerouslySetInnerHTML={{ __html: typeof qText === 'string' && qText.includes('<') ? qText : `<p class="text-xl sm:text-2xl font-serif italic text-gray-100">&ldquo;${qText}&rdquo;</p>` }}
                      />
                      {(qAuthor || section.title) && (
                        <div className="pt-2">
                          <p className="text-sm font-bold text-sky-300">{qAuthor || section.title}</p>
                          {qDesig && <p className="text-xs text-gray-400">{qDesig}</p>}
                        </div>
                      )}
                    </div>
                  );
                }

                // ==================== 4. EMBED SECTION ====================
                if (sectionType === 'embed') {
                  const embedSrc = getEmbedIframeSrc(section.embedUrl, section.embedProvider);

                  return (
                    <div 
                      key={section.id || section._id || sIdx}
                      className="rounded-2xl bg-gray-900 border border-gray-800 overflow-hidden shadow-2xl p-4 sm:p-6 space-y-4"
                    >
                      {section.title && (
                        <h3 className="text-lg font-bold text-white">{section.title}</h3>
                      )}
                      {embedSrc ? (
                        <div className="relative aspect-video rounded-xl overflow-hidden border border-gray-800 bg-black">
                          <iframe
                            src={embedSrc}
                            title={section.title || 'Video Embed'}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full"
                          />
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic">No media stream URL provided for embed.</p>
                      )}
                    </div>
                  );
                }

                // ==================== 5. CTA SECTION ====================
                if (sectionType === 'cta') {
                  return (
                    <div 
                      key={section.id || section._id || sIdx}
                      className="rounded-2xl bg-linear-to-r from-sky-900/40 via-indigo-900/30 to-purple-900/40 border border-sky-500/30 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl"
                    >
                      <div className="space-y-2 text-center sm:text-left">
                        <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-400 border border-sky-500/20">
                          Recommended Action
                        </span>
                        <h3 className="text-xl sm:text-2xl font-bold text-white">{section.title || 'Take Next Step'}</h3>
                        {sHtml && <div dangerouslySetInnerHTML={{ __html: sHtml }} className="text-sm text-gray-300" />}
                      </div>

                      {section.ctaButtonText && (
                        <a
                          href={section.ctaButtonUrl || '#'}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-6 py-3 rounded-xl bg-linear-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 transition-all flex items-center gap-2 shrink-0 cursor-pointer"
                        >
                          <span>{section.ctaButtonText}</span>
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  );
                }

                // ==================== 6. SUMMARY / KEY TAKEAWAYS ====================
                if (sectionType === 'summary') {
                  return (
                    <div 
                      key={section.id || section._id || sIdx}
                      className="rounded-2xl bg-amber-500/5 border border-amber-500/20 p-6 sm:p-8 space-y-4"
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-amber-400 shrink-0" />
                        <h3 className="text-xl font-bold text-amber-200">
                          {section.title || 'Key Takeaways & Summary'}
                        </h3>
                      </div>
                      {sHtml && (
                        <div 
                          dangerouslySetInnerHTML={{ __html: sHtml }} 
                          className="text-gray-300 text-sm sm:text-base leading-relaxed"
                        />
                      )}
                    </div>
                  );
                }

                // ==================== 7. STANDARD CONTENT SECTION ====================
                return (
                  <div 
                    key={section.id || section._id || sIdx} 
                    className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-6 sm:p-8 space-y-6"
                  >
                    {section.title && (
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-400 font-bold flex items-center justify-center text-sm border border-sky-500/20">
                          {sIdx + 1}
                        </span>
                        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                          {section.title}
                        </h2>
                      </div>
                    )}

                    {/* Section Media image if present */}
                    {section.media?.url && (
                      <div className="rounded-xl overflow-hidden border border-gray-800 shadow-md">
                        <img 
                          src={section.media.url} 
                          alt={section.media.altText || section.title || 'Section Illustration'} 
                          className="w-full h-auto max-h-96 object-cover"
                        />
                        {section.media.altText && (
                          <p className="text-xs text-gray-500 py-1.5 px-3 bg-gray-900/80 border-t border-gray-800 text-center">
                            {section.media.altText}
                          </p>
                        )}
                      </div>
                    )}

                    {sHtml && (
                      <div 
                        dangerouslySetInnerHTML={{ __html: sHtml }} 
                        className="space-y-4 text-gray-300 leading-relaxed"
                      />
                    )}

                    {/* Render Subsections */}
                    {section.subSections && section.subSections.length > 0 && (
                      <div className="pl-4 sm:pl-6 border-l-2 border-sky-500/40 space-y-6 mt-6">
                        {section.subSections.map((sub: SubSection, subIdx: number) => {
                          const subHtml = renderContentToHtml(sub.content);
                          return (
                            <div key={sub.id || sub._id || subIdx} className="space-y-3">
                              {sub.title && (
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                  <BookOpen className="w-4 h-4 text-sky-400" />
                                  <span>{sub.title}</span>
                                </h3>
                              )}
                              {sub.media?.url && (
                                <img 
                                  src={sub.media.url} 
                                  alt={sub.media.altText || sub.title || ''} 
                                  className="rounded-lg max-h-72 object-cover border border-gray-800" 
                                />
                              )}
                              {subHtml && (
                                <div 
                                  dangerouslySetInnerHTML={{ __html: subHtml }} 
                                  className="text-gray-300 text-sm sm:text-base leading-relaxed"
                                />
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </article>

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="pt-6 border-t border-gray-800 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-gray-400 mr-2 uppercase tracking-wider">Topics:</span>
            {post.tags.map((t, idx) => {
              const tagName = typeof t === 'object' && t !== null ? (t as any).name : String(t);
              return (
                <span
                  key={idx}
                  className="px-3 py-1 rounded-lg bg-gray-900 text-sky-300 border border-gray-800 text-xs font-semibold"
                >
                  #{tagName}
                </span>
              );
            })}
          </div>
        )}

        {/* Author Bio Box */}
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-6 sm:p-8 flex items-start gap-4">
          <img
            src={authorAvatar}
            alt={authorName}
            className="w-14 h-14 rounded-full border border-sky-500/30 bg-gray-800 object-cover shrink-0"
          />
          <div className="space-y-1">
            <h4 className="text-base font-bold text-white">Written by {authorName}</h4>
            <p className="text-xs text-sky-400 font-medium">{authorDesignation}</p>
            <p className="text-xs sm:text-sm text-gray-400 leading-relaxed pt-1">{authorBio}</p>
          </div>
        </div>

        {/* Comments Section */}
        <div id="comments-section">
          <CommentsSection postId={postId} />
        </div>
      </main>

      <Footer />
    </div>
  );
}
