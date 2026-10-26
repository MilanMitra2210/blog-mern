import React from "react";
import { PlusCircle, FileText, MinusCircle, CheckCircle2 } from "lucide-react";
import RichTextEditor from "@/components/ui/Form/RichTextEditor";

interface RevisionDiffViewProps {
  selectedRev: any;
  baseRev: any;
  headRev: any;
  nextRev: any;
  compareMode: "current" | "previous";
  setCompareMode: (mode: "current" | "previous") => void;
  added: any[];
  modified: any[];
  removed: any[];
  unchanged: any[];
  totalDiffCount: number;
  leftLabel: string;
  rightLabel: string;
  getBasicSettings: (rev: any) => any;
  getSeoData: (rev: any) => any;
  categories: any[];
  authors: any[];
  tags: any[];
}

export const RevisionDiffView: React.FC<RevisionDiffViewProps> = ({
  selectedRev,
  baseRev,
  headRev,
  nextRev,
  compareMode,
  setCompareMode,
  added,
  modified,
  removed,
  unchanged,
  totalDiffCount,
  leftLabel,
  rightLabel,
  getBasicSettings,
  getSeoData,
  categories,
  authors,
  tags,
}) => {
  return (
    <div className="space-y-6">
      {/* Summary of Changes Badge Row & Toggle */}
      <div className="flex flex-col gap-4 bg-gray/5 p-4 rounded-2xl border border-gray">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-dark-blue/70">Compare selected with:</span>
            <div className="flex bg-gray/20 p-0.5 rounded-lg border border-gray">
              <button
                onClick={() => setCompareMode("current")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  compareMode === "current"
                    ? "bg-white text-dark-blue shadow-xs"
                    : "text-dark-blue/50 hover:text-dark-blue"
                }`}
              >
                Current Draft
              </button>
              <button
                onClick={() => setCompareMode("previous")}
                className={`text-[10px] font-bold px-2.5 py-1 rounded-md transition-all ${
                  compareMode === "previous"
                    ? "bg-white text-dark-blue shadow-xs"
                    : "text-dark-blue/50 hover:text-dark-blue"
                }`}
              >
                Previous Version
              </button>
            </div>
          </div>
          {totalDiffCount > 0 && nextRev && (
            <span className="text-[10px] text-dark-blue/50 font-medium">
              Comparing against {nextRev.isCurrent ? "Current Draft" : `v${nextRev.revisionNumber || nextRev.revision_number}`}
            </span>
          )}
        </div>
        
        {/* Badges */}
        {nextRev ? (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-gray/50">
            {totalDiffCount === 0 ? (
              <span className="text-xs text-dark-blue/40 font-medium">No contents changed between these versions.</span>
            ) : (
              <>
                {added.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-green bg-green/10 dark:bg-green/20 px-2 py-0.5 rounded-md font-bold">
                    <PlusCircle className="w-3.5 h-3.5" /> {added.length} Added
                  </span>
                )}
                {modified.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-orange bg-orange/5 dark:bg-orange/10 px-2 py-0.5 rounded-md font-bold">
                    <FileText className="w-3.5 h-3.5" /> {modified.length} Modified
                  </span>
                )}
                {removed.length > 0 && (
                  <span className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/20 px-2 py-0.5 rounded-md font-bold">
                    <MinusCircle className="w-3.5 h-3.5" /> {removed.length} Removed
                  </span>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="text-xs text-green bg-green/10 dark:bg-green/15 p-2.5 rounded-xl border border-green/20 dark:border-green/30 font-medium pt-2 border-t">
            This is the initial draft version created at first save. All sections are shown below in their original creation state.
          </div>
        )}
      </div>

      {/* Content Diffs */}
      <div className="space-y-5">
        {/* Title Comparison */}
        <div className="border border-gray/60 rounded-2xl overflow-hidden">
          <div className="bg-gray/5 px-4 py-3 border-b border-gray/60 flex items-center justify-between">
            <span className="text-xs font-bold text-dark-blue">Post Title</span>
            {nextRev && baseRev?.title !== headRev?.title && (
              <span className="text-[10px] font-bold text-orange px-2 py-0.5 bg-orange/10 rounded-md">Changed</span>
            )}
          </div>
          <div className="p-4 space-y-2 text-sm">
            {nextRev && baseRev?.title !== headRev?.title && baseRev && headRev ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                  <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wide block mb-1">{leftLabel}</span>
                  <span className="text-dark-blue/60 dark:text-red-300/80 line-through">{baseRev.title}</span>
                </div>
                <div className="p-3 bg-green/10 dark:bg-green/20 rounded-xl border border-green/20 dark:border-green/30">
                  <span className="text-[10px] font-bold text-green uppercase tracking-wide block mb-1">{rightLabel}</span>
                  <span className="text-dark-blue dark:text-green font-bold">{headRev.title}</span>
                </div>
              </div>
            ) : (
              <div className="text-dark-blue font-semibold">{selectedRev?.title}</div>
            )}
          </div>
        </div>

        {/* Excerpt Comparison */}
        <div className="border border-gray/60 rounded-2xl overflow-hidden">
          <div className="bg-gray/5 px-4 py-3 border-b border-gray/60 flex items-center justify-between">
            <span className="text-xs font-bold text-dark-blue">Excerpt</span>
            {nextRev && (baseRev?.excerpt || "") !== (headRev?.excerpt || "") && (
              <span className="text-[10px] font-bold text-orange px-2 py-0.5 bg-orange/10 rounded-md">Changed</span>
            )}
          </div>
          <div className="p-4 text-xs leading-relaxed text-dark-blue/70">
            {nextRev && (baseRev?.excerpt || "") !== (headRev?.excerpt || "") && baseRev && headRev ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3 bg-red-50/60 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30">
                  <span className="text-[10px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wide block mb-1">{leftLabel}</span>
                  <span className="line-through text-dark-blue/60 dark:text-red-300/80">{baseRev.excerpt || "(Empty excerpt)"}</span>
                </div>
                <div className="p-3 bg-green/10 dark:bg-green/20 rounded-xl border border-green/20 dark:border-green/30">
                  <span className="text-[10px] font-bold text-green uppercase tracking-wide block mb-1">{rightLabel}</span>
                  <span className="font-medium text-dark-blue dark:text-green">{headRev.excerpt || "(Empty excerpt)"}</span>
                </div>
              </div>
            ) : (
              <div>{selectedRev?.excerpt || <span className="italic text-dark-blue/40">No excerpt provided.</span>}</div>
            )}
          </div>
        </div>

        {/* Basic Settings Comparison */}
        <div className="border border-gray/60 rounded-2xl overflow-hidden">
          <div className="bg-gray/5 px-4 py-3 border-b border-gray/60 flex items-center justify-between">
            <span className="text-xs font-bold text-dark-blue">Basic Settings</span>
            {(() => {
              const cb = getBasicSettings(headRev);
              const pb = getBasicSettings(baseRev);
              const cbTags = [...(cb?.tag_ids || [])].sort();
              const pbTags = [...(pb?.tag_ids || [])].sort();
              const hasChanged = nextRev && (
                pb?.slug !== cb?.slug ||
                pb?.is_featured !== cb?.is_featured ||
                pb?.is_published !== cb?.is_published ||
                pb?.category_id !== cb?.category_id ||
                pb?.author_id !== cb?.author_id ||
                JSON.stringify(pbTags) !== JSON.stringify(cbTags)
              );
              return hasChanged ? (
                <span className="text-[10px] font-bold text-orange px-2 py-0.5 bg-orange/10 rounded-md">Changed</span>
              ) : null;
            })()}
          </div>
          <div className="p-4 space-y-1 bg-white">
            {(() => {
              const cb = getBasicSettings(headRev || selectedRev);
              const pb = nextRev ? getBasicSettings(baseRev) : null;

              const getCategoryName = (id: string) => categories.find((c: any) => c.id === id)?.name || "Uncategorized";
              const getAuthorName = (id: string) => authors.find((a: any) => a.id === id)?.name || "Unknown Author";
              const getTagNames = (ids: string[]) => ids.map(id => tags.find((t: any) => t.id === id)?.name).filter(Boolean).join(", ") || "No tags";

              const renderField = (label: string, prevVal: string | boolean, currVal: string | boolean, changed: boolean) => {
                const format = (val: any) => typeof val === "boolean" ? (val ? "Yes" : "No") : val || "(Empty)";
                return (
                  <div className="border-b border-gray/40 py-2.5 last:border-0 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-dark-blue/60 uppercase tracking-wider text-[10px] w-48 shrink-0">{label}</span>
                    {changed ? (
                      <div className="flex items-center gap-1.5 flex-wrap flex-1 sm:justify-end">
                        <span className="line-through text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 px-2 py-0.5 rounded-md font-medium">{format(prevVal)}</span>
                        <span className="text-dark-blue/30 dark:text-dark-blue/50">&rarr;</span>
                        <span className="text-green bg-green/10 dark:bg-green/20 px-2 py-0.5 rounded-md font-bold">{format(currVal)}</span>
                      </div>
                    ) : (
                      <span className="text-dark-blue font-bold text-right">{format(currVal)}</span>
                    )}
                  </div>
                );
              };

              return (
                <>
                  {renderField("URL Slug", pb?.slug || "", cb?.slug || "", !!pb && pb.slug !== cb.slug)}
                  {renderField("Featured Post", !!pb?.is_featured, !!cb?.is_featured, !!pb && pb.is_featured !== cb.is_featured)}
                  {renderField("Published Status", !!pb?.is_published, !!cb?.is_published, !!pb && pb.is_published !== cb.is_published)}
                  {renderField("Category", pb?.category_id ? getCategoryName(pb.category_id) : "Uncategorized", cb?.category_id ? getCategoryName(cb.category_id) : "Uncategorized", !!pb && pb.category_id !== cb.category_id)}
                  {renderField("Author", pb?.author_id ? getAuthorName(pb.author_id) : "Unknown Author", cb?.author_id ? getAuthorName(cb.author_id) : "Unknown Author", !!pb && pb.author_id !== cb.author_id)}
                  {renderField("Tags", pb ? getTagNames(pb.tag_ids || []) : "No tags", getTagNames(cb?.tag_ids || []), !!pb && JSON.stringify([...(pb.tag_ids || [])].sort()) !== JSON.stringify([...(cb?.tag_ids || [])].sort()))}
                </>
              );
            })()}
          </div>
        </div>

        {/* SEO Configuration Comparison */}
        <div className="border border-gray/60 rounded-2xl overflow-hidden">
          <div className="bg-gray/5 px-4 py-3 border-b border-gray/60 flex items-center justify-between">
            <span className="text-xs font-bold text-dark-blue">SEO Configuration</span>
            {(() => {
              const cs = getSeoData(headRev);
              const ps = getSeoData(baseRev);
              const hasChanged = nextRev && (
                ps?.meta_title !== cs?.meta_title ||
                ps?.meta_description !== cs?.meta_description ||
                ps?.meta_keywords !== cs?.meta_keywords
              );
              return hasChanged ? (
                <span className="text-[10px] font-bold text-orange px-2 py-0.5 bg-orange/10 rounded-md">Changed</span>
              ) : null;
            })()}
          </div>
          <div className="p-4 space-y-1 bg-white">
            {(() => {
              const cs = getSeoData(headRev || selectedRev);
              const ps = nextRev ? getSeoData(baseRev) : null;

              const renderField = (label: string, prevVal: string, currVal: string, changed: boolean) => {
                const format = (val: string) => val || "(Empty)";
                return (
                  <div className="border-b border-gray/40 py-2.5 last:border-0 flex flex-col sm:flex-row sm:items-start justify-between gap-2 text-xs">
                    <span className="font-bold text-dark-blue/60 uppercase tracking-wider text-[10px] w-48 shrink-0 mt-0.5">{label}</span>
                    {changed ? (
                      <div className="flex flex-col gap-1.5 flex-1 w-full">
                        <div className="p-2 bg-red-50/50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30 rounded-lg text-red-500 dark:text-red-400 line-through font-medium">{format(prevVal)}</div>
                        <div className="p-2 bg-green/10 dark:bg-green/15 border border-green/20 dark:border-green/30 rounded-lg text-green font-bold">{format(currVal)}</div>
                      </div>
                    ) : (
                      <span className="text-dark-blue font-bold text-right flex-1 wrap-break-word">{format(currVal)}</span>
                    )}
                  </div>
                );
              };

              return (
                <>
                  {renderField("Meta Title", ps?.meta_title || "", cs?.meta_title || "", !!ps && ps.meta_title !== cs.meta_title)}
                  {renderField("Meta Description", ps?.meta_description || "", cs?.meta_description || "", !!ps && ps.meta_description !== cs.meta_description)}
                  {renderField("Meta Keywords", ps?.meta_keywords || "", cs?.meta_keywords || "", !!ps && ps.meta_keywords !== cs.meta_keywords)}
                </>
              );
            })()}
          </div>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-bold text-dark-blue px-1">Sections Structure & Content</h4>

          {added.map((sec: any, i: number) => (
            <div key={`add-${i}`} className="border border-green/30 dark:border-green/50 bg-green/5 dark:bg-green/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-green" />
                  <span className="text-xs font-bold text-green">Section Added</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-green bg-green/10 dark:bg-green/20 px-2 py-0.5 rounded-md">
                  {sec.section_type || sec.sectionType}
                </span>
              </div>
              <h5 className="text-xs font-bold text-dark-blue">{sec.title || "Untitled Section"}</h5>
              {sec.content && (
                <RichTextEditor value={sec.content} disabled={true} />
              )}
            </div>
          ))}

          {modified.map((mod: any, i: number) => (
            <div key={`mod-${i}`} className="border border-orange/30 dark:border-orange/50 bg-orange/5 dark:bg-orange/10 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-orange" />
                  <span className="text-xs font-bold text-orange">Section Modified</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-orange bg-orange/10 dark:bg-orange/20 px-2 py-0.5 rounded-md">
                  {mod.current.section_type || mod.current.sectionType}
                </span>
              </div>
              
              {mod.changes.title ? (
                <div className="text-xs space-y-1">
                  <span className="font-bold text-dark-blue/50 dark:text-dark-blue/70 block text-[10px]">Title changed:</span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="line-through text-red-500 dark:text-red-400 font-medium">{mod.previous.title || "(Untitled)"}</span>
                    <span className="text-dark-blue/40 dark:text-dark-blue/60">&rarr;</span>
                    <span className="text-green font-bold">{mod.current.title || "(Untitled)"}</span>
                  </div>
                </div>
              ) : (
                <h5 className="text-xs font-bold text-dark-blue">{mod.current.title || "Untitled Section"}</h5>
              )}

              {mod.changes.content && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                  <div className="p-2.5 bg-red-50/40 dark:bg-red-950/20 rounded-xl border border-red-100 dark:border-red-900/30 text-xs">
                    <span className="text-[9px] font-bold text-red-500 dark:text-red-400 uppercase tracking-wide block mb-1">{leftLabel} Content</span>
                    <RichTextEditor value={mod.previous.content} disabled={true} />
                  </div>
                  <div className="p-2.5 bg-green/10 dark:bg-green/15 rounded-xl border border-green/20 dark:border-green/30 text-xs">
                    <span className="text-[9px] font-bold text-green uppercase tracking-wide block mb-1">{rightLabel} Content</span>
                    <RichTextEditor value={mod.current.content} disabled={true} />
                  </div>
                </div>
              )}
            </div>
          ))}

          {removed.map((sec: any, i: number) => (
            <div key={`rem-${i}`} className="border border-red-200 dark:border-red-900/50 bg-red-50/20 dark:bg-red-950/10 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MinusCircle className="w-4 h-4 text-red-500 dark:text-red-400" />
                  <span className="text-xs font-bold text-red-700 dark:text-red-300">Section Removed</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-red-500 dark:text-red-400 bg-red-100/60 dark:bg-red-950/30 px-2 py-0.5 rounded-md">
                  {sec.section_type || sec.sectionType}
                </span>
              </div>
              <h5 className="text-xs font-bold text-dark-blue/60 dark:text-red-300/80 line-through">{sec.title || "Untitled Section"}</h5>
              {sec.content && (
                <RichTextEditor value={sec.content} disabled={true} />
              )}
            </div>
          ))}

          {unchanged.length > 0 && (
            <div className="border border-gray/40 dark:border-gray/30 rounded-2xl p-4 bg-gray/5 dark:bg-gray/10">
              <div className="flex items-center justify-between text-xs text-dark-blue/60 dark:text-dark-blue/70 font-semibold mb-2">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-dark-blue/40 dark:text-dark-blue/60" />
                  {unchanged.length} Unchanged Section{unchanged.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {unchanged.map((sec: any, i: number) => (
                  <span key={`un-${i}`} className="text-[10px] bg-white dark:bg-gray/20 border border-gray dark:border-gray/30 px-2.5 py-1 rounded-lg text-dark-blue/70 dark:text-dark-blue/90 font-bold shadow-xs">
                    {sec.title || `Section ${i + 1}`}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
