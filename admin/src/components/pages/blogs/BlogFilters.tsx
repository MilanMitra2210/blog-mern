import React from "react";
import { Tag } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import StatusFilter from "@/components/ui/StatusFilter";

interface BlogFiltersProps {
  search: string;
  onSearchChange: (val: string) => void;
  statusFilter: "all" | "published" | "draft";
  onStatusChange: (val: "all" | "published" | "draft") => void;
  categoryFilter: string;
  onCategoryChange: (val: string) => void;
  categories: BlogCategory[];
}

const BLOG_STATUS_OPTIONS: {
  value: "all" | "published" | "draft";
  label: string;
}[] = [
  { value: "all", label: "all" },
  { value: "published", label: "published" },
  { value: "draft", label: "draft" },
];

const BlogFilters: React.FC<BlogFiltersProps> = ({
  search,
  onSearchChange,
  statusFilter,
  onStatusChange,
  categoryFilter,
  onCategoryChange,
  categories,
}) => {
  return (
    <div className="flex flex-col md:flex-row items-center gap-4">
      <SearchBar
        value={search}
        onChange={onSearchChange}
        placeholder="Search blogs..."
      />

      <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
        {/* Category Filter */}
        <div className="relative w-full sm:w-48 group">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-blue/30">
            <Tag className="w-3.5 h-3.5" />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white/60 border border-gray rounded-xl text-sm appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Filter */}
        <StatusFilter
          value={statusFilter}
          onChange={onStatusChange}
          options={BLOG_STATUS_OPTIONS}
          className="w-full sm:w-auto"
        />
      </div>
    </div>
  );
};

export default BlogFilters;
