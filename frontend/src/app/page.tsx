'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PostCard from '@/components/PostCard';
import { Post, Category, fetchPosts, fetchCategories } from '@/lib/api';
import { Search, Sparkles, Newspaper, Eye, TrendingUp } from 'lucide-react';

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      setLoading(true);
      const [postsData, cats] = await Promise.all([
        fetchPosts(),
        fetchCategories(),
      ]);
      setPosts(postsData.items || []);
      setCategories(cats);
      setLoading(false);
    }
    init();
  }, []);

  const handleFilter = async (categorySlug: string) => {
    setSelectedCategory(categorySlug);
    setLoading(true);
    const data = await fetchPosts({
      category: categorySlug === 'all' ? undefined : categorySlug,
      search: searchQuery || undefined,
    });
    setPosts(data.items || []);
    setLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const data = await fetchPosts({
      category: selectedCategory === 'all' ? undefined : selectedCategory,
      search: searchQuery || undefined,
    });
    setPosts(data.items || []);
    setLoading(false);
  };

  const featuredPost = posts.length > 0 ? posts[0] : null;
  const standardPosts = posts.length > 1 ? posts.slice(1) : [];
  const totalViews = posts.reduce((sum, p) => sum + (p.views || p.metrics?.views || 0), 0);

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gray-950 text-gray-100">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-8 w-full flex-1 pb-16">
        {/* Hero Section */}
        <section className="text-center py-16 sm:py-24 space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MERN Stack • TypeScript • Live Analytics</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-tight">
            Architectural Insights for <span className="text-transparent bg-clip-text bg-linear-to-r from-sky-400 via-indigo-400 to-purple-400">Modern Engineers</span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Deep-dives into scalable distributed architectures, real-time Socket.io pipelines, and modern web application patterns.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearch} className="max-w-xl mx-auto flex items-center bg-gray-900/90 border border-gray-800 rounded-2xl p-1.5 shadow-xl focus-within:border-sky-500 transition-colors">
            <Search className="w-5 h-5 text-gray-400 ml-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by keyword or topic..."
              className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-gray-500 outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold transition-colors shadow-md shadow-sky-600/30 cursor-pointer"
            >
              Search
            </button>
          </form>

          {/* Category Filter Pills */}
          <div id="categories" className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => handleFilter('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:bg-gray-800'
              }`}
            >
              All Topics
            </button>
            {categories.map((cat) => (
              <button
                key={cat._id}
                onClick={() => handleFilter(cat.slug || cat._id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                  selectedCategory === (cat.slug || cat._id)
                    ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                    : 'bg-gray-900 text-gray-400 hover:text-white border border-gray-800 hover:bg-gray-800'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </section>

        {/* Platform Stats Row */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white tabular-nums">{posts.length}</div>
              <div className="text-xs text-gray-400 font-medium">Published Articles</div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white tabular-nums">{totalViews}</div>
              <div className="text-xs text-gray-400 font-medium">Total Read Impressions</div>
            </div>
          </div>

          <div className="bg-gray-900/60 border border-gray-800/80 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-white">Live Sync</div>
              <div className="text-xs text-gray-400 font-medium">Socket.io Active Tracking</div>
            </div>
          </div>
        </section>

        {/* Content Section */}
        {loading ? (
          <div className="text-center py-20 text-gray-400 text-sm space-y-3">
            <div className="w-8 h-8 border-2 border-sky-500/20 border-t-sky-500 rounded-full animate-spin mx-auto" />
            <p>Loading latest publications...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="bg-gray-900/50 border border-gray-800 rounded-3xl text-center py-20 px-4 space-y-4 max-w-xl mx-auto">
            <Newspaper className="w-12 h-12 text-gray-600 mx-auto" />
            <h3 className="text-xl font-bold text-white">No publications found</h3>
            <p className="text-sm text-gray-400 max-w-md mx-auto">
              Publish your first blog post from the Admin Console to test live socket updates and analytics.
            </p>
            <a
              href="http://localhost:5174"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-lg shadow-sky-600/30"
            >
              Open Admin Console
            </a>
          </div>
        ) : (
          <div className="space-y-14">
            {/* Featured Post Card */}
            {featuredPost && (
              <section id="featured">
                <PostCard post={featuredPost} featured={true} />
              </section>
            )}

            {/* Latest Publications Grid */}
            {standardPosts.length > 0 && (
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl sm:text-2xl font-bold text-white">Latest Publications</h3>
                  <span className="text-xs text-gray-400 font-medium">{standardPosts.length} more stories</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {standardPosts.map((post) => (
                    <PostCard key={post._id} post={post} />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
