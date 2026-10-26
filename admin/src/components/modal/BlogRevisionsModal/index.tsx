import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import { motion, AnimatePresence } from "framer-motion";
import { X, History, HelpCircle } from "lucide-react";
import {
  useGetBlogRevisionsQuery,
  useRestoreBlogRevisionMutation,
} from "@/services/api";
import { toast } from "react-toastify";
import { GhostButton } from "@/components/ui/Button";
import { valueToHtml } from "@/components/ui/Form/RichTextEditor";
import { RevisionSidebar } from "./RevisionSidebar";
import { RevisionDetailHeader } from "./RevisionDetailHeader";
import { RevisionDiffView } from "./RevisionDiffView";

interface BlogRevisionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  blogId: string;
  onRestoreSuccess: () => void;
  currentBlog?: any;
  categories?: any[];
  authors?: any[];
  tags?: any[];
}

const BlogRevisionsModal: React.FC<BlogRevisionsModalProps> = ({
  isOpen,
  onClose,
  blogId,
  onRestoreSuccess,
  currentBlog,
  categories = [],
  authors = [],
  tags = [],
}) => {
  const { data: revisionsResponse, isLoading } = useGetBlogRevisionsQuery(
    blogId,
    { skip: !isOpen }
  );

  const [restoreRevision, { isLoading: isRestoring }] = useRestoreBlogRevisionMutation();
  const [selectedRevisionId, setSelectedRevisionId] = useState<string | null>(null);
  const [compareMode, setCompareMode] = useState<"current" | "previous">("current");

  const revisions = revisionsResponse?.data || [];

  const currentBlogRevision = currentBlog
    ? {
        id: "current",
        blogId: currentBlog.id,
        title: currentBlog.title,
        excerpt: currentBlog.excerpt,
        sections_data: {
          sections: currentBlog.sections || currentBlog.sections_data || [],
          basic_settings: {
            slug: currentBlog.slug,
            is_featured: currentBlog.isFeatured ?? currentBlog.is_featured ?? false,
            is_published: currentBlog.isPublished ?? currentBlog.is_published ?? false,
            category_id: currentBlog.category?.id ?? currentBlog.categoryId ?? currentBlog.category_id ?? null,
            author_id: currentBlog.author?.id ?? currentBlog.authorId ?? currentBlog.author_id ?? null,
            tag_ids: currentBlog.tags ? currentBlog.tags.map((t: any) => t.id) : [],
          },
          seo_data: {
            meta_title: currentBlog.seo?.metaTitle ?? currentBlog.seo?.meta_title ?? "",
            meta_description: currentBlog.seo?.metaDescription ?? currentBlog.seo?.meta_description ?? "",
            meta_keywords: currentBlog.seo?.metaKeywords ?? currentBlog.seo?.meta_keywords ?? "",
          }
        },
        revisionNumber:
          (revisions[0]?.revisionNumber || (revisions[0] as any)?.revision_number || 0) + 1,
        createdAt:
          currentBlog.updatedAt || currentBlog.updated_at || new Date().toISOString(),
        isCurrent: true,
      }
    : null;

  const allRevisions = currentBlogRevision
    ? [currentBlogRevision, ...revisions]
    : revisions;

  useEffect(() => {
    if (allRevisions.length > 0 && !selectedRevisionId) {
      setSelectedRevisionId(allRevisions[0].id);
    }
  }, [allRevisions, selectedRevisionId]);

  const handleRestore = async (revisionId: string, revisionNumber: number) => {
    try {
      await restoreRevision({ blogId, revisionId }).unwrap();
      toast.success(`Restored to revision #${revisionNumber} successfully`);
      onRestoreSuccess();
      onClose();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to restore revision");
    }
  };

  if (!isOpen) return null;

  const selectedIndex = allRevisions.findIndex((r) => r.id === selectedRevisionId);
  const selectedRev = selectedIndex !== -1 ? allRevisions[selectedIndex] : null;

  const nextRev =
    selectedRev && selectedIndex !== -1
      ? (compareMode === "current"
          ? (selectedIndex === 0
              ? (allRevisions.length > 1 ? allRevisions[1] : null)
              : allRevisions[0])
          : (selectedIndex + 1 < allRevisions.length ? allRevisions[selectedIndex + 1] : null))
      : null;

  const isSelectedNewer =
    !nextRev ||
    !selectedRev ||
    (selectedRev.revisionNumber || (selectedRev as any).revision_number) >
      (nextRev.revisionNumber || (nextRev as any).revision_number);

  const baseRev = isSelectedNewer ? nextRev : selectedRev;
  const headRev = isSelectedNewer ? selectedRev : nextRev;

  const leftLabel = nextRev
    ? ((nextRev as any).isCurrent ? "Current Draft" : `v${nextRev.revisionNumber || (nextRev as any).revision_number}`)
    : "";

  const rightLabel = selectedRev
    ? ((selectedRev as any).isCurrent ? "Current Draft" : `v${selectedRev.revisionNumber || (selectedRev as any).revision_number}`)
    : "";

  const formatDate = (rawDate: string) => {
    if (!rawDate) return "Invalid Date";
    const d = dayjs(rawDate);
    if (!d.isValid()) return "Invalid Date";
    return d.format("MMM D, YYYY, h:mm A");
  };

  const getSections = (rev: any) => {
    if (!rev) return [];
    if (rev.sections_data && !Array.isArray(rev.sections_data) && typeof rev.sections_data === "object") {
      return rev.sections_data.sections || [];
    }
    return rev.sections_data || [];
  };

  const getBasicSettings = (rev: any) => {
    if (!rev) return null;
    if (rev.sections_data && !Array.isArray(rev.sections_data) && typeof rev.sections_data === "object") {
      return rev.sections_data.basic_settings || null;
    }
    if (rev.isInitialDraft) {
      return {
        slug: "",
        is_featured: false,
        is_published: false,
        category_id: null,
        author_id: null,
        tag_ids: [],
      };
    }
    if (currentBlog) {
      return {
        slug: currentBlog.slug || "",
        is_featured: currentBlog.isFeatured ?? currentBlog.is_featured ?? false,
        is_published: currentBlog.isPublished ?? currentBlog.is_published ?? false,
        category_id: currentBlog.categoryId ?? currentBlog.category_id ?? null,
        author_id: currentBlog.authorId ?? currentBlog.author_id ?? null,
        tag_ids: currentBlog.tags ? currentBlog.tags.map((t: any) => t.id) : [],
      };
    }
    return {
      slug: rev.slug || "",
      is_featured: rev.is_featured || false,
      is_published: rev.is_published || false,
      category_id: rev.category_id || null,
      author_id: rev.author_id || null,
      tag_ids: rev.tag_ids || [],
    };
  };

  const getSeoData = (rev: any) => {
    if (!rev) return null;
    if (rev.sections_data && !Array.isArray(rev.sections_data) && typeof rev.sections_data === "object") {
      return rev.sections_data.seo_data || null;
    }
    if (rev.isInitialDraft) {
      return {
        meta_title: "",
        meta_description: "",
        meta_keywords: "",
      };
    }
    if (currentBlog) {
      return {
        meta_title: currentBlog.seo?.metaTitle ?? currentBlog.seo?.meta_title ?? "",
        meta_description: currentBlog.seo?.metaDescription ?? currentBlog.seo?.meta_description ?? "",
        meta_keywords: currentBlog.seo?.metaKeywords ?? currentBlog.seo?.meta_keywords ?? "",
      };
    }
    return {
      meta_title: rev.meta_title || "",
      meta_description: rev.meta_description || "",
      meta_keywords: rev.meta_keywords || "",
    };
  };

  const compareSections = () => {
    if (!selectedRev) return { added: [], modified: [], removed: [], unchanged: [] };
    
    const currSections = getSections(headRev);
    const prevSections = getSections(baseRev);

    const added: any[] = [];
    const modified: any[] = [];
    const unchanged: any[] = [];
    const removed: any[] = [];

    currSections.forEach((currSec: any, index: number) => {
      const prevSec = prevSections.find((p: any) => {
        if (currSec.id && p.id) return currSec.id === p.id;
        
        const currOrder = currSec.display_order !== undefined ? currSec.display_order : currSec.displayOrder;
        const prevOrder = p.display_order !== undefined ? p.display_order : p.displayOrder;
        if (currOrder !== undefined && prevOrder !== undefined) {
          return currOrder === prevOrder;
        }
        
        return prevSections.indexOf(p) === index;
      });

      if (!prevSec) {
        added.push(currSec);
      } else {
        const normalize = (val: any) => (val === null || val === undefined ? "" : String(val).trim());
        const titleDiff = normalize(currSec.title) !== normalize(prevSec.title);
        const contentDiff = valueToHtml(currSec.content) !== valueToHtml(prevSec.content);
        
        const currType = currSec.section_type || currSec.sectionType || "";
        const prevType = prevSec.section_type || prevSec.sectionType || "";
        const typeDiff = currType !== prevType;
        
        const currCtaText = currSec.cta_button_text || currSec.ctaButtonText;
        const prevCtaText = prevSec.cta_button_text || prevSec.ctaButtonText;
        const ctaTextDiff = normalize(currCtaText) !== normalize(prevCtaText);
        
        const currCtaUrl = currSec.cta_button_url || currSec.ctaButtonUrl;
        const prevCtaUrl = prevSec.cta_button_url || prevSec.ctaButtonUrl;
        const ctaUrlDiff = normalize(currCtaUrl) !== normalize(prevCtaUrl);

        if (titleDiff || contentDiff || typeDiff || ctaTextDiff || ctaUrlDiff) {
          modified.push({
            current: currSec,
            previous: prevSec,
            changes: {
              title: titleDiff,
              content: contentDiff,
              sectionType: typeDiff,
              cta: ctaTextDiff || ctaUrlDiff,
            },
          });
        } else {
          unchanged.push(currSec);
        }
      }
    });

    prevSections.forEach((prevSec: any, index: number) => {
      const exists = currSections.some((c: any) => {
        if (c.id && prevSec.id) return c.id === prevSec.id;
        
        const currOrder = c.display_order !== undefined ? c.display_order : c.displayOrder;
        const prevOrder = prevSec.display_order !== undefined ? prevSec.display_order : prevSec.displayOrder;
        if (currOrder !== undefined && prevOrder !== undefined) {
          return currOrder === prevOrder;
        }
        
        return currSections.indexOf(c) === index;
      });
      if (!exists) {
        removed.push(prevSec);
      }
    });

    return { added, modified, removed, unchanged };
  };

  const { added, modified, removed, unchanged } = compareSections();
  const totalDiffCount = added.length + modified.length + removed.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="absolute inset-0 bg-dark-blue/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-7xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray flex flex-col h-[85vh] max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <History className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none text-dark-blue">Revision History & Tracker</h3>
                    <p className="extra-small-paragraph mt-1 text-dark-blue/60">
                      Compare version changes and easily restore your draft contents.
                    </p>
                  </div>
                </div>
                <GhostButton
                  onClick={onClose}
                  className="p-2 -mr-2 text-dark-blue/40 hover:text-dark-blue hover:bg-gray rounded-xl"
                >
                  <X className="w-5 h-5" />
                </GhostButton>
              </div>

              {/* Main Content Area: Split Pane */}
              <div className="flex-1 min-h-0 flex divide-x divide-gray overflow-hidden">
                <RevisionSidebar
                  isLoading={isLoading}
                  allRevisions={allRevisions}
                  selectedRevisionId={selectedRevisionId}
                  setSelectedRevisionId={setSelectedRevisionId}
                  formatDate={formatDate}
                  getSections={getSections}
                  getBasicSettings={getBasicSettings}
                  getSeoData={getSeoData}
                />

                <div className="flex-1 overflow-y-auto bg-white flex flex-col">
                  {selectedRev ? (
                    <div className="p-6 space-y-6 flex-1">
                      <RevisionDetailHeader
                        selectedRev={selectedRev}
                        isRestoring={isRestoring}
                        formatDate={formatDate}
                        handleRestore={handleRestore}
                      />

                      <RevisionDiffView
                        selectedRev={selectedRev}
                        baseRev={baseRev}
                        headRev={headRev}
                        nextRev={nextRev}
                        compareMode={compareMode}
                        setCompareMode={setCompareMode}
                        added={added}
                        modified={modified}
                        removed={removed}
                        unchanged={unchanged}
                        totalDiffCount={totalDiffCount}
                        leftLabel={leftLabel}
                        rightLabel={rightLabel}
                        getBasicSettings={getBasicSettings}
                        getSeoData={getSeoData}
                        categories={categories}
                        authors={authors}
                        tags={tags}
                      />
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center flex-1 py-20 text-center px-4">
                      <HelpCircle className="w-12 h-12 text-dark-blue/20 mb-2" />
                      <h4 className="text-sm font-bold text-dark-blue">No Revision Selected</h4>
                      <p className="text-xs text-dark-blue/50 mt-1">Select a version from the left panel to review its contents.</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogRevisionsModal;
