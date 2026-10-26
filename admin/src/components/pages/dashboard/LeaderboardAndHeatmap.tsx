import React from "react";

interface LeaderboardAndHeatmapProps {
  topPosts: PostMetricBreakdown[] | undefined;
  paginatedPosts: PostMetricBreakdown[];
  onSelectPost: (post: PostMetricBreakdown) => void;
}

const LeaderboardAndHeatmap: React.FC<LeaderboardAndHeatmapProps> = ({
  topPosts,
  paginatedPosts,
  onSelectPost,
}) => {
  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
      {/* Performance Leaderboard */}
      <div className="xl:col-span-2 bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-base font-black text-dark-blue">Platform Performance Leaderboard</h2>
          <p className="text-xs text-dark-blue/60 font-semibold mt-0.5">
            Ranked list of top-performing articles based on engagement ratios.
          </p>
        </div>

        <div className="overflow-x-auto border border-gray rounded-xl">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray/40 border-b border-gray">
                <th className="p-3 text.xs font-black uppercase tracking-wider text-dark-blue/60 text-center">Rank</th>
                <th className="p-3 text-xs font-black uppercase tracking-wider text-dark-blue/60">Article</th>
                <th className="p-3 text-xs font-black uppercase tracking-wider text-dark-blue/60 text-center">Unique Views</th>
                <th className="p-3 text-xs font-black uppercase tracking-wider text-dark-blue/60 text-center">Engagement Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray">
              {topPosts && topPosts.length > 0 ? (
                topPosts.slice(0, 10).map((post: any, index) => {
                  const views = post.views ?? post.metrics?.views ?? 0;
                  const likes = post.likes ?? post.metrics?.likes ?? 0;
                  const comments = post.comments ?? post.totalComments ?? 0;
                  const uniqueViews = post.uniqueViews ?? post.metrics?.uniqueViews ?? Math.round(views * 0.7);
                  const engRate = views > 0 ? Math.round(((likes + comments) / views) * 1000) / 10 : 0;
                  return (
                    <tr key={post.id} className="hover:bg-gray/20 font-bold text-xs text-dark-blue">
                      <td className="p-3.5 text-center text-dark-blue/50 font-black">#{index + 1}</td>
                      <td className="p-3.5 font-black text-dark-blue">{post.title}</td>
                      <td className="p-3.5 text-center">{uniqueViews.toLocaleString()}</td>
                      <td className="p-3.5 text-center">
                        <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-black ${
                          engRate > 15 ? "bg-emerald-500/20 text-emerald-600 border border-emerald-500/30" :
                          engRate > 5 ? "bg-indigo-500/20 text-indigo-600 border border-indigo-500/30" : "bg-gray/60 text-dark-blue/60 border border-gray"
                        }`}>
                          {engRate}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={4} className="p-6 text-center text-xs text-dark-blue/50 font-bold">No records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Content Engagement Heatmap */}
      <div className="xl:col-span-2 bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-base font-black text-dark-blue">Engagement Heatmap</h2>
            <span className="text-xs font-black uppercase tracking-wider text-primary bg-primary/10 px-2.5 py-1 rounded-full border border-primary/25 shrink-0">
              Interactive Grid
            </span>
          </div>
          <p className="text-xs text-dark-blue/60 font-semibold mt-1">
            Visual distribution of articles by engagement intensity & reader response.
          </p>
        </div>

        {/* Heatmap Legend */}
        <div className="flex items-center justify-between bg-gray/30 p-3 rounded-xl border border-gray text-xs font-bold text-dark-blue">
          <span className="text-dark-blue/60 uppercase font-black tracking-wider text-[10px]">Intensity:</span>
          <div className="flex items-center gap-2">
            <span className="text-dark-blue/60 text-xs">Low</span>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-md bg-blue-100/90 border border-blue-300 shadow-xs" title="<5% Engagement" />
              <span className="w-4 h-4 rounded-md bg-indigo-300 border border-indigo-400 shadow-xs" title="5%-12% Engagement" />
              <span className="w-4 h-4 rounded-md bg-indigo-600 border border-indigo-700 shadow-xs" title="12%-20% Engagement" />
              <span className="w-4 h-4 rounded-md bg-emerald-600 border border-emerald-700 shadow-xs" title=">20% Engagement" />
            </div>
            <span className="text-emerald-600 font-black text-xs">High (&gt;20%)</span>
          </div>
        </div>

        {/* Heatmap Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {paginatedPosts && paginatedPosts.length > 0 ? (
            paginatedPosts.map((post: any) => {
              const views = post.views ?? post.metrics?.views ?? 0;
              const likes = post.likes ?? post.metrics?.likes ?? 0;
              const comments = post.comments ?? post.totalComments ?? 0;
              const completions = post.completions ?? post.metrics?.readProgressCount ?? post.metrics?.completions ?? 0;
              const completionRate = post.completionRate ?? (views > 0 ? Math.round((completions / views) * 1000) / 10 : 0);
              const uniqueViews = post.uniqueViews ?? post.metrics?.uniqueViews ?? Math.round(views * 0.7);

              const totalEng = likes + comments;
              const engRatio = views > 0 ? (totalEng / views) * 100 : 0;
              const displayRate = completionRate > 0 ? completionRate : engRatio;

              // Premium border glow and badge design system
              let cardTheme = "border-slate-200/60 dark:border-slate-800/80 hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-slate-500/5";
              let rateTextColor = "text-slate-500 dark:text-slate-400";
              
              if (displayRate > 20) {
                cardTheme = "border-slate-200/60 dark:border-slate-800/80 hover:border-emerald-500/50 dark:hover:border-emerald-500/40 hover:shadow-emerald-500/10 hover:shadow-lg";
                rateTextColor = "text-emerald-600 dark:text-emerald-400";
              } else if (displayRate > 12) {
                cardTheme = "border-slate-200/60 dark:border-slate-800/80 hover:border-indigo-500/50 dark:hover:border-indigo-500/40 hover:shadow-indigo-500/10 hover:shadow-lg";
                rateTextColor = "text-indigo-600 dark:text-indigo-400";
              } else if (displayRate > 5) {
                cardTheme = "border-slate-200/60 dark:border-slate-800/80 hover:border-blue-500/50 dark:hover:border-blue-500/40 hover:shadow-blue-500/10 hover:shadow-lg";
                rateTextColor = "text-blue-600 dark:text-blue-400";
              }

              return (
                <div
                  key={post.id}
                  onClick={() => onSelectPost(post)}
                  className={`p-4 rounded-2xl h-32 flex flex-col justify-between relative group cursor-pointer border bg-gray/10 hover:bg-gray/20 dark:bg-white/5 dark:hover:bg-white/10 text-slate-800 dark:text-slate-100 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 shadow-xs hover:shadow-md ${cardTheme}`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 text-[9px] font-black uppercase tracking-wider">
                      <span className="text-slate-400 dark:text-slate-500">
                        {post.entityType === "cms_page" ? "Page" : "Blog"}
                      </span>
                      <span className={rateTextColor} title="Completion / Engagement Rate">
                        {displayRate.toFixed(1)}% rate
                      </span>
                    </div>
                    <h4 className="text-xs sm:text-sm font-black leading-snug line-clamp-2 mt-2 text-slate-800 dark:text-slate-100 group-hover:text-primary transition-colors">
                      {post.title}
                    </h4>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 text-[9px] font-extrabold mt-5 text-slate-400 dark:text-slate-500 border-t border-slate-100 dark:border-slate-800/80 pt-2">
                    <span>{views.toLocaleString()} views</span>
                    <span>•</span>
                    <span>{likes} likes</span>
                  </div>

                  {/* Hover Tooltip Popup */}
                  <div className="absolute left-1/2 -top-14 -translate-x-1/2 hidden group-hover:flex flex-col items-center z-30 pointer-events-none w-52">
                    <div className="bg-dark-blue dark:bg-slate-950 text-white text-xs font-bold p-3 rounded-xl shadow-2xl text-center border border-white/20 dark:border-slate-800 w-full space-y-1">
                      <p className="font-black text-white line-clamp-1">{post.title}</p>
                      <p className="text-emerald-400 text-xs">{views.toLocaleString()} views ({uniqueViews.toLocaleString()} unique)</p>
                      <p className="text-amber-300 text-xs">{likes} likes • {comments} comments</p>
                    </div>
                    <div className="w-2.5 h-2.5 bg-dark-blue dark:bg-slate-950 rotate-45 -mt-1" />
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-dark-blue/50 font-bold uppercase tracking-wider py-10 text-center col-span-full">
              No articles cached.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardAndHeatmap;
