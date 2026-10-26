import React, { lazy, Suspense } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  Control,
} from "react-hook-form";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  GripVertical,
  Image as ImageIcon,
  PlusCircle,
  HelpCircle,
} from "lucide-react";
import clsx from "clsx";
import TextField from "@/components/ui/Form/TextField";
import { GhostButton } from "@/components/ui/Button";
import { BlogFormValues, BlogSectionType } from "../schema";
import SubSectionCard from "./SubSectionCard";

const RichTextEditor = lazy(() => import("@/components/ui/Form/RichTextEditor"));

interface SectionCardProps {
  sIndex: number;
  fieldId: string;
  control: Control<BlogFormValues>;
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  watch: UseFormWatch<BlogFormValues>;
  setValue: UseFormSetValue<BlogFormValues>;
  expanded: boolean;
  toggleSection: (index: number) => void;
  removeSection: (index: number) => void;
  draggableIndex: number | null;
  draggedIndex: number | null;
  dragOverIndex: number | null;
  setDraggableIndex: (index: number | null) => void;
  handleDragStart: (e: React.DragEvent, index: number) => void;
  handleDragEnd: () => void;
  handleDragOver: (e: React.DragEvent, index: number) => void;
  handleDrop: (e: React.DragEvent, index: number) => void;
  handleOpenMediaPicker: (sIndex: number, ssIndex?: number) => void;
  handleClearMedia: (sIndex: number, ssIndex?: number) => void;
  handleAddSubSection: (sIndex: number) => void;
  isSubSectionExpanded: (sIndex: number, ssIndex: number) => boolean;
  toggleSubSection: (sIndex: number, ssIndex: number) => void;
}

const SectionCard: React.FC<SectionCardProps> = ({
  sIndex,
  fieldId,
  control,
  register,
  errors,
  watch,
  setValue,
  expanded,
  toggleSection,
  removeSection,
  draggableIndex,
  draggedIndex,
  dragOverIndex,
  setDraggableIndex,
  handleDragStart,
  handleDragEnd,
  handleDragOver,
  handleDrop,
  handleOpenMediaPicker,
  handleClearMedia,
  handleAddSubSection,
  isSubSectionExpanded,
  toggleSubSection,
}) => {
  const sectionType = watch(`sections.${sIndex}.sectionType`);
  const sTitle =
    watch(`sections.${sIndex}.title`) || `Untitled Section ${sIndex + 1}`;
  const sMedia = watch(`sections.${sIndex}.media`) as Media | null;
  const subSections = watch(`sections.${sIndex}.subSections`) || [];

  return (
    <div
      key={fieldId}
      draggable={draggableIndex === sIndex}
      onDragStart={(e) => handleDragStart(e, sIndex)}
      onDragEnd={handleDragEnd}
      onDragOver={(e) => handleDragOver(e, sIndex)}
      onDrop={(e) => handleDrop(e, sIndex)}
      className={clsx(
        "relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-all duration-300 group/section",
        draggedIndex === sIndex
          ? "opacity-35 scale-[0.98] border-dashed border-primary"
          : "border-gray",
        dragOverIndex === sIndex &&
          "border-primary ring-4 ring-primary/10 scale-[1.01]"
      )}
    >
      <div
        onClick={() => toggleSection(sIndex)}
        role="button"
        tabIndex={0}
        aria-expanded={expanded}
        aria-label={`Toggle section ${sIndex + 1}: ${sTitle}`}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            toggleSection(sIndex);
          }
        }}
        className={clsx(
          "sticky top-0 z-20 flex items-center justify-between px-3 py-3 bg-light-blue/75 backdrop-blur-md border-b border-gray cursor-pointer select-none shadow-sm/5 transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset",
          expanded ? "rounded-t-[14px]" : "rounded-[14px]"
        )}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            onMouseDown={() => setDraggableIndex(sIndex)}
            onMouseUp={() => setDraggableIndex(null)}
            onClick={(e) => e.stopPropagation()}
            className="p-1.5 text-dark-blue/25 hover:text-dark-blue/60 hover:bg-dark-blue/5 rounded-xl transition-colors cursor-grab active:cursor-grabbing shrink-0"
          >
            <GripVertical className="w-4 h-4" />
          </button>

          <div className="flex-1 flex items-center gap-3 py-1.5 min-w-0">
            <span className="w-6 h-6 rounded-lg bg-dark-blue/5 border border-gray flex items-center justify-center text-xs font-black text-dark-blue/40 shrink-0">
              {sIndex + 1}
            </span>
            <div className="flex flex-col sm:flex-row sm:items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
              <span
                className={clsx(
                  "inline-flex items-center px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider shrink-0 w-fit",
                  sectionType === BlogSectionType.FAQ
                    ? "bg-teal-500/10 text-teal-600 border border-teal-500/20"
                    : sectionType === BlogSectionType.CTA
                      ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                      : sectionType === BlogSectionType.SUMMARY
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : sectionType === BlogSectionType.MEDIA
                          ? "bg-sky-500/10 text-sky-600 border border-sky-500/20"
                          : sectionType === BlogSectionType.EMBED
                            ? "bg-violet-500/10 text-violet-600 border border-violet-500/20"
                            : sectionType === BlogSectionType.CODE
                              ? "bg-orange-500/10 text-orange-600 border border-orange-500/20"
                              : sectionType === BlogSectionType.QUOTE
                                ? "bg-pink-500/10 text-pink-600 border border-pink-500/20"
                                  : "bg-primary/10 text-primary border border-primary/20"
                )}
              >
                {sectionType === BlogSectionType.FAQ
                  ? "FAQ Accordion"
                  : sectionType === BlogSectionType.CTA
                    ? "CTA Card"
                    : sectionType === BlogSectionType.SUMMARY
                      ? "Summary"
                      : sectionType === BlogSectionType.MEDIA
                        ? "Media Gallery"
                        : sectionType === BlogSectionType.EMBED
                          ? "Video Embed"
                          : sectionType === BlogSectionType.CODE
                            ? "Code Block"
                            : sectionType === BlogSectionType.QUOTE
                              ? "Quote"
                              : "Content"}
              </span>
              <p className="text-xs font-black text-dark-blue uppercase tracking-wider leading-none truncate max-w-37.5 sm:max-w-md">
                {sTitle}
              </p>
            </div>
            {expanded ? (
              <ChevronUp className="w-4 h-4 text-dark-blue/30 shrink-0" />
            ) : (
              <ChevronDown className="w-4 h-4 text-dark-blue/30 shrink-0" />
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-60 group-hover/section:opacity-100 transition-opacity shrink-0">
          <GhostButton
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              removeSection(sIndex);
            }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-dark-blue/40 hover:text-red-500 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </GhostButton>
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateRows: expanded ? "1fr" : "0fr",
          transition:
            "grid-template-rows 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease-out",
          opacity: expanded ? 1 : 0,
        }}
        className={clsx(!expanded && "overflow-hidden")}
      >
        <div
          style={{ minHeight: 0 }}
          className={clsx(!expanded && "overflow-hidden")}
        >
          <div className="p-6 space-y-6">
            <TextField
              label="Section Title (Optional)"
              placeholder="e.g. Overview of New Products"
              error={errors.sections?.[sIndex]?.title}
              {...register(`sections.${sIndex}.title`)}
            />

            {(sectionType === BlogSectionType.CONTENT || sectionType === BlogSectionType.SUMMARY) && (
              <div className="space-y-4">
                <Suspense
                  fallback={
                    <div className="h-40 bg-dark-blue/5 animate-pulse rounded-xl border border-gray" />
                  }
                >
                  <RichTextEditor
                    control={control}
                    name={`sections.${sIndex}.content`}
                    label="Section Content"
                    placeholder="Type standard content paragraph..."
                  />
                </Suspense>
              </div>
            )}

            {/* ── Media Section ─────────────────────────────────────── */}
            {sectionType === BlogSectionType.MEDIA && (
              <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10 space-y-3">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Media Gallery Block</p>
                <p className="text-xs text-dark-blue/50">
                  This section contains an image gallery imported from DOCX.
                  Use the media picker below to assign a preview image.
                </p>
              </div>
            )}

            {/* ── Embed Section ─────────────────────────────────────── */}
            {sectionType === BlogSectionType.EMBED && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-violet-500/5 rounded-xl border border-violet-500/10">
                <div className="md:col-span-2">
                  <p className="text-[10px] font-black text-violet-600 uppercase tracking-widest mb-3">Video / Embed Block</p>
                  <TextField
                    label="Embed URL"
                    placeholder="e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                    error={errors.sections?.[sIndex]?.embedUrl}
                    {...register(`sections.${sIndex}.embedUrl`)}
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-dark-blue/50 uppercase tracking-widest">Embed Provider</label>
                  <select
                    {...register(`sections.${sIndex}.embedProvider`)}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-dark-blue/70"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="vimeo">Vimeo</option>
                    <option value="spotify">Spotify</option>
                    <option value="codepen">CodePen</option>
                    <option value="custom">Custom Embed</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  {(() => {
                    const url = watch(`sections.${sIndex}.embedUrl`) || "";
                    const getYouTubeId = (urlStr: string) => {
                      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
                      const match = urlStr.match(regExp);
                      return (match && match[2].length === 11) ? match[2] : null;
                    };
                    const ytid = getYouTubeId(url);
                    return ytid ? (
                      <div className="aspect-video rounded-xl overflow-hidden border border-gray shadow-sm">
                        <iframe
                          src={`https://www.youtube.com/embed/${ytid}`}
                          className="w-full h-full border-none"
                          allowFullScreen
                          title="YouTube Video Preview"
                        />
                      </div>
                    ) : null;
                  })()}
                </div>
              </div>
            )}

            {/* ── Code Block Section ────────────────────────────────── */}
            {sectionType === BlogSectionType.CODE && (
              <div className="p-5 bg-orange-500/5 rounded-xl border border-orange-500/10 space-y-4">
                <p className="text-[10px] font-black text-orange-600 uppercase tracking-widest">Code Block</p>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-dark-blue/50 uppercase tracking-widest">Programming Language</label>
                  <select
                    {...register(`sections.${sIndex}.codeLanguage`)}
                    className="w-full pl-4 pr-10 py-2.5 bg-white border border-gray rounded-xl text-xs appearance-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-bold text-dark-blue/70"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="java">Java</option>
                    <option value="python">Python</option>
                    <option value="html">HTML</option>
                    <option value="css">CSS</option>
                    <option value="bash">Bash / Shell</option>
                    <option value="rust">Rust</option>
                    <option value="go">Go</option>
                  </select>
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-dark-blue/50 uppercase tracking-widest">Code Block Content</label>
                  <textarea
                    placeholder="Paste or write code here..."
                    rows={6}
                    {...register(`sections.${sIndex}.codeBlock`)}
                    className="w-full p-4 bg-dark-blue/5 border border-gray rounded-xl font-mono text-xs text-dark-blue focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            )}

            {/* ── Quote Section ─────────────────────────────────────── */}
            {sectionType === BlogSectionType.QUOTE && (
              <div className="p-5 bg-pink-500/5 rounded-xl border border-pink-500/10 space-y-4">
                <p className="text-[10px] font-black text-pink-600 uppercase tracking-widest">Quote Block</p>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black text-dark-blue/50 uppercase tracking-widest">Quote Text</label>
                  <textarea
                    placeholder="Enter the quote text..."
                    rows={3}
                    {...register(`sections.${sIndex}.content.text` as any)}
                    className="w-full p-4 bg-white border border-gray rounded-xl text-xs text-dark-blue focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-medium italic"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <TextField
                    label="Quote Author"
                    placeholder="e.g. Albert Einstein"
                    {...register(`sections.${sIndex}.content.author` as any)}
                  />
                  <TextField
                    label="Author Designation / Source (Optional)"
                    placeholder="e.g. Theoretical Physicist"
                    {...register(`sections.${sIndex}.content.designation` as any)}
                  />
                </div>
              </div>
            )}

            {/* ── Media Gallery Block ───────────────────────────────── */}
            {sectionType === BlogSectionType.MEDIA && (
              <div className="p-5 bg-sky-500/5 rounded-xl border border-sky-500/10 space-y-4">
                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Media Gallery Grid</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {subSections.map((_: any, ssIndex: number) => {
                    const ssMedia = watch(`sections.${sIndex}.subSections.${ssIndex}.media`) as any;
                    return (
                      <div key={ssIndex} className="relative aspect-video rounded-xl border border-gray overflow-hidden group shadow-sm bg-gray/5 flex flex-col items-center justify-center p-2">
                        {ssMedia ? (
                          <>
                            <img src={ssMedia.url} className="w-full h-full object-cover rounded-lg" alt="Gallery item" />
                            <div className="absolute inset-0 bg-dark-blue/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 transition-opacity">
                              <GhostButton
                                type="button"
                                onClick={() => handleOpenMediaPicker(sIndex, ssIndex)}
                                className="bg-white text-dark-blue hover:bg-white/90 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Change
                              </GhostButton>
                              <GhostButton
                                type="button"
                                onClick={() => {
                                  const currentSS = watch(`sections.${sIndex}.subSections`) || [];
                                  const updated = currentSS.filter((_, idx) => idx !== ssIndex);
                                  setValue(`sections.${sIndex}.subSections`, updated, { shouldDirty: true });
                                }}
                                className="bg-red-500 text-white hover:bg-red-600 p-1.5 rounded-lg text-[10px] font-bold cursor-pointer"
                              >
                                Remove
                              </GhostButton>
                            </div>
                          </>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleOpenMediaPicker(sIndex, ssIndex)}
                            className="flex flex-col items-center justify-center gap-1.5 text-dark-blue/40 hover:text-primary transition-colors text-[10px] font-bold h-full w-full"
                          >
                            <ImageIcon className="w-5 h-5 text-dark-blue/30" />
                            Select Image
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center pt-2">
                  <GhostButton
                    type="button"
                    onClick={() => handleAddSubSection(sIndex)}
                    className="flex items-center gap-1.5 text-xs font-black uppercase text-sky-600 hover:bg-sky-50 px-4 py-2.5 rounded-xl cursor-pointer border border-sky-500/20 hover:border-sky-500/45 transition-all shadow-sm bg-sky-500/5"
                  >
                    <PlusCircle className="w-4 h-4 text-sky-600" />
                    Add Image to Gallery
                  </GhostButton>
                </div>
              </div>
            )}

            {sectionType === BlogSectionType.CTA && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-amber-500/5 rounded-xl border border-amber-500/10">
                <div className="space-y-4 md:col-span-2">
                  <Suspense
                    fallback={
                      <div className="h-40 bg-dark-blue/5 animate-pulse rounded-xl border border-gray" />
                    }
                  >
                    <RichTextEditor
                      control={control}
                      name={`sections.${sIndex}.content`}
                      label="CTA Headline & Content"
                      placeholder="Why readers should act now..."
                    />
                  </Suspense>
                </div>
                <TextField
                  label="CTA Button Text"
                  placeholder="e.g. Schedule Call"
                  error={errors.sections?.[sIndex]?.ctaButtonText}
                  {...register(`sections.${sIndex}.ctaButtonText`)}
                />
                <TextField
                  label="CTA Button Link"
                  placeholder="e.g. https://example.com/demo"
                  error={errors.sections?.[sIndex]?.ctaButtonUrl}
                  {...register(`sections.${sIndex}.ctaButtonUrl`)}
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
                {sectionType === BlogSectionType.MEDIA ? "Gallery Cover Image" : "Section Media (Optional Image/Video)"}
              </label>
              {sMedia ? (
                <div className="relative group w-full max-w-sm aspect-video rounded-xl overflow-hidden border border-gray shadow-sm">
                  {sMedia.url?.toLowerCase().endsWith(".mp4") || sMedia.url?.toLowerCase().endsWith(".webm") || sMedia.url?.toLowerCase().endsWith(".mov") ? (
                    <video
                      src={sMedia.url}
                      controls
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={sMedia.url}
                      alt="Section Media"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-dark-blue/40 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition-opacity">
                    <GhostButton
                      type="button"
                      onClick={() => handleOpenMediaPicker(sIndex)}
                      className="bg-white text-dark-blue hover:bg-white/90 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Change Media
                    </GhostButton>
                    <GhostButton
                      type="button"
                      onClick={() => handleClearMedia(sIndex)}
                      className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-xl font-bold text-xs cursor-pointer"
                    >
                      Remove
                    </GhostButton>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => handleOpenMediaPicker(sIndex)}
                  className="flex items-center gap-2 px-4 py-3 border border-dashed border-gray rounded-xl hover:bg-primary/5 hover:border-primary/20 text-xs font-bold text-dark-blue/60 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-4 h-4 text-primary" />
                  Select Media File
                </button>
              )}
            </div>

            {(sectionType === BlogSectionType.CONTENT || sectionType === BlogSectionType.FAQ) && (
              <div className="pt-6 border-t border-gray/50 space-y-4">
                {sectionType === BlogSectionType.FAQ && (
                  <div className="p-4 rounded-xl bg-teal-500/5 border border-teal-500/20 flex items-start gap-3">
                    <div className="w-7 h-7 rounded-lg bg-teal-500/10 text-teal-600 flex items-center justify-center shrink-0 mt-0.5">
                      <HelpCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-teal-700 uppercase tracking-wider">Interactive FAQ Accordion & SEO Schema</h4>
                      <p className="text-xs text-dark-blue/70 mt-0.5">
                        Each Question & Answer pair below will render as an interactive expandable accordion on your blog post and generate Google-compliant FAQPage JSON-LD schema for rich search results.
                      </p>
                    </div>
                  </div>
                )}

                <p className="text-[10px] font-black text-dark-blue/40 uppercase tracking-widest select-none">
                  {sectionType === BlogSectionType.FAQ ? "FAQ Questions & Answers (Q&A Items for JSON-LD)" : "Sub-Sections"}
                </p>

                {subSections.length > 0 && (
                  <div className="space-y-3 pl-4 border-l-2 border-primary/10 overflow-visible">
                    {subSections.map((_, ssIndex) => (
                      <SubSectionCard
                        key={ssIndex}
                        sIndex={sIndex}
                        ssIndex={ssIndex}
                        control={control}
                        register={register}
                        errors={errors}
                        watch={watch}
                        setValue={setValue}
                        ssExpanded={isSubSectionExpanded(sIndex, ssIndex)}
                        toggleSubSection={toggleSubSection}
                        handleOpenMediaPicker={handleOpenMediaPicker}
                        handleClearMedia={handleClearMedia}
                        isFaq={sectionType === BlogSectionType.FAQ}
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-center pt-2">
                  <GhostButton
                    type="button"
                    onClick={() => handleAddSubSection(sIndex)}
                    className="flex items-center gap-1.5 text-xs font-black uppercase text-primary hover:bg-primary/5 px-4 py-2.5 rounded-xl cursor-pointer border border-primary/20 hover:border-primary/45 transition-all shadow-sm"
                  >
                    <PlusCircle className="w-4 h-4 text-primary" />
                    {sectionType === BlogSectionType.FAQ ? "Add Question & Answer Item" : "Add Sub-Section Block"}
                  </GhostButton>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionCard;
