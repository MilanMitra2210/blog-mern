import * as React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

interface Column<T> {
  header: string;
  accessor: keyof T | ((item: T) => React.ReactNode);
  className?: string;
  headerClassName?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  emptyMessage?: string;
  rowKey: (item: T) => string | number;
}

export default function DataTable<T>({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyMessage = "No data found",
  rowKey,
}: DataTableProps<T>) {
  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl border border-white/80 shadow-xl shadow-dark-blue/3 overflow-hidden w-full max-w-full">
      <div className="overflow-x-auto w-full custom-scrollbar">
        <table className="w-full min-w-200">
          <thead>
            <tr className="border-b border-gray">
              {columns.map((col, idx) => (
                <th
                  key={idx}
                  className={clsx(
                    "text-left px-6 py-4 extra-small-paragraph uppercase tracking-[0.2em] font-bold text-dark-blue/30 whitespace-nowrap",
                    col.headerClassName
                  )}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, rowIndex) => (
                <tr key={`skeleton-${rowIndex}`} className="border-b border-gray/50 last:border-0">
                  {columns.map((_, colIndex) => (
                    <td key={`skeleton-td-${colIndex}`} className="px-6 py-5">
                      <div className="h-4 bg-dark-blue/5 rounded-lg animate-pulse w-full" />
                    </td>
                  ))}
                </tr>
              ))
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="text-center py-16">
                  <p className="small-paragraph text-dark-blue/30 font-bold">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((item, i) => (
                <motion.tr
                  key={rowKey(item)}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => onRowClick?.(item)}
                  className={clsx(
                    "border-b border-gray/50 last:border-0 hover:bg-light-blue/30 transition-colors group",
                    onRowClick && "cursor-pointer"
                  )}
                >
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className={clsx("px-6 py-4", col.className)}>
                      {typeof col.accessor === "function"
                        ? col.accessor(item)
                        : (item[col.accessor] as React.ReactNode)}
                    </td>
                  ))}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
