import React, { useState, useRef, useEffect } from "react";
import { RefreshCw, BookOpen, FileText } from "lucide-react";

interface DashboardHeaderProps {
  onRefresh: () => void;
  isFetching?: boolean;
  totalActive: number;
  activePosts?: Record<string, number>;
  posts?: any[];
  onSelectPost?: (post: any) => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onRefresh,
  isFetching,
  totalActive,
  activePosts = {},
  posts = [],
  onSelectPost,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeList = Object.entries(activePosts).map(([id, count]) => {
    const matchedPost = posts.find((p) => p.id === id);
    return {
      id,
      count,
      title: matchedPost ? matchedPost.title : "Static Page / Storefront",
      slug: matchedPost ? `/${matchedPost.slug}` : "",
      isBlog: !!matchedPost,
      post: matchedPost,
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="h1 text-dark-blue">
          Welcome to <span className="text-primary font-black">QuillForge</span> Admin
        </h1>
        <p className="small-paragraph text-dark-blue/60 mt-1">
          Analyze website metrics, view inquiries, and perform administrative overrides.
        </p>
      </div>
      <div className="flex items-center gap-3 self-end sm:self-auto relative" ref={popoverRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 px-3.5 py-2.5 rounded-xl cursor-pointer hover:bg-emerald-100/50 dark:hover:bg-emerald-900/40 transition-all select-none"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
            {totalActive} {totalActive === 1 ? "Reader" : "Readers"} Online
          </span>
        </button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-white border border-gray rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
            <h5 className="text-[10px] font-black text-dark-blue uppercase tracking-wider mb-2 border-b border-gray pb-2">Active Pages Breakdown</h5>
            {activeList.length === 0 ? (
              <div className="text-[10px] text-dark-blue/40 font-bold py-2 text-center">No active readers on tracked pages</div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {activeList.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      if (item.isBlog && item.post) {
                        onSelectPost?.(item.post);
                        setIsOpen(false);
                      }
                    }}
                    disabled={!item.isBlog}
                    className={`w-full text-left flex items-start justify-between gap-3 text-[10px] font-bold p-1.5 rounded-xl transition-all ${
                      item.isBlog 
                        ? "hover:bg-gray/20 cursor-pointer" 
                        : "opacity-75 cursor-default"
                    }`}
                  >
                    <div className="space-y-0.5 truncate flex-1">
                      <div className="text-dark-blue truncate flex items-center gap-1.5 leading-tight">
                        {item.isBlog ? (
                          <BookOpen className="w-3 h-3 text-primary shrink-0" />
                        ) : (
                          <FileText className="w-3 h-3 text-indigo-500 shrink-0" />
                        )}
                        <span className="truncate">{item.title}</span>
                      </div>
                      {item.slug && <div className="text-dark-blue/45 text-[8px] font-semibold truncate pl-4.5">{item.slug}</div>}
                    </div>
                    <span className="bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded text-[9px] font-black shrink-0 flex items-center gap-1 self-center">
                      <span className="relative flex h-1 w-1">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-1 w-1 bg-emerald-500"></span>
                      </span>
                      {item.count}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <button
          onClick={onRefresh}
          disabled={isFetching}
          className="flex items-center gap-2 bg-white border border-gray hover:border-dark-blue/20 text-dark-blue/60 hover:text-dark-blue px-4 py-2.5 rounded-xl transition-all font-bold text-xs shadow-sm cursor-pointer hover:scale-[1.02] active:scale-[0.98] shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? "animate-spin" : ""}`} />
          Refresh Stats
        </button>
      </div>
    </div>
  );
};

export default DashboardHeader;
