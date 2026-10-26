import React from "react";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MediaPaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const MediaPagination: React.FC<MediaPaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-1 py-12">
      <button
        type="button"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage === 1}
        className="p-2 rounded-lg hover:bg-light-blue text-dark-blue/30 disabled:opacity-30 transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
        if (
          totalPages > 7 &&
          p > 1 &&
          p < totalPages &&
          Math.abs(p - currentPage) > 1
        ) {
          if (p === 2 && currentPage > 4) return <span key="dots-1" className="px-1 text-dark-blue/20">...</span>;
          if (p === totalPages - 1 && currentPage < totalPages - 3) return <span key="dots-2" className="px-1 text-dark-blue/20">...</span>;
          if (Math.abs(p - currentPage) > 1) return null;
        }

        return (
          <button
            type="button"
            key={p}
            onClick={() => onPageChange(p)}
            className={clsx(
              "w-8 h-8 rounded-lg small-paragraph font-bold transition-all cursor-pointer",
              currentPage === p
                ? "bg-primary text-pure-white shadow-sm"
                : "text-dark-blue/40 hover:bg-light-blue"
            )}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage === totalPages}
        className="p-2 rounded-lg hover:bg-light-blue text-dark-blue/30 disabled:opacity-30 transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

export default MediaPagination;
