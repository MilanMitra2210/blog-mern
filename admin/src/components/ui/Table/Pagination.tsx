import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (size: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  pageSizeOptions = [8, 12, 24, 48, 100],
  onPageSizeChange,
}: PaginationProps) {
  const minPageSize = pageSizeOptions.length > 0 ? Math.min(...pageSizeOptions) : (itemsPerPage || 8);
  if (totalPages <= 1 && (!onPageSizeChange || (totalItems !== undefined && totalItems <= minPageSize))) return null;

  const startItem = (currentPage - 1) * (itemsPerPage || 0) + 1;
  const endItem = Math.min(currentPage * (itemsPerPage || 0), totalItems || 0);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 border-t border-gray bg-white/40 w-full">
      <div className="flex items-center gap-6">
        {onPageSizeChange && itemsPerPage !== undefined && (
          <div className="flex items-center gap-2 small-paragraph text-dark-blue/40 font-bold">
            <span>Show</span>
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => onPageSizeChange(Number(e.target.value))}
                className="appearance-none bg-white border border-gray rounded-xl pl-3 pr-8 py-1.5 outline-none text-dark-blue/70 cursor-pointer focus:border-primary transition-all text-xs font-bold shadow-xs hover:bg-light-blue/10 min-w-17.5"
              >
                {pageSizeOptions.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-dark-blue/40">
                <ChevronDown className="w-3 h-3" />
              </div>
            </div>
            <span>entries</span>
          </div>
        )}
        <div className="small-paragraph text-dark-blue/30 font-bold">
          {totalItems !== undefined && itemsPerPage !== undefined ? (
            <>
              Showing {startItem}–{endItem} of {totalItems}
            </>
          ) : (
            `Page ${currentPage} of ${totalPages}`
          )}
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            onClick={() => onPageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg hover:bg-light-blue text-dark-blue/30 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            // Logic for showing limited page numbers if totalPages is large
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
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg small-paragraph font-bold transition-all cursor-pointer ${
                  currentPage === p
                    ? "bg-primary text-pure-white shadow-sm"
                    : "text-dark-blue/40 hover:bg-light-blue"
                }`}
              >
                {p}
              </button>
            );
          })}

          <button
            onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg hover:bg-light-blue text-dark-blue/30 disabled:opacity-30 transition-all cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

