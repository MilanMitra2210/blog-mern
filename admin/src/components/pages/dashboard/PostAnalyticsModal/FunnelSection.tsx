import React from "react";
import { Milestone } from "lucide-react";
import { BarChart, Bar, Cell, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid } from "recharts";

interface FunnelSectionProps {
  postViews: number;
  milestone25: number;
  milestone50: number;
  milestone75: number;
  milestone100: number;
}

export const FunnelSection: React.FC<FunnelSectionProps> = ({
  postViews,
  milestone25,
  milestone50,
  milestone75,
  milestone100,
}) => {
  const funnelChartData = [
    { name: "Opened", count: postViews, percent: 100, color: "#10b981" },
    { name: "25% Scrolled", count: milestone25, percent: postViews > 0 ? Math.min(100, Math.round((milestone25 / postViews) * 100)) : 0, color: "#14b8a6" },
    { name: "50% Scrolled", count: milestone50, percent: postViews > 0 ? Math.min(100, Math.round((milestone50 / postViews) * 100)) : 0, color: "#6366f1" },
    { name: "75% Scrolled", count: milestone75, percent: postViews > 0 ? Math.min(100, Math.round((milestone75 / postViews) * 100)) : 0, color: "#4f46e5" },
    { name: "Read (100%)", count: milestone100, percent: postViews > 0 ? Math.min(100, Math.round((milestone100 / postViews) * 100)) : 0, color: "#4338ca" },
  ];

  return (
    <div className="bg-gray/5 border border-gray p-6 rounded-2xl space-y-4">
      <div className="flex items-center gap-2 border-b border-gray pb-3">
        <Milestone className="w-4 h-4 text-primary" />
        <h4 className="text-xs font-black uppercase tracking-wider text-dark-blue/60">Scroll Engagement Funnel</h4>
      </div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={funnelChartData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-gray)" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: "bold", fill: "var(--color-dark-blue)" }} />
            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: "var(--color-dark-blue)" }} />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-white)",
                borderRadius: "10px",
                border: "1px solid var(--color-gray)",
              }}
              itemStyle={{
                color: "var(--color-dark-blue)",
                fontSize: "10px",
                fontWeight: "bold",
              }}
              labelStyle={{
                color: "var(--color-dark-blue)",
                fontSize: "10px",
                fontWeight: "black",
              }}
              formatter={(
                value: string | number | readonly (string | number)[] | undefined,
                _name: string | number | undefined,
                props: { payload?: { percent: number } }
              ) => [
                `${value ? Number(value).toLocaleString() : 0} views (${props.payload?.percent ?? 0}%)`,
                "Drop-off milestone"
              ]}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]} barSize={55}>
              {funnelChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
