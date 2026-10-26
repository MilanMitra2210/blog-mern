import React from "react";
import { Link } from "react-router-dom";

const NEXT_URL = import.meta.env.VITE_NEXT_URL || "http://localhost:3002";

interface NextAppUrlProps {
  path: string;
  mode: "edit" | "table";
}

export const NextAppUrl: React.FC<NextAppUrlProps> = ({ path, mode }) => {
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const fullUrl = `${NEXT_URL.replace(/\/$/, "")}${cleanPath}`;

  const truncateUrl = (url: string, maxLength: number = 55) => {
    if (url.length <= maxLength) return url;
    return url.substring(0, maxLength) + "...";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  if (mode === "edit") {
    return (
      <div className="mt-2 text-xs">
        <span className="text-dark-blue/40 font-medium">Live URL: </span>
        <Link
          to={fullUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleClick}
          className="text-primary hover:underline font-semibold break-all"
        >
          {fullUrl}
        </Link>
      </div>
    );
  }

  return (
    <div className="relative group/tooltip inline-block max-w-70">
      <Link
        to={fullUrl}
        target="_blank"
        rel="noopener noreferrer"
        onClick={handleClick}
        className="text-xs bg-light-blue px-2.5 py-1 rounded-lg font-bold text-primary hover:bg-primary/10 transition-colors border border-primary/20 truncate block"
      >
        {truncateUrl(fullUrl)}
      </Link>
      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover/tooltip:block z-50 bg-dark-blue dark:bg-white text-white dark:text-dark-blue text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-dark-blue/20 dark:border-white/20 pointer-events-none transition-all">
        {fullUrl}
        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-dark-blue dark:border-t-white" />
      </div>
    </div>
  );
};

export default NextAppUrl;
