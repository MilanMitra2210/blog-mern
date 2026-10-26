import { useState, useRef } from "react";
import { createPortal } from "react-dom";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { GhostButton } from "@/components/ui/Button";
import { Edit3, Trash2, Star, Eye, EyeOff, MessageSquare, BarChart3 } from "lucide-react";
import { NextAppUrl } from "@/components/shared/NextAppUrl";
import clsx from "clsx";

const formatCompactNumber = (num: number) => {
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (num >= 1_000) {
    return (num / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return num.toString();
};

const MetricsPopover = ({ blog }: { blog: Blog }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      setCoords({
        top: rect.top + window.scrollY - 165, // Render closer to the trigger (not too high)
        left: rect.left + window.scrollX + (rect.width / 2) - 200, // Center align horizontally for 400px wide box
      });
      setIsOpen(true);
    }
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 200); // Allow time to transition mouse to popover
  };

  const handlePopoverMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const handlePopoverMouseLeave = () => {
    setIsOpen(false);
  };

  const views = blog.metrics?.views ?? (blog as any).views ?? 0;
  const likes = blog.metrics?.likes ?? (blog as any).likes ?? 0;
  const m = blog.metrics || {
    views,
    uniqueViews: Math.round(views * 0.75),
    likes,
    googleViews: 0,
    twitterViews: 0,
    linkedinViews: 0,
    directViews: views,
    otherViews: 0,
    mobileViews: 0,
    tabletViews: 0,
    desktopViews: views,
  };

  const trafficData = [
    { name: "Google", value: m.googleViews || 0, color: "#10b981" },
    { name: "Twitter/X", value: m.twitterViews || 0, color: "#38bdf8" },
    { name: "LinkedIn", value: m.linkedinViews || 0, color: "#2563eb" },
    { name: "Direct", value: m.directViews || 0, color: "#94a3b8" },
    { name: "Other", value: m.otherViews || 0, color: "#cbd5e1" },
  ].filter(d => d.value > 0);

  const totalReferrerViews = trafficData.reduce((acc, curr) => acc + curr.value, 0);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="flex flex-col gap-1 cursor-pointer py-1"
    >
      <div className="flex items-center gap-1 text-xs font-bold text-dark-blue">
        <Eye className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
        <span>{m.views.toLocaleString()}</span>
        <span className="text-[10px] text-dark-blue/40 font-normal">
          ({(m.uniqueViews || Math.round(m.views * 0.7)).toLocaleString()} unique)
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-medium text-dark-blue/50">
        <span className="text-emerald-600">G: {m.googleViews || 0}</span>
        <span className="text-sky-500">X: {m.twitterViews || 0}</span>
        <span className="text-blue-600">L: {m.linkedinViews || 0}</span>
        <span className="text-slate-500">D: {m.directViews || 0}</span>
      </div>

      {isOpen &&
        createPortal(
          <div
            style={{
              position: "absolute",
              top: `${coords.top}px`,
              left: `${coords.left}px`,
            }}
            onMouseEnter={handlePopoverMouseEnter}
            onMouseLeave={handlePopoverMouseLeave}
            className="flex gap-4 z-9999 bg-white border border-gray shadow-2xl rounded-xl p-3.5 w-100 text-left pointer-events-auto align-middle"
          >
            {/* Left Column: Data Tables */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-dark-blue/40 uppercase tracking-wider mb-2 border-b border-gray pb-1">
                Traffic Channels
              </div>
              <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] mb-3">
                <div className="flex items-center justify-between">
                  <span className="text-emerald-600 font-bold">Google:</span>
                  <span className="text-dark-blue font-bold">{(m.googleViews || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sky-500 font-bold">Twitter/X:</span>
                  <span className="text-dark-blue font-bold">{(m.twitterViews || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-blue-600 font-bold">LinkedIn:</span>
                  <span className="text-dark-blue font-bold">{(m.linkedinViews || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-bold">Direct:</span>
                  <span className="text-dark-blue font-bold">{(m.directViews || 0).toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between col-span-2">
                  <span className="text-dark-blue/40 font-bold">Other:</span>
                  <span className="text-dark-blue font-bold">{(m.otherViews || 0).toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] font-black text-dark-blue/40 uppercase tracking-wider mb-2 border-b border-gray pb-1">
                Device Breakdown
              </div>
              <div className="grid grid-cols-3 gap-1 text-[9px] text-center text-dark-blue/70">
                <div className="bg-primary/5 rounded px-1 py-1">
                  <span className="block font-bold">Mobile</span>
                  <span className="font-semibold">{(m.mobileViews || 0).toLocaleString()}</span>
                </div>
                <div className="bg-primary/5 rounded px-1 py-1">
                  <span className="block font-bold">Tablet</span>
                  <span className="font-semibold">{(m.tabletViews || 0).toLocaleString()}</span>
                </div>
                <div className="bg-primary/5 rounded px-1 py-1">
                  <span className="block font-bold">Desktop</span>
                  <span className="font-semibold">{(m.desktopViews || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Donut Chart */}
            <div className="w-36 shrink-0 flex flex-col justify-center items-center border-l border-gray pl-6">
              <div className="text-[10px] font-black text-dark-blue/40 uppercase tracking-wider mb-2 text-center w-full">
                Acquisition
              </div>
              {totalReferrerViews > 0 ? (
                <div className="w-32 h-32 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={trafficData}
                        cx="50%"
                        cy="50%"
                        innerRadius={28}
                        outerRadius={48}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {trafficData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        wrapperStyle={{ zIndex: 10000 }}
                        contentStyle={{
                          backgroundColor: "#0b1329",
                          borderRadius: "8px",
                          border: "none",
                          color: "#fff",
                          fontSize: "10px",
                          fontWeight: "bold",
                          padding: "4px 8px",
                        }}
                        itemStyle={{ color: "#fff" }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-[10px] font-bold text-dark-blue/70 leading-none">Total</span>
                    <span className="text-xs font-black text-primary leading-none mt-0.5">{formatCompactNumber(totalReferrerViews)}</span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-center text-[9px] font-bold text-dark-blue/30 uppercase">
                  No Data
                </div>
              )}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

interface GetColumnsParams {
  handleOpenEdit: (blog: Blog) => void;
  setDeleteConfirm: (blog: Blog) => void;
  handleOpenAnalytics?: (blog: Blog) => void;
  canWrite?: boolean;
  isAdmin?: boolean;
  currentUserId?: string;
}

export const getColumns = ({
  handleOpenEdit,
  setDeleteConfirm,
  handleOpenAnalytics,
  canWrite = true,
  isAdmin = false,
  currentUserId,
}: GetColumnsParams) => {
  const baseColumns = [
  {
    header: "Blog",
    accessor: (blog: Blog) => {
      const bannerUrl = blog.bannerImage?.url;
      return (
        <div className="flex items-center gap-3">
          <div className="w-16 h-10 rounded-lg bg-primary/5 border border-gray overflow-hidden shrink-0">
            {bannerUrl ? (
              <img
                src={bannerUrl}
                alt={blog.title}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-dark-blue/20 text-[10px] font-bold uppercase">
                No img
              </div>
            )}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-dark-blue truncate max-w-70">
              {blog.title}
            </p>
            <NextAppUrl path={`/blog/${blog.slug}`} mode="table" />
          </div>
        </div>
      );
    },
  },
  {
    header: "Author",
    accessor: (blog: Blog) => (
      <div className="min-w-0">
        <p className="text-sm font-bold text-dark-blue truncate">
          {blog.author?.name || "—"}
        </p>
        {blog.author?.designation && (
          <p className="extra-small-paragraph text-dark-blue/40 truncate">
            {blog.author.designation}
          </p>
        )}
      </div>
    ),
  },
  {
    header: "Category",
    accessor: (blog: Blog) =>
      blog.category ? (
        <span className="px-3 py-1 rounded-lg bg-primary/5 text-primary text-xs font-bold border border-primary/10 whitespace-nowrap">
          {blog.category.name}
        </span>
      ) : (
        <span className="text-dark-blue/30 text-xs">—</span>
      ),
  },
  {
    header: "Created By",
    accessor: (blog: Blog) => {
      const creator: any =
        blog.createdBy && typeof blog.createdBy === "object"
          ? blog.createdBy
          : blog.author && typeof blog.author === "object"
          ? blog.author
          : null;

      if (!creator) {
        return (
          <span className="extra-small-paragraph text-dark-blue/30 italic">
            System
          </span>
        );
      }

      const role = creator.role || "USER";
      const roleColor =
        role === "ADMIN"
          ? "text-purple-500 bg-purple-50 border-purple-200"
          : "text-blue-500 bg-blue-50 border-blue-200";

      return (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-dark-blue whitespace-nowrap">
            {creator.name || creator.email || "System"}
          </p>
          <span
            className={clsx(
              "inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
              roleColor
            )}
          >
            {role}
          </span>
        </div>
      );
    },
  },
  {
    header: "Updated By",
    accessor: (blog: Blog) => {
      if (!blog.updatedBy) {
        return (
          <span className="extra-small-paragraph text-dark-blue/30 italic">
            —
          </span>
        );
      }

      const roleColor =
        blog.updatedBy.role === "ADMIN"
          ? "text-purple-500 bg-purple-50 border-purple-200"
          : "text-blue-500 bg-blue-50 border-blue-200";

      return (
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-bold text-dark-blue">
            {blog.updatedBy.name || "Unknown"}
          </p>
          <span
            className={clsx(
              "inline-flex items-center gap-1 w-fit px-1.5 py-0.5 rounded-md text-[10px] font-bold border uppercase tracking-wider",
              roleColor
            )}
          >
            {blog.updatedBy.role}
          </span>
        </div>
      );
    },
  },
  {
    header: "Status",
    accessor: (blog: Blog) => (
      <div className="flex items-center gap-1.5">
        {blog.isPublished ? (
          <>
            <Eye className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-600">Published</span>
          </>
        ) : (
          <>
            <EyeOff className="w-3.5 h-3.5 text-orange" />
            <span className="text-xs font-bold text-orange">Draft</span>
          </>
        )}
      </div>
    ),
  },
  {
    header: "Rating",
    accessor: (blog: Blog) => (
      <div className="flex items-center gap-1.5">
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        <span className="text-sm font-bold text-dark-blue">
          {blog.avgRating > 0 ? blog.avgRating.toFixed(1) : "—"}
        </span>
        {blog.totalRatings > 0 && (
          <span className="text-[10px] text-dark-blue/30">
            ({blog.totalRatings})
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Views & Referrals",
    accessor: (blog: Blog) => <MetricsPopover blog={blog} />,
  },
  {
    header: "Likes",
    accessor: (blog: Blog) => (
      <span className="text-xs font-bold text-dark-blue/60">
        {blog.metrics?.likes ?? (blog as any).likes ?? 0}
      </span>
    ),
  },
  {
    header: "Comments",
    accessor: (blog: Blog) => (
      <div className="flex items-center gap-1.5">
        <MessageSquare className="w-3.5 h-3.5 text-blue-500" />
        <span className="text-xs font-bold text-dark-blue/80">
          {blog.totalComments ?? (blog as any).commentsCount ?? 0}
        </span>
      </div>
    ),
  },
  {
    header: "Read Time",
    accessor: (blog: Blog) => (
      <span className="text-sm text-dark-blue/60 font-medium">
        {blog.readTime} min
      </span>
    ),
  },
];

  if (!canWrite) {
    return baseColumns;
  }

  return [
    ...baseColumns,
    {
      header: "Actions",
      headerClassName: "text-right",
      className: "text-right",
      accessor: (blog: Blog) => {
        const authorId = blog.author?.id || (blog.author as any)?._id || (typeof blog.author === "string" ? blog.author : null);
        const createdById = (blog as any).createdBy?.id || (blog as any).createdBy?._id || (blog as any).createdById || (typeof (blog as any).createdBy === "string" ? (blog as any).createdBy : null);
        const isOwner = !!(
          currentUserId && (
            (createdById && String(createdById) === String(currentUserId)) ||
            (authorId && String(authorId) === String(currentUserId))
          )
        );
        const canManageThisPost = isAdmin || isOwner;

        return (
          <div
            className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <GhostButton
              onClick={() => handleOpenAnalytics?.(blog)}
              paddingClassName="p-2"
              className="rounded-lg hover:bg-indigo-50 text-dark-blue/30 hover:text-indigo-600 transition-all cursor-pointer"
            >
              <BarChart3 className="w-4 h-4" />
            </GhostButton>
            {canManageThisPost && (
              <GhostButton
                onClick={() => handleOpenEdit(blog)}
                paddingClassName="p-2"
                className="rounded-lg hover:bg-primary/5 text-dark-blue/30 hover:text-primary transition-all cursor-pointer"
                title="Edit Post"
              >
                <Edit3 className="w-4 h-4" />
              </GhostButton>
            )}
            {canManageThisPost && (
              <GhostButton
                onClick={() => setDeleteConfirm(blog)}
                paddingClassName="p-2"
                className="rounded-lg hover:bg-red-50 text-dark-blue/30 hover:text-red-500 transition-all cursor-pointer"
                title="Delete Post"
              >
                <Trash2 className="w-4 h-4" />
              </GhostButton>
            )}
          </div>
        );
      },
    },
  ];
};
