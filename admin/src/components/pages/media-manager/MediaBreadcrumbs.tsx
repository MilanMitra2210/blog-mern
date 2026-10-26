import * as React from "react";
import clsx from "clsx";
import { ChevronRight, Home } from "lucide-react";

interface Breadcrumb {
  id: string;
  name: string;
}

interface MediaBreadcrumbsProps {
  breadcrumb: Breadcrumb[];
  onNavigate: (index: number) => void;
}

const MediaBreadcrumbs: React.FC<MediaBreadcrumbsProps> = ({
  breadcrumb,
  onNavigate,
}) => {
  return (
    <div className="flex items-center gap-1.5 overflow-x-auto whitespace-nowrap px-4 py-2 bg-white/50 border border-gray rounded-2xl scrollbar-hide">
      <button
        type="button"
        onClick={() => onNavigate(-1)}
        className={clsx(
          "flex items-center gap-2 px-2 py-1 text-sm font-bold transition-all rounded-lg",
          breadcrumb.length === 0 ? "text-primary bg-primary/5" : "text-dark-blue/40 hover:text-primary hover:bg-primary/5"
        )}
      >
        <Home className="w-4 h-4" />
        Root
      </button>

      {breadcrumb.map((crumb, idx) => (
        <React.Fragment key={crumb.id}>
          <ChevronRight className="w-4 h-4 text-dark-blue/20 shrink-0" />
          <button
            onClick={() => onNavigate(idx)}
            type="button"
            className={clsx(
              "px-3 py-1 text-sm font-bold transition-all rounded-lg",
              idx === breadcrumb.length - 1 ? "text-primary bg-primary/5" : "text-dark-blue/40 hover:text-primary hover:bg-primary/5"
            )}
          >
            {crumb.name}
          </button>
        </React.Fragment>
      ))}
    </div>
  );
};

export default MediaBreadcrumbs;
