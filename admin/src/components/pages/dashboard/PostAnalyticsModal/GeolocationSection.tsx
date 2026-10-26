import React, { useState } from "react";
import { Globe } from "lucide-react";
import { useGetRealtimeActiveReadersQuery } from "@/services/api";
import { useAppSelector } from "@/store/store";
import { ComposableMap, Geographies, Geography, Marker } from "react-simple-maps";
import countryMappings from "../../../../../public/country-mappings.json";

interface GeoMetricItem {
  id: string;
  entityId: string;
  entityType: string;
  countryCode: string;
  views: number;
  uniqueViews: number;
}

interface GeolocationSectionProps {
  geoData: GeoMetricItem[];
}

const countryMappingsTyped = (countryMappings as unknown) as Record<string, { numeric: string; latlng: [number, number] }>;

const geoUrl = "/world-110m.json";

const getFlagEmoji = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  try {
    return String.fromCodePoint(...codePoints);
  } catch {
    return "🏳️";
  }
};

const getCountryName = (code: string): string => {
  try {
    const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
    const name = regionNames.of(code.toUpperCase());
    return name ? `${name} ${getFlagEmoji(code)}` : `${code.toUpperCase()} 🏳️`;
  } catch (e) {
    return `${code.toUpperCase()} ${getFlagEmoji(code)}`;
  }
};

const getFormattedCountryName = (code: string): string => {
  if (code === "others") return "Other Regions 🌐";
  return getCountryName(code);
};


export const GeolocationSection: React.FC<GeolocationSectionProps> = ({ geoData }) => {
  const [tooltip, setTooltip] = useState({ show: false, country: "", views: 0, percent: 0, x: 0, y: 0 });
  const totalGeoViews = geoData.reduce((acc, curr) => acc + curr.views, 0);

  const accessToken = useAppSelector((state) => state.auth.accessToken);
  const { data: realtimeData } = useGetRealtimeActiveReadersQuery({ token: accessToken || "" });
  const activeCountries = realtimeData?.activeCountries || {};

  // Sort and aggregate geolocation records
  const sortedGeoData = [...geoData].sort((a, b) => b.views - a.views);
  const topGeo = sortedGeoData.slice(0, 5);
  const otherGeo = sortedGeoData.slice(5);
  const otherViews = otherGeo.reduce((acc, curr) => acc + curr.views, 0);
  const otherUnique = otherGeo.reduce((acc, curr) => acc + curr.uniqueViews, 0);

  const finalGeoData: GeoMetricItem[] = [...topGeo];
  if (otherViews > 0) {
    finalGeoData.push({
      id: "others-geo-id",
      entityId: geoData[0]?.entityId || "",
      entityType: geoData[0]?.entityType || "",
      countryCode: "others",
      views: otherViews,
      uniqueViews: otherUnique,
    });
  }


  return (
    <div className="bg-gray/5 border border-gray p-6 rounded-2xl space-y-6 flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-gray pb-3">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-primary" />
          <h4 className="text-xs font-black uppercase tracking-wider text-dark-blue/60">Geographic View Distribution</h4>
        </div>
      </div>

      {geoData && geoData.length > 0 ? (
        <div className="space-y-6 flex-1 flex flex-col justify-between">
          {/* Centered Map Container */}
          <div className="w-full h-140 flex items-center justify-center relative bg-white border border-gray rounded-2xl p-4 overflow-hidden worldmap-wrapper">
            <style>{`
              .worldmap-wrapper .rsm-geography-empty {
                fill: var(--color-gray) !important;
                stroke: var(--color-white) !important;
              }
            `}</style>
            <ComposableMap width={800} height={400} projectionConfig={{ scale: 165, center: [0, 10] }} style={{ width: "100%", height: "100%" }}>
              <Geographies geography={geoUrl}>
                {({ geographies }) =>
                  geographies.map((geo) => {
                    const countryId = String(geo.id || geo.properties?.id || "");
                    const metric = geoData.find((g) => {
                      const code = g.countryCode.toUpperCase();
                      const targetNumeric = countryMappingsTyped[code]?.numeric;
                      return targetNumeric && Number(targetNumeric) === Number(countryId);
                    });
                    const views = metric?.views || 0;
                    const percent = totalGeoViews > 0 ? (views / totalGeoViews) * 100 : 0;

                    // Dynamic heatmap colors based on view weights
                    let fill = "";
                    if (views > 0) {
                      if (percent > 20) {
                        fill = "#10b981"; // Emerald
                      } else if (percent > 12) {
                        fill = "#6366f1"; // Indigo
                      } else if (percent > 5) {
                        fill = "#3b82f6"; // Blue
                      } else {
                        fill = "#93c5fd"; // Light Blue
                      }
                    }

                    const hasViews = views > 0;

                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        className={hasViews ? "" : "rsm-geography-empty"}
                        style={{
                          default: {
                            fill: hasViews ? fill : undefined,
                            stroke: hasViews ? "var(--color-white)" : undefined,
                            strokeWidth: 0.5,
                            outline: "none",
                            transition: "all 0.2s ease",
                          },
                          hover: {
                            fill: "#4f46e5",
                            stroke: "var(--color-white)",
                            strokeWidth: 0.5,
                            outline: "none",
                            cursor: "pointer",
                          },
                          pressed: {
                            outline: "none",
                          },
                        }}
                        onMouseEnter={() => {
                          setTooltip({
                            show: true,
                            country: geo.properties?.name || "Unknown Region",
                            views,
                            percent: Math.round(percent * 10) / 10,
                            x: 0,
                            y: 0,
                          });
                        }}
                        onMouseLeave={() => {
                          setTooltip({ show: false, country: "", views: 0, percent: 0, x: 0, y: 0 });
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {/* Precise Latitude/Longitude pulsing marker dots */}
              {Object.entries(activeCountries).map(([code, activeCount]) => {
                if (activeCount === 0) return null;
                const coords = countryMappingsTyped[code.toUpperCase()]?.latlng;
                if (!coords) return null;
                return (
                  <Marker key={`marker-${code}`} coordinates={coords}>
                    <g style={{ pointerEvents: "none" }}>
                      <circle r={8} fill="#10b981" opacity={0.4} className="animate-ping" />
                      <circle r={3} fill="#10b981" stroke="#ffffff" strokeWidth={1} />
                    </g>
                  </Marker>
                );
              })}
            </ComposableMap>

            {/* Custom Pinned Tooltip Overlay */}
            {tooltip.show && (
              <div className="absolute bottom-4 left-4 bg-white/95 text-dark-blue py-2.5 px-3.5 rounded-xl shadow-xl border border-gray pointer-events-none transition-all duration-200 z-20 animate-in fade-in slide-in-from-bottom-2 max-w-48">
                <div className="text-[8px] font-black text-primary uppercase tracking-wider mb-0.5">Hovered Region</div>
                <div className="font-bold text-xs truncate">{tooltip.country}</div>
                <div className="text-[10px] text-dark-blue/70 mt-1 font-semibold leading-tight">
                  {tooltip.views.toLocaleString()} views <span className="text-primary font-bold">({tooltip.percent}%)</span>
                </div>
              </div>
            )}
          </div>

          {/* Clean 2-Column Country Breakdown List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            {finalGeoData.map((geo) => {
              const percent = totalGeoViews > 0 ? Math.round((geo.views / totalGeoViews) * 100) : 0;
              
              let sliceColor = "#93c5fd";
              if (geo.countryCode !== "others") {
                if (percent > 20) {
                  sliceColor = "#10b981";
                } else if (percent > 12) {
                  sliceColor = "#6366f1"; 
                } else if (percent > 5) {
                  sliceColor = "#3b82f6";
                }
              }

              const activeCount = activeCountries[geo.countryCode.toUpperCase()] || 0;
              return (
                <div key={geo.id} className="space-y-1.5 py-1">
                  <div className="flex justify-between items-center text-[10px] font-bold">
                    <span className="flex items-center gap-2 text-dark-blue/80">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sliceColor }} />
                      <span className="truncate max-w-44 flex items-center gap-1.5">
                        {getFormattedCountryName(geo.countryCode)}
                        {activeCount > 0 && (
                          <span className="inline-flex items-center gap-0.5 bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[8px] font-black shrink-0">
                            <span className="relative flex h-1 w-1">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
                            </span>
                            {activeCount} live
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="text-dark-blue/60 shrink-0">
                      {geo.views.toLocaleString()} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray/30 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${percent}%`, backgroundColor: sliceColor }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p className="text-[10px] text-dark-blue/40 font-bold uppercase tracking-wider text-center py-12 flex-1 flex items-center justify-center">
          No geographic locations recorded for this publication yet.
        </p>
      )}
    </div>
  );
};
