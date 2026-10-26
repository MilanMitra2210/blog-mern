import React from "react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import {
  useGetUtmMetricsQuery,
  useGetEngagementMetricsQuery,
  useGetGeoMetricsQuery,
  useGetRealtimeActiveReadersQuery,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { OverviewCards } from "./OverviewCards";
import { AcquisitionSection } from "./AcquisitionSection";
import { GeolocationSection } from "./GeolocationSection";
import { FunnelSection } from "./FunnelSection";

interface PostAnalyticsModalProps {
  post: PostMetricBreakdown | null;
  entityType?: "blog" | "cms_page";
  onClose: () => void;
}

const PostAnalyticsModal: React.FC<PostAnalyticsModalProps> = ({ post, entityType = "blog", onClose }) => {
  if (!post) return null;

  const activeEntityType = post.entityType || entityType;

  // Query UTM metrics, engagement metrics, and geolocation metrics
  const { data: utmDataResponse } = useGetUtmMetricsQuery({ entityId: post.id, entityType: activeEntityType });
  const utmData = utmDataResponse?.data || [];

  const { data: engagementResponse } = useGetEngagementMetricsQuery({ entityId: post.id, entityType: activeEntityType });
  const engagement = engagementResponse?.data;

  const { data: geoResponse } = useGetGeoMetricsQuery({ entityId: post.id, entityType: activeEntityType });
  const geoData = geoResponse?.data || [];

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { data: realtimeData } = useGetRealtimeActiveReadersQuery({
    token: accessToken || "",
    entityId: post.id,
    entityType: activeEntityType,
  });
  const postActive = realtimeData?.entityActive || 0;

  return (
    <div
      className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 cursor-pointer"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl p-8 w-full max-w-6xl shadow-2xl relative border border-gray flex flex-col gap-6 text-dark-blue cursor-default max-h-[92vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl hover:bg-gray text-dark-blue/40 hover:text-dark-blue/80 transition-all cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="border-b border-gray pb-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
              {activeEntityType.toUpperCase()} publication analytics
            </span>
            <h3 className="text-xl font-black leading-tight mt-3 pr-10">{post.title}</h3>
            <p className="text-xs text-dark-blue/40 font-semibold mt-1">{post.slug}</p>
          </div>
          {postActive > 0 && (
            <div className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-500/25 px-4 py-2 rounded-2xl shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-black text-emerald-600 uppercase tracking-wider">
                {postActive} active reader{postActive > 1 ? "s" : ""}
              </span>
            </div>
          )}
        </div>

        {/* ROW 1: Overview Metric Cards */}
        <OverviewCards
          views={post.views}
          uniqueViews={post.uniqueViews}
          likes={post.likes}
          completions={post.completions}
          completionRate={post.completionRate}
        />

        {/* ROW 2: Acquisition Section (Full Width) */}
        <AcquisitionSection
          googleViews={post.googleViews || 0}
          twitterViews={post.twitterViews || 0}
          linkedinViews={post.linkedinViews || 0}
          directViews={post.directViews || 0}
          utmData={utmData}
        />

        {/* ROW 3: Geolocation Section (Full Width) */}
        <GeolocationSection geoData={geoData} />

        {/* ROW 3: Scroll Engagement Funnel Chart (Full Width) */}
        <FunnelSection
          postViews={post.views}
          milestone25={engagement?.milestone25 || 0}
          milestone50={engagement?.milestone50 || 0}
          milestone75={engagement?.milestone75 || 0}
          milestone100={engagement?.milestone100 || 0}
        />
      </motion.div>
    </div>
  );
};

export default PostAnalyticsModal;
