import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  useGetDashboardStatsQuery,
  useGetAnalyticsPostsQuery,
  useGetRealtimeActiveReadersQuery,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { Permission } from "@/constants/permissions";

import DashboardHeader from "./DashboardHeader";
import DashboardKpiCards from "./DashboardKpiCards";
import ReaderEngagementTimeline from "./ReaderEngagementTimeline";
import TrafficAndDeviceDistribution from "./TrafficAndDeviceDistribution";
import RecentActivity from "./RecentActivity";
import QuickOperations from "./QuickOperations";
import LeaderboardAndHeatmap from "./LeaderboardAndHeatmap";
import PostBreakdownTable from "./PostBreakdownTable";
import PostAnalyticsModal from "./PostAnalyticsModal";

const DashboardFeature: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.roleRel?.permissions || user?.role_rel?.permissions || [];
  const isAdmin = user?.role === "ADMIN";

  const canReadBlogs = isAdmin || permissions.includes(Permission.BLOGS_READ);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("views");
  const { data: statsResponse, isLoading: statsLoading, refetch: refetchStats, isFetching: statsFetching } = useGetDashboardStatsQuery();
  const { data: postsResponse, isLoading: postsLoading } = useGetAnalyticsPostsQuery({
    page,
    limit,
    search: searchQuery.trim() || undefined,
    sortBy,
  });

  const stats = statsResponse?.data;
  const summary = statsResponse?.data?.analytics;
  const timeline = summary?.timeline || [];
  const paginatedPosts = postsResponse?.data?.items || [];
  const totalPosts = postsResponse?.data?.total || 0;
  const totalPages = Math.ceil(totalPosts / limit) || 1;

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { data: realtimeData } = useGetRealtimeActiveReadersQuery({ token: accessToken || "" });
  const totalActive = realtimeData?.totalActive || 0;
  const activePosts = realtimeData?.activePosts || {};

  const [searchParams, setSearchParams] = useSearchParams();
  const analyticsId = searchParams.get("analyticsId");

  const selectedPost = React.useMemo(() => {
    if (!analyticsId) return null;
    return (
      paginatedPosts.find((p) => p.id === analyticsId) ||
      summary?.topPosts?.find((p) => p.id === analyticsId) ||
      null
    );
  }, [analyticsId, paginatedPosts, summary?.topPosts]);

  const handleSelectPost = (post: PostMetricBreakdown) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set("analyticsId", post.id);
    setSearchParams(newParams);
  };

  const handleCloseAnalytics = () => {
    const newParams = new URLSearchParams(searchParams);
    newParams.delete("analyticsId");
    setSearchParams(newParams);
  };

  if (statsLoading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="space-y-8"
    >
      <DashboardHeader
        onRefresh={refetchStats}
        isFetching={statsFetching}
        totalActive={totalActive}
        activePosts={activePosts}
        posts={paginatedPosts}
        onSelectPost={handleSelectPost}
      />

      <DashboardKpiCards
        stats={stats}
        summary={summary}
        canReadBlogs={canReadBlogs}
        isAdmin={isAdmin}
      />

      <ReaderEngagementTimeline timeline={timeline} />

      <TrafficAndDeviceDistribution summary={summary} />

      {/* Middle Split Grid: Recent Activity & Quick Operations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {canReadBlogs && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-2 space-y-6"
          >
            <RecentActivity blogs={stats?.recentBlogs} enquiries={undefined} />
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className={canReadBlogs ? "space-y-6" : "lg:col-span-3 space-y-6"}
        >
          <QuickOperations isFullWidth={!canReadBlogs} isAdmin={isAdmin} />
        </motion.div>
      </div>

      <LeaderboardAndHeatmap
        topPosts={summary?.topPosts}
        paginatedPosts={paginatedPosts}
        onSelectPost={handleSelectPost}
      />

      <PostBreakdownTable
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setSearchQuery(val);
          setPage(1);
        }}
        sortBy={sortBy}
        onSortChange={(val) => {
          setSortBy(val);
          setPage(1);
        }}
        postsLoading={postsLoading}
        paginatedPosts={paginatedPosts}
        page={page}
        limit={limit}
        totalPages={totalPages}
        totalPosts={totalPosts}
        onPageChange={setPage}
        onLimitChange={(size) => {
          setLimit(size);
          setPage(1);
        }}
        onSelectPost={handleSelectPost}
        activePosts={activePosts}
      />

      <PostAnalyticsModal post={selectedPost} onClose={handleCloseAnalytics} />
    </motion.div>
  );
};

export default DashboardFeature;
