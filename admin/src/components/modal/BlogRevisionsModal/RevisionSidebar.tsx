import React from "react";
import { Sparkles, ChevronRight } from "lucide-react";

interface RevisionSidebarProps {
  isLoading: boolean;
  allRevisions: any[];
  selectedRevisionId: string | null;
  setSelectedRevisionId: (id: string) => void;
  formatDate: (date: string) => string;
  getSections: (rev: any) => any[];
  getBasicSettings: (rev: any) => any;
  getSeoData: (rev: any) => any;
}

export const RevisionSidebar: React.FC<RevisionSidebarProps> = ({
  isLoading,
  allRevisions,
  selectedRevisionId,
  setSelectedRevisionId,
  formatDate,
  getSections,
  getBasicSettings,
  getSeoData,
}) => {
  return (
    <div className="w-[320px] shrink-0 bg-gray/10 overflow-y-auto p-4 space-y-2 border-r border-gray">
      <h4 className="text-xs font-bold text-dark-blue/50 px-2 pb-2 uppercase tracking-wider">
        Past Revisions
      </h4>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-10 gap-2">
          <Sparkles className="w-6 h-6 text-primary animate-spin" />
          <p className="text-[10px] font-bold text-dark-blue/60 uppercase tracking-widest">
            Loading...
          </p>
        </div>
      ) : allRevisions.length === 0 ? (
        <p className="text-xs font-semibold text-center text-dark-blue/60 py-6">
          No revisions available.
        </p>
      ) : (
        allRevisions.map((rev: any, idx: number) => {
          const isActive = rev.id === selectedRevisionId;
          const rawDate = rev.createdAt || rev.created_at;
          const formattedDate = formatDate(rawDate);
          
          // Calculate simple modification count
          const itemNext = allRevisions[idx + 1];
          let changeSummary = "";
          if (!itemNext) {
            changeSummary = "Initial Draft";
          } else {
            const changesArr = [];
            if (rev.title !== itemNext.title) changesArr.push("Title");
            if ((rev.excerpt || "") !== (itemNext.excerpt || "")) changesArr.push("Excerpt");
            
            const cSec = getSections(rev);
            const pSec = getSections(itemNext);
            if (cSec.length !== pSec.length || JSON.stringify(cSec) !== JSON.stringify(pSec)) {
              changesArr.push("Sections");
            }

            const cBasic = getBasicSettings(rev);
            const pBasic = getBasicSettings(itemNext);
            const cBasicTags = [...(cBasic?.tag_ids || [])].sort();
            const pBasicTags = [...(pBasic?.tag_ids || [])].sort();
            const hasBasicChanged = pBasic && (
              pBasic.slug !== cBasic?.slug ||
              pBasic.is_featured !== cBasic?.is_featured ||
              pBasic.is_published !== cBasic?.is_published ||
              pBasic.category_id !== cBasic?.category_id ||
              pBasic.author_id !== cBasic?.author_id ||
              JSON.stringify(pBasicTags) !== JSON.stringify(cBasicTags)
            );
            if (hasBasicChanged) {
              changesArr.push("Settings");
            }

            const cSeo = getSeoData(rev);
            const pSeo = getSeoData(itemNext);
            if (JSON.stringify(cSeo) !== JSON.stringify(pSeo)) {
              changesArr.push("SEO");
            }
            
            changeSummary = changesArr.length > 0 ? `${changesArr.join(", ")} changed` : "No changes";
          }

          return (
            <button
              key={rev.id}
              onClick={() => setSelectedRevisionId(rev.id)}
              className={`w-full text-left p-3.5 rounded-2xl border transition-all duration-200 flex flex-col gap-1.5 ${
                isActive
                  ? "bg-primary/5 border-primary shadow-sm"
                  : "bg-white border-transparent hover:border-gray hover:bg-white/80"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-md ${
                  isActive ? "bg-primary text-white" : "bg-primary/10 text-primary"
                }`}>
                  {rev.isCurrent ? "Current Draft" : `v${rev.revisionNumber || rev.revision_number}`}
                </span>
                <span className="text-[10px] text-dark-blue/40 font-medium">
                  {formattedDate.split(",")[0]}
                </span>
              </div>
              <h5 className="text-xs font-bold text-dark-blue truncate w-full">
                {rev.title || "Untitled draft"}
              </h5>
              <div className="flex items-center justify-between text-[10px] text-dark-blue/50">
                <span className="truncate max-w-45 font-medium">{changeSummary}</span>
                <ChevronRight className="w-3.5 h-3.5 shrink-0" />
              </div>
            </button>
          );
        })
      )}
    </div>
  );
};
