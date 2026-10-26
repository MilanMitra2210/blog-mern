import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, BookOpen, Eye, Heart, MessageSquare, Share2, ArrowRight } from "lucide-react";

const MotionLink = motion.create(Link);

interface DashboardKpiCardsProps {
  stats: any;
  summary: any;
  canReadEnquiries?: boolean;
  canReadBlogs?: boolean;
  isAdmin?: boolean;
}

const DashboardKpiCards: React.FC<DashboardKpiCardsProps> = ({
  stats,
  summary,
  canReadBlogs = true,
  isAdmin = false,
}) => {
  const trends = summary?.trends;
  const getTrend = (key: "views" | "likes" | "comments" | "reach") => {
    if (trends) {
      if (key === "views" && trends.viewsTrend) return trends.viewsTrend;
      if (key === "likes" && trends.likesTrend) return trends.likesTrend;
      if (key === "comments" && trends.commentsTrend) return trends.commentsTrend;
      if (key === "reach" && trends.reachTrend) return trends.reachTrend;
    }
    return "0% this week";
  };

  const totalViews = summary?.totalViews ?? 0;
  const totalLikes = summary?.totalLikes ?? 0;
  const totalComments = summary?.totalComments ?? (stats?.totalComments ?? 0);
  const overallReach = summary?.overallReach ?? 0;
  const uniqueViews = summary?.totalUniqueViews ?? Math.round(totalViews * 0.7);

  const kpiList = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      subtext: "Registered accounts",
      icon: Users,
      colorClass: "text-indigo-600 bg-indigo-50",
      link: "/users",
      clickable: isAdmin,
    },
    {
      label: "Total Posts",
      value: stats?.totalBlogs ?? 0,
      subtext: "Articles published",
      icon: BookOpen,
      colorClass: "text-dark-blue bg-gray/50",
      link: "/blogs",
      clickable: canReadBlogs,
    },
    {
      label: "Total Views",
      value: totalViews,
      subtext: `${getTrend("views")} (${uniqueViews.toLocaleString()} unique)`,
      icon: Eye,
      colorClass: "text-blue-600 bg-blue-50",
      clickable: false,
    },
    {
      label: "Total Likes",
      value: totalLikes,
      subtext: getTrend("likes"),
      icon: Heart,
      colorClass: "text-rose-500 bg-rose-50",
      clickable: false,
    },
    {
      label: "Total Comments",
      value: totalComments,
      subtext: getTrend("comments"),
      icon: MessageSquare,
      colorClass: "text-emerald-600 bg-emerald-50",
      link: "/comments",
      clickable: isAdmin,
    },
    {
      label: "Overall Reach",
      value: overallReach,
      subtext: getTrend("reach"),
      icon: Share2,
      colorClass: "text-violet-600 bg-violet-50",
      clickable: false,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
      {kpiList.map((kpi, idx) => {
        const Icon = kpi.icon;
        const cardContent = (
          <div className="bg-white border border-gray rounded-2xl p-5 shadow-sm space-y-2 hover:shadow-md hover:border-primary/20 transition-all flex flex-col justify-between h-full">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-black tracking-wider text-dark-blue/45">{kpi.label}</span>
              </div>
              <div className={`p-2.5 rounded-xl ${kpi.colorClass} shrink-0`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <h3 className="text-xl font-black text-dark-blue">
                {typeof kpi.value === "number" ? kpi.value.toLocaleString() : kpi.value}
              </h3>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-emerald-600 font-bold">{kpi.subtext}</span>
                {kpi.clickable && (
                  <span className="text-xs text-primary font-black uppercase tracking-wider flex items-center gap-0.5">
                    Manage <ArrowRight className="w-2.5 h-2.5" />
                  </span>
                )}
              </div>
            </div>
          </div>
        );

        if (kpi.clickable && kpi.link) {
          return (
            <MotionLink
              key={kpi.label}
              to={kpi.link}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              whileHover={{ y: -3, scale: 1.01 }}
              transition={{ duration: 0.2, delay: idx * 0.04 }}
            >
              {cardContent}
            </MotionLink>
          );
        }

        return (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.04 }}
          >
            {cardContent}
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardKpiCards;
