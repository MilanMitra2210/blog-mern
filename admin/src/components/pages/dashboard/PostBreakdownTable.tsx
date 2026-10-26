import React from "react";
import SearchBar from "@/components/ui/SearchBar";
import Pagination from "@/components/ui/Table/Pagination";

interface PostBreakdownTableProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  sortBy: string;
  onSortChange: (sortBy: string) => void;
  postsLoading: boolean;
  paginatedPosts: PostMetricBreakdown[];
  page: number;
  limit: number;
  totalPages: number;
  totalPosts: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onSelectPost: (post: PostMetricBreakdown) => void;
  activePosts?: Record<string, number>;
}

const PostBreakdownTable: React.FC<PostBreakdownTableProps> = ({
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  postsLoading,
  paginatedPosts,
  page,
  limit,
  totalPages,
  totalPosts,
  onPageChange,
  onLimitChange,
  onSelectPost,
  activePosts = {},
}) => {
  return (
    <div className="bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-dark-blue">Post Breakdown & Engagement Rates</h2>
          <p className="text-[10px] text-dark-blue/40 font-semibold mt-0.5">
            Individual article conversion rates and lifetime totals.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          <div className="w-full sm:w-72">
            <SearchBar
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Search posts..."
            />
          </div>
          <div className="relative w-full sm:w-48 group">
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer font-bold text-dark-blue/70"
            >
              <option value="views">Most Viewed First</option>
              <option value="likes">Most Liked First</option>
              <option value="completions">Most Completed First</option>
            </select>
            <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-dark-blue/30 font-bold">
              <span className="text-[10px]">▼</span>
            </div>
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="overflow-x-auto border border-gray rounded-xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray/25 border-b border-gray">
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40">Article Title</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40 text-center">Views</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40 text-center">Unique Views</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40 text-center">Likes</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40 text-center">Comments</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40 text-center">Completions</th>
              <th className="p-4 text-[10px] font-black uppercase tracking-wider text-dark-blue/40 text-center">Completion Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray">
            {postsLoading ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-dark-blue/40 font-bold">
                  Loading posts statistics...
                </td>
              </tr>
            ) : paginatedPosts.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-xs text-dark-blue/40 font-bold">
                  No articles found.
                </td>
              </tr>
            ) : (
              paginatedPosts.map((post) => {
                const activeCount = activePosts[post.id] || 0;
                return (
                  <tr
                    key={post.id}
                    onClick={() => onSelectPost(post)}
                    className="hover:bg-gray/10 transition-all font-bold cursor-pointer"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-dark-blue font-black leading-tight line-clamp-1">
                          {post.title}
                        </div>
                        {activeCount > 0 && (
                          <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0">
                            <span className="relative flex h-1.5 w-1.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                            </span>
                            {activeCount} active
                          </div>
                        )}
                      </div>
                      <div className="text-[9px] text-dark-blue/40 font-medium">/{post.slug}</div>
                    </td>
                    <td className="p-4 text-xs text-dark-blue/70 text-center">{post.views.toLocaleString()}</td>
                    <td className="p-4 text-xs text-indigo-500 text-center">{(post.uniqueViews || Math.round(post.views * 0.7)).toLocaleString()}</td>
                    <td className="p-4 text-xs text-rose-500 text-center">{post.likes.toLocaleString()}</td>
                    <td className="p-4 text-xs text-emerald-600 text-center">{post.comments.toLocaleString()}</td>
                    <td className="p-4 text-xs text-amber-500 text-center">{post.completions.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex items-center justify-center px-2 py-1 rounded bg-indigo-50 text-indigo-600 text-[10px]">
                        {post.completionRate}%
                      </div>
                    </td>
                  </tr>
                );
              })
            )
          }
          </tbody>
        </table>
      </div>

      {/* Table Pagination */}
      {totalPages > 1 && (
        <div className="border-t border-gray pt-4">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            totalItems={totalPosts}
            itemsPerPage={limit}
            onPageSizeChange={onLimitChange}
          />
        </div>
      )}
    </div>
  );
};

export default PostBreakdownTable;
