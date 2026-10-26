import React from "react";
import { Compass, Layers } from "lucide-react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface UtmCampaignMetric {
  id: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  views: number;
  uniqueViews: number;
}

interface AcquisitionSectionProps {
  googleViews: number;
  twitterViews: number;
  linkedinViews: number;
  directViews: number;
  utmData: UtmCampaignMetric[];
}

export const AcquisitionSection: React.FC<AcquisitionSectionProps> = ({
  googleViews,
  twitterViews,
  linkedinViews,
  directViews,
  utmData,
}) => {
  const total = googleViews + twitterViews + linkedinViews + directViews;

  const trafficData = [
    { name: "Google Search", value: googleViews, color: "#10b981" },
    { name: "Twitter / X", value: twitterViews, color: "#38bdf8" },
    { name: "LinkedIn", value: linkedinViews, color: "#2563eb" },
    { name: "Direct / Other", value: directViews, color: "#94a3b8" },
  ].filter((d) => d.value > 0);

  return (
    <div className="bg-gray/5 border border-gray p-6 rounded-2xl space-y-6">
      <div className="flex items-center gap-2 border-b border-gray pb-3">
        <Compass className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-black uppercase tracking-wider text-dark-blue/60">Acquisition Channels</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
        {/* Acquisition Donut */}
        <div className="md:col-span-5 flex flex-col items-center gap-4">
          <div className="h-32 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={total > 0 ? trafficData : [{ name: "No Traffic", value: 1 }]}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={45}
                  paddingAngle={total > 0 ? 4 : 0}
                  dataKey="value"
                >
                  {total > 0 ? (
                    trafficData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))
                  ) : (
                    <Cell fill="var(--color-gray)" />
                  )}
                </Pie>
                {total > 0 && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--color-white)",
                      borderRadius: "12px",
                      border: "1px solid var(--color-gray)",
                    }}
                    itemStyle={{
                      color: "var(--color-dark-blue)",
                      fontSize: "11px",
                      fontWeight: "bold",
                    }}
                    labelStyle={{
                      color: "var(--color-dark-blue)",
                      fontSize: "11px",
                      fontWeight: "black",
                    }}
                  />
                )}
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Referrers Channels List */}
          <div className="w-full space-y-1 px-1 border-t border-gray/50 pt-3">
            {[
              { name: "Google Search", value: googleViews, color: "bg-[#10b981]" },
              { name: "Twitter / X", value: twitterViews, color: "bg-[#38bdf8]" },
              { name: "LinkedIn", value: linkedinViews, color: "bg-[#2563eb]" },
              { name: "Direct / Other", value: directViews, color: "bg-[#94a3b8]" },
            ].map((channel, idx) => (
              <div key={idx} className="flex justify-between items-center text-[9px] font-bold">
                <span className="flex items-center gap-1.5 text-dark-blue/80">
                  <span className={`w-2 h-2 rounded-full shrink-0 ${channel.color}`} />
                  {channel.name}
                </span>
                <span className="text-dark-blue/60">{channel.value.toLocaleString()} views</span>
              </div>
            ))}
          </div>
        </div>

        {/* UTM Attribution Card */}
        <div className="md:col-span-7 space-y-3">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-dark-blue/50 border-b border-gray pb-2">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Traffic Attribution
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Campaigns Table */}
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-dark-blue/40 tracking-wider">Top Campaigns</span>
              {utmData && utmData.length > 0 ? (
                <div className="max-h-32 overflow-y-auto border border-gray rounded-xl">
                  <table className="w-full text-left text-[9px] font-semibold text-dark-blue">
                    <thead className="bg-gray/20 uppercase text-[8px] font-black text-dark-blue/45 border-b border-gray sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5">Campaign</th>
                        <th className="px-2 py-1.5 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray">
                      {(() => {
                        const groups: Record<string, { utmCampaign: string; views: number }> = {};
                        utmData.forEach((row) => {
                          const campaign = row.utmCampaign;
                          if (!campaign || campaign.trim() === "" || campaign === "—") {
                            return;
                          }
                          if (!groups[campaign]) {
                            groups[campaign] = { utmCampaign: campaign, views: 0 };
                          }
                          groups[campaign].views += row.views;
                        });
                        const items = Object.values(groups).sort((a, b) => b.views - a.views);
                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan={2} className="px-2 py-4 text-center text-[9px] font-bold text-dark-blue/40 uppercase tracking-wider">
                                No active campaigns
                              </td>
                            </tr>
                          );
                        }
                        return items
                          .slice(0, 4)
                          .map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray/5">
                              <td className="px-2 py-1 font-bold text-primary max-w-20 truncate">{row.utmCampaign}</td>
                              <td className="px-2 py-1 text-right font-bold">{row.views.toLocaleString()}</td>
                            </tr>
                          ));
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[9px] text-dark-blue/40 font-bold uppercase tracking-wider py-4">No Campaigns</p>
              )}
            </div>

            {/* Sources Table */}
            <div className="space-y-2">
              <span className="text-[8px] font-black uppercase text-dark-blue/40 tracking-wider">Top Sources</span>
              {utmData && utmData.length > 0 ? (
                <div className="max-h-32 overflow-y-auto border border-gray rounded-xl">
                  <table className="w-full text-left text-[9px] font-semibold text-dark-blue">
                    <thead className="bg-gray/20 uppercase text-[8px] font-black text-dark-blue/45 border-b border-gray sticky top-0">
                      <tr>
                        <th className="px-2 py-1.5">Source</th>
                        <th className="px-2 py-1.5 text-right">Views</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray">
                      {(() => {
                        const groups: Record<string, { utmSource: string; views: number }> = {};
                        utmData.forEach((row) => {
                          const source = row.utmSource || "—";
                          const sourceLower = source.toLowerCase();
                          if (
                            sourceLower === "google" ||
                            sourceLower === "twitter" ||
                            sourceLower === "x.com" ||
                            sourceLower === "t.co" ||
                            sourceLower === "linkedin" ||
                            sourceLower === "direct"
                          ) {
                            return;
                          }
                          if (!groups[source]) {
                            groups[source] = { utmSource: source, views: 0 };
                          }
                          groups[source].views += row.views;
                        });
                        const items = Object.values(groups).sort((a, b) => b.views - a.views);
                        if (items.length === 0) {
                          return (
                            <tr>
                              <td colSpan={2} className="px-2 py-4 text-center text-[9px] font-bold text-dark-blue/40 uppercase tracking-wider">
                                No custom sources
                              </td>
                            </tr>
                          );
                        }
                        return items
                          .slice(0, 4)
                          .map((row, idx) => (
                            <tr key={idx} className="hover:bg-gray/5">
                              <td className="px-2 py-1 font-bold text-secondary max-w-20 truncate">{row.utmSource}</td>
                              <td className="px-2 py-1 text-right font-bold">{row.views.toLocaleString()}</td>
                            </tr>
                          ));
                      })()}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[9px] text-dark-blue/40 font-bold uppercase tracking-wider py-4">No Sources</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
