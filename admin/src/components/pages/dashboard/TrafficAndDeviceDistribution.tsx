import React from "react";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface TrafficAndDeviceDistributionProps {
  summary: any;
}

const TrafficAndDeviceDistribution: React.FC<TrafficAndDeviceDistributionProps> = ({ summary }) => {
  const googleViews = summary?.googleViews || 0;
  const twitterViews = summary?.twitterViews || 0;
  const linkedinViews = summary?.linkedinViews || 0;
  const directViews = summary?.directViews || 0;
  const totalReferrerViews = googleViews + twitterViews + linkedinViews + directViews;

  const trafficData = [
    { name: "Google Search", value: googleViews, color: "#10b981" },
    { name: "Twitter / X", value: twitterViews, color: "#38bdf8" },
    { name: "LinkedIn", value: linkedinViews, color: "#2563eb" },
    { name: "Direct / Other", value: directViews, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  const mobile = summary?.mobileViews || 0;
  const tablet = summary?.tabletViews || 0;
  const desktop = summary?.desktopViews || 0;
  const totalDeviceViews = mobile + tablet + desktop;

  const deviceData = [
    { name: "Desktop", value: desktop, color: "#6366f1" },
    { name: "Mobile", value: mobile, color: "#10b981" },
    { name: "Tablet", value: tablet, color: "#f59e0b" },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Traffic Acquisition Sources */}
      <div className="bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-black text-dark-blue">Traffic Acquisition Sources</h2>
          <p className="text-[10px] text-dark-blue/40 font-semibold mt-0.5">
            Acquisition channels mapped from sitemap referrals and direct routes.
          </p>
        </div>

        {totalReferrerViews > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={trafficData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {trafficData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1329",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-dark-blue/70">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[10px] text-dark-blue/40 font-bold uppercase tracking-wider py-8 text-center">
            No traffic referral logs recorded yet.
          </p>
        )}
      </div>

      {/* Device Classification */}
      <div className="bg-white border border-gray rounded-2xl p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-sm font-black text-dark-blue">Device Classification</h2>
          <p className="text-[10px] text-dark-blue/40 font-semibold mt-0.5">
            Device breakdown segmented using user-agent headers.
          </p>
        </div>

        {totalDeviceViews > 0 ? (
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={deviceData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0b1329",
                    borderRadius: "12px",
                    border: "none",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: "bold",
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-dark-blue/70">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-[10px] text-dark-blue/40 font-bold uppercase tracking-wider py-8 text-center">
            No device classification logs recorded yet.
          </p>
        )}
      </div>
    </div>
  );
};

export default TrafficAndDeviceDistribution;
