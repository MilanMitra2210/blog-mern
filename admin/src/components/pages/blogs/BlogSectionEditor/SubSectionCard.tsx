import React, { lazy, Suspense } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  Control,
} from "react-hook-form";
import { Trash2, ChevronDown, ChevronUp, Image as ImageIcon } from "lucide-react";
import clsx from "clsx";
import TextField from "@/components/ui/Form/TextField";
import { GhostButton } from "@/components/ui/Button";
import { BlogFormValues } from "../schema";

const RichTextEditor = lazy(() => import("@/components/ui/Form/RichTextEditor"));

interface SubSectionCardProps {
  sIndex: number;
  ssIndex: number;
  control: Control<BlogFormValues>;
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  watch: UseFormWatch<BlogFormValues>;
  setValue: UseFormSetValue<BlogFormValues>;
  ssExpanded: boolean;
  toggleSubSection: (sIndex: number, ssIndex: number) => void;
  handleOpenMediaPicker: (sIndex: number, ssIndex?: number) => void;
  handleClearMedia: (sIndex: number, ssIndex?: number) => void;
  isFaq?: boolean;
}

const SubSectionCard: React.FC<SubSectionCardProps> = ({
  sIndex,
  ssIndex,
  control,
  register,
  errors,
  watch,
  setValue,
  ssExpanded,
  toggleSubSection,
  handleOpenMediaPicker,
  handleClearMedia,
  isFaq = false,
}) => {
  const ssMedia = watch(`sections.${sIndex}.subSections.${ssIndex}.media`) as Media | null;
  const ssTitle =
    watch(`sections.${sIndex}.subSections.${ssIndex}.title`) ||
    (isFaq ? `Question ${ssIndex + 1}` : `Untitled Sub-Section ${ssIndex + 1}`);

  return (
    <div
      className={clsx(
        "relative bg-white border border-gray rounded-xl transition-shadow group/ss",
        !ssExpanded && "overflow-hidden"
      )}
    >
      <div
        onClick={() => toggleSubSection(sIndex, ssIndex)}
        role="button"
        tabIndex={0}
        aria-expanded={ssExpanded}
        aria-label={`Toggle sub-section ${ssIndex + 1}: ${ssTitle}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSubSection(sIndex, ssIndex);
          }
        }}
        className={clsx(
          "sticky top-13.25 z-10 flex items-center justify-between px-4 py-2.5 bg-light-blue/60 backdrop-blur-sm border-b border-gray cursor-pointer select-none transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          ssExpanded ? "rounded-t-[14px]" : "rounded-[14px]"
        )}
      >
        <div className="flex-1 flex items-center gap-2.5 py-1 min-w-0">
          <span className="w-5 h-5 rounded-md bg-dark-blue/5 border border-gray flex items-center justify-center text-[10px] font-black text-dark-blue/40 shrink-0">
            {ssIndex + 1}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2.5 min-w-0 flex-1">
            <span
              className={clsx(
                "inline-flex items-center px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-wider border shrink-0 w-fit",
                isFaq
                  ? "bg-teal-500/10 text-teal-600 border-teal-500/20"
                  : "bg-dark-blue/5 text-dark-blue/50 border-gray"
              )}
            >
              {isFaq ? `Q&A #${ssIndex + 1}` : "Sub-Section"}
            </span>
            <p className="text-[11px] font-bold text-dark-blue/70 truncate max-w-30 sm:max-w-xs leading-none">
              {ssTitle}
            </p>
          </div>
          {ssExpanded ? (
            <ChevronUp className="w-3.5 h-3.5 text-dark-blue/25 shrink-0" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-dark-blue/25 shrink-0" />
          )}
        </div>

        <div className="opacity-0 group-hover/ss:opacity-100 transition-opacity shrink-0 pl-2">
          <GhostButton
            type="button"
            onClick={(e) => {
              e.stopPropagation(); 
              const currentSS = watch(`sections.${sIndex}.subSections`) || [];
              const nextSS = currentSS.filter((_, idx) => idx !== ssIndex);
              setValue(`sections.${sIndex}.subSections`, nextSS, {
                shouldDirty: true,
              });
            }}
            className="p-1 rounded-lg hover:bg-red-50 text-dark-blue/30 hover:text-red-500 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </GhostButton>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: ssExpanded ? "1fr" : "0fr",
          transition:
            "grid-template-rows 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out",
          opacity: ssExpanded ? 1 : 0,
        }}
        className={clsx(!ssExpanded && "overflow-hidden")}
      >
        <div
          style={{ minHeight: 0 }}
          className={clsx(!ssExpanded && "overflow-hidden")}
        >
          <div className="p-4 space-y-4">
            <TextField
              label={isFaq ? "Question (FAQ Item Title)" : "Sub-Section Title"}
              placeholder={isFaq ? "e.g. Can regular users edit other users' posts?" : "e.g. Standard Model Features"}
              error={errors.sections?.[sIndex]?.subSections?.[ssIndex]?.title}
              {...register(`sections.${sIndex}.subSections.${ssIndex}.title`)}
            />

            <div className="space-y-2">
              <Suspense
                fallback={
                  <div className="h-28 bg-dark-blue/5 animate-pulse rounded-xl border border-gray" />
                }
              >
                <RichTextEditor
                  control={control}
                  name={`sections.${sIndex}.subSections.${ssIndex}.content`}
                  label={isFaq ? "Answer (FAQ Content)" : "Sub-Section Content"}
                  placeholder={isFaq ? "Provide the clear and comprehensive answer..." : "Sub-section content details..."}
                />
              </Suspense>
            </div>

            {!isFaq && (
              <div className="space-y-2">
                <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
                  Sub-Section Image (Optional)
                </label>
              {ssMedia ? (
                <div className="relative group w-full max-w-50 aspect-video rounded-xl overflow-hidden border border-gray shadow-sm">
                  <img
                    src={ssMedia.url}
                    alt="Sub-Section Image"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-dark-blue/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <GhostButton
                      type="button"
                      onClick={() => handleOpenMediaPicker(sIndex, ssIndex)}
                      className="bg-white text-dark-blue hover:bg-white/90 p-1.5 rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      Edit
                    </GhostButton>
                    <GhostButton
                      type="button"
                      onClick={() => handleClearMedia(sIndex, ssIndex)}
                      className="bg-red-500 text-white hover:bg-red-600 p-1.5 rounded-lg font-bold text-[10px] cursor-pointer"
                    >
                      Clear
                    </GhostButton>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenMediaPicker(sIndex, ssIndex)}
                  className="flex items-center gap-1.5 px-3 py-2 border border-dashed border-gray rounded-xl hover:bg-primary/5 hover:border-primary/20 text-[10px] font-bold text-dark-blue/60 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-primary" />
                  Add Image
                </button>
              )}
            </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubSectionCard;
