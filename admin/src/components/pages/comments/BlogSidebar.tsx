import React from "react";
import clsx from "clsx";
import { useGetBlogsQuery } from "@/services/api";
import { useAppSelector } from "@/store/store";
import SearchBar from "@/components/ui/SearchBar";
import { NextAppUrl } from "@/components/shared/NextAppUrl";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogSidebarProps {
  selectedPostId: string | null;
  onSelect: (id: string) => void;
  search: string;
  onSearchChange: (val: string) => void;
  page: number;
  onPageChange: (p: number) => void;
}

export const BlogSidebar: React.FC<BlogSidebarProps> = ({
  selectedPostId,
  onSelect,
  search,
  onSearchChange,
  page,
  onPageChange,
}) => {
  const limit = 8;
  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const { data: response, isLoading } = useGetBlogsQuery({
    page,
    limit,
    search: search.trim() || undefined,
    authorId: !isAdmin ? user?.id : undefined,
    userId: !isAdmin ? user?.id : undefined,
  });

  const blogs = response?.data?.items || [];
  const total = response?.data?.total || 0;
  const totalPages = Math.ceil(total / limit) || 1;

  React.useEffect(() => {
    if (selectedPostId === null && blogs.length > 0) {
      onSelect(blogs[0].id);
    }
  }, [selectedPostId, blogs, onSelect]);

  return (
    <div className="lg:col-span-4 bg-white border border-gray rounded-2xl p-4 space-y-4 shadow-sm flex flex-col">
      <div className="space-y-2">
        <p className="extra-small-paragraph uppercase tracking-wider font-black text-dark-blue/30 px-2">
          Select Blog Post
        </p>
        <SearchBar
          value={search}
          onChange={onSearchChange}
          placeholder="Search blogs..."
        />
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden space-y-1.5 pr-1 custom-scrollbar">
        <button
          type="button"
          onClick={() => onSelect("")}
          className={clsx(
            "w-full text-left p-3 rounded-xl transition-all cursor-pointer flex items-center justify-between border",
            !selectedPostId
              ? "bg-primary/5 border-primary/20 text-primary font-bold shadow-xs"
              : "bg-transparent border-transparent hover:bg-gray/50 text-dark-blue/60 hover:text-dark-blue"
          )}
        >
          <span className="text-xs font-black">All Blog Posts</span>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-dark-blue/5 text-dark-blue/50">
            {total} Total
          </span>
        </button>

        {isLoading ? (
          <p className="text-[10px] text-dark-blue/40 text-center py-8">
            Loading blogs...
          </p>
        ) : blogs.length === 0 ? (
          <p className="text-[10px] text-dark-blue/40 text-center py-8">
            No blogs found.
          </p>
        ) : (
          blogs.map((blog) => {
            const isSelected = selectedPostId === blog.id;
            return (
              <button
                key={blog.id}
                type="button"
                onClick={() => onSelect(blog.id)}
                className={clsx(
                  "w-full text-left p-3 rounded-xl transition-all cursor-pointer flex flex-col gap-1 border",
                  isSelected
                    ? "bg-primary/5 border-primary/20 text-primary font-bold shadow-xs"
                    : "bg-transparent border-transparent hover:bg-gray/50 text-dark-blue/60 hover:text-dark-blue",
                )}
              >
                <span className="text-xs font-black line-clamp-2 leading-tight">
                  {blog.title}
                </span>
                <NextAppUrl path={`/blog/${blog.slug}`} mode="table" />
              </button>
            );
          })
        )}
      </div>

      {totalPages > 1 && (
        <div className="border-t border-gray pt-3 flex items-center justify-between">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="p-1.5 rounded-lg border border-gray hover:bg-gray/50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer text-dark-blue/60"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-black text-dark-blue/50">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="p-1.5 rounded-lg border border-gray hover:bg-gray/50 disabled:opacity-40 disabled:hover:bg-transparent transition-all cursor-pointer text-dark-blue/60"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
