import * as React from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ChevronDown, Loader2, Search } from "lucide-react";
import clsx from "clsx";

export interface InfiniteScrollSelectOption {
  value: string;
  label: string;
  description?: string;
}

interface InfiniteScrollSelectProps {
  label: string;
  value: string;
  selectedOption?: InfiniteScrollSelectOption | null;
  options: InfiniteScrollSelectOption[];
  onChange: (option: InfiniteScrollSelectOption) => void;
  search: string;
  onSearchChange: (value: string) => void;
  onLoadMore: () => void;
  hasMore: boolean;
  isLoading?: boolean;
  isFetching?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  resultCountLabel?: string;
  className?: string;
}

const InfiniteScrollSelect: React.FC<InfiniteScrollSelectProps> = ({
  label,
  value,
  selectedOption: selectedOptionProp,
  options,
  onChange,
  search,
  onSearchChange,
  onLoadMore,
  hasMore,
  isLoading = false,
  isFetching = false,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyMessage = "No options found",
  resultCountLabel,
  className,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectedOption =
    selectedOptionProp ?? options.find((option) => option.value === value);

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const isNearBottom =
      target.scrollTop + target.clientHeight >= target.scrollHeight - 40;

    if (isNearBottom && hasMore && !isFetching) {
      onLoadMore();
    }
  };

  const handleSelect = (option: InfiniteScrollSelectOption) => {
    onChange(option);
    setIsOpen(false);
  };

  return (
    <div className={clsx("space-y-1.5", className)}>
      <div className="flex items-center justify-between ml-1">
        <label className="text-[10px] font-black uppercase tracking-[0.15em] text-dark-blue/40">
          {label}
        </label>
        {resultCountLabel && (
          <span className="text-[9px] font-bold uppercase tracking-widest text-dark-blue/25">
            {resultCountLabel}
          </span>
        )}
      </div>

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="input-field flex min-h-12 w-full items-center justify-between gap-3 text-left"
      >
        <span className="min-w-0">
          {selectedOption ? (
            <>
              <span className="block truncate text-sm font-bold text-dark-blue">
                {selectedOption.label}
              </span>
              {selectedOption.description && (
                <span className="block truncate text-[10px] font-bold text-dark-blue/35">
                  {selectedOption.description}
                </span>
              )}
            </>
          ) : (
            <span className="text-dark-blue/35">{placeholder}</span>
          )}
        </span>
        <ChevronDown
          className={clsx(
            "h-5 w-5 shrink-0 text-dark-blue/20 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-hidden rounded-2xl border border-gray bg-white shadow-2xl"
          >
            <div className="border-b border-gray p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-dark-blue/25" />
                <input
                  value={search}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder={searchPlaceholder}
                  className="input-field min-h-10 pl-9 text-sm"
                  autoFocus
                />
              </div>
            </div>

            <div
              onScroll={handleScroll}
              className="max-h-64 overflow-y-auto p-2 custom-scrollbar"
            >
              {options.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className="flex w-full items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-gray/50"
                  >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-bold text-dark-blue">
                        {option.label}
                      </span>
                      {option.description && (
                        <span className="block truncate text-[10px] font-bold text-dark-blue/35">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 shrink-0 text-primary" />
                    )}
                  </button>
                );
              })}

              {(isLoading || isFetching) && (
                <div className="flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase tracking-widest text-dark-blue/35">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading
                </div>
              )}

              {!isLoading && !isFetching && options.length === 0 && (
                <div className="px-3 py-6 text-center text-xs font-bold text-dark-blue/35">
                  {emptyMessage}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InfiniteScrollSelect;
