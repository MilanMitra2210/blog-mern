import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ReaderEngagementTimelineProps {
  timeline: any[];
}

const ReaderEngagementTimeline: React.FC<ReaderEngagementTimelineProps> = ({ timeline }) => {
  const [activeChartMetric, setActiveChartMetric] = useState<"views" | "comments" | "reach">("views");

  const getChartConfig = () => {
    switch (activeChartMetric) {
      case "comments":
        return {
          dataKey: "comments",
          color: "#10b981", // emerald
          label: "Comments",
        };
      case "reach":
        return {
          dataKey: "reach",
          color: "#8b5cf6", // violet
          label: "Total Reach",
        };
      default:
        return {
          dataKey: "views",
          color: "#3b82f6", // blue
          label: "Views",
        };
    }
  };

  const chartConfig = getChartConfig();

  return (
    <div className="bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-sm font-black text-dark-blue">Reader Engagement Timeline</h2>
          <p className="text-[10px] text-dark-blue/40 font-semibold mt-0.5">
            Visualizing growth statistics and traffic metrics over the last 30 days.
          </p>
        </div>

        {/* Toggle buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-gray/30 rounded-xl w-fit">
          <button
            onClick={() => setActiveChartMetric("views")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeChartMetric === "views"
                ? "bg-white text-primary shadow-sm"
                : "text-dark-blue/40 hover:text-dark-blue/70"
            }`}
          >
            Views
          </button>
          <button
            onClick={() => setActiveChartMetric("reach")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeChartMetric === "reach"
                ? "bg-white text-primary shadow-sm"
                : "text-dark-blue/40 hover:text-dark-blue/70"
            }`}
          >
            Reach
          </button>
          <button
            onClick={() => setActiveChartMetric("comments")}
            className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeChartMetric === "comments"
                ? "bg-white text-primary shadow-sm"
                : "text-dark-blue/40 hover:text-dark-blue/70"
            }`}
          >
            Comments
          </button>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="h-72 w-full pt-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b", fontSize: 10, fontWeight: 700 }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#0b1329",
                borderRadius: "12px",
                border: "none",
                color: "#fff",
                fontSize: "11px",
                fontWeight: "bold",
              }}
              labelStyle={{ opacity: 0.6 }}
            />
            <Area
              type="monotone"
              dataKey={chartConfig.dataKey}
              name={chartConfig.label}
              stroke={chartConfig.color}
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#chartGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default ReaderEngagementTimeline;
