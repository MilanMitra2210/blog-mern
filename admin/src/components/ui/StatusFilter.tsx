import React from "react";
import { motion } from "framer-motion";
import clsx from "clsx";

export type StatusType = "all" | "active" | "inactive";

interface StatusFilterProps<T extends string> {
  value: T;
  onChange: (value: T) => void;
  options?: { value: T; label: string }[];
  className?: string;
}

interface StatusFilterComponent {
  <T extends string = StatusType>(props: StatusFilterProps<T>): React.ReactElement | null;
}

const DEFAULT_OPTIONS: { value: StatusType; label: string }[] = [
  { value: "all", label: "all" },
  { value: "active", label: "active" },
  { value: "inactive", label: "inactive" },
];

const StatusFilter: StatusFilterComponent = <T extends string = StatusType>({
  value,
  onChange,
  options = DEFAULT_OPTIONS as { value: T; label: string }[],
  className = "",
}: StatusFilterProps<T>) => {
  return (
    <div
      className={clsx(
        "flex p-1 bg-dark-blue/3 border border-dark-blue/5 rounded-xl relative",
        className
      )}
    >
      {options.map((option) => {
        const isActive = value === option.value;

        return (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={clsx(
              "relative flex-1 px-5 py-1.5 rounded-lg small-paragraph font-black uppercase tracking-widest transition-colors duration-300 cursor-pointer z-10 min-w-20 text-center",
              isActive ? "text-dark-blue" : "text-dark-blue/30 hover:text-dark-blue/60"
            )}
          >
            <span className="relative z-20">{option.label}</span>
            {isActive && (
              <motion.div
                layoutId="status-active-pill-v2"
                className="absolute inset-0 bg-white rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.08)] ring-1 ring-black/4 z-10"
                transition={{ type: "spring", bounce: 0.1, duration: 0.4 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default StatusFilter;
