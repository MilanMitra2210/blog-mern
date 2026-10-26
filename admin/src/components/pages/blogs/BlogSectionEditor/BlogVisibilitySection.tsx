import React from "react";
import clsx from "clsx";
import { UseFormRegister } from "react-hook-form";

interface BlogVisibilitySectionProps {
  isPublished: boolean;
  isFeatured: boolean;
  onTogglePublish: () => void;
  onToggleFeatured: () => void;
  register: UseFormRegister<any>;
}

const BlogVisibilitySection: React.FC<BlogVisibilitySectionProps> = ({
  isPublished,
  isFeatured,
  onTogglePublish,
  onToggleFeatured,
  register,
}) => (
  <section className="pt-8 border-t border-gray space-y-6">
    <h3 className="h4">Visibility & Scheduling</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="flex items-center justify-between gap-4 p-4.5 rounded-2xl border border-gray bg-light-blue/5">
        <div>
          <p className="text-xs font-black text-dark-blue uppercase tracking-widest">
            Publish Post
          </p>
          <p className="small-paragraph">
            Make this post visible on the public frontend website
          </p>
        </div>
        <button
          type="button"
          onClick={onTogglePublish}
          className={clsx(
            "relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer shrink-0",
            isPublished
              ? "bg-emerald-500 shadow-lg shadow-emerald-500/20"
              : "bg-dark-blue/10",
          )}
        >
          <div
            className={clsx(
              "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
              isPublished && "translate-x-6",
            )}
          />
        </button>
      </div>

      <div className="flex items-center justify-between gap-4 p-4.5 rounded-2xl border border-gray bg-light-blue/5">
        <div>
          <p className="text-xs font-black text-dark-blue uppercase tracking-widest">
            Featured Highlight
          </p>
          <p className="small-paragraph">
            Highlight this blog post at the top of homepage listings
          </p>
        </div>
        <button
          type="button"
          onClick={onToggleFeatured}
          className={clsx(
            "relative w-12 h-6 rounded-full transition-all duration-300 cursor-pointer shrink-0",
            isFeatured
              ? "bg-amber-500 shadow-lg shadow-amber-500/20"
              : "bg-dark-blue/10",
          )}
        >
          <div
            className={clsx(
              "absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform duration-300",
              isFeatured && "translate-x-6",
            )}
          />
        </button>
      </div>
    </div>

    {/* Content scheduling */}
    <div className="p-5.5 rounded-2xl border border-gray bg-light-blue/5">
      <div className="flex flex-col gap-3">
        <label className="text-xs font-black text-dark-blue uppercase tracking-widest">
          Schedule Publish Date & Time
        </label>
        <p className="small-paragraph">
          Leave blank to publish immediately, or choose a future release time.
        </p>
        <input
          type="datetime-local"
          className="w-full max-w-sm rounded-xl border border-gray px-4.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 bg-white"
          {...register("publishDate")}
        />
      </div>
    </div>
  </section>
);

export default BlogVisibilitySection;
