import React from "react";

interface OverviewCardsProps {
  views: number;
  uniqueViews?: number;
  likes: number;
  completions: number;
  completionRate: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  views,
  uniqueViews,
  likes,
  completions,
  completionRate,
}) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="bg-gray/10 rounded-2xl p-4 border border-gray/50 hover:border-primary/25 transition-all">
        <span className="text-[9px] uppercase font-black text-dark-blue/45 tracking-wider">Total Views</span>
        <p className="text-2xl font-black text-primary mt-1">{views.toLocaleString()}</p>
      </div>
      <div className="bg-gray/10 rounded-2xl p-4 border border-gray/50 hover:border-indigo-600/25 transition-all">
        <span className="text-[9px] uppercase font-black text-dark-blue/45 tracking-wider">Unique Views</span>
        <p className="text-2xl font-black text-indigo-600 mt-1">
          {(uniqueViews || Math.round(views * 0.7)).toLocaleString()}
        </p>
      </div>
      <div className="bg-gray/10 rounded-2xl p-4 border border-gray/50 hover:border-rose-500/25 transition-all">
        <span className="text-[9px] uppercase font-black text-dark-blue/45 tracking-wider">Likes</span>
        <p className="text-2xl font-black text-rose-500 mt-1">{likes.toLocaleString()}</p>
      </div>
      <div className="bg-gray/10 rounded-2xl p-4 border border-gray/50 hover:border-teal-500/25 transition-all">
        <span className="text-[9px] uppercase font-black text-dark-blue/45 tracking-wider">Completion Rate</span>
        <p className="text-2xl font-black text-teal-600 mt-1">
          {completionRate > 0
            ? completionRate
            : views > 0
            ? (Math.round((completions / views) * 1000) / 10)
            : 0}
          %
        </p>
      </div>
    </div>
  );
};
