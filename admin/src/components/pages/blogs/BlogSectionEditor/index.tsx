import React, { useState, lazy, Suspense, useRef, useEffect } from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
  useFieldArray,
  Control,
} from "react-hook-form";
import { useSearchParams } from "react-router-dom";
import { Layers } from "lucide-react";
import { BlogFormValues, BlogSectionType } from "../schema";

import EmptySectionState from "./EmptySectionState";
import SectionAdderMenu from "./SectionAdderMenu";
import SectionCard from "./SectionCard";

const MediaPickerModal = lazy(() => import("@/components/modal/MediaPickerModal"));

interface BlogSectionEditorProps {
  control: Control<BlogFormValues>;
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  watch: UseFormWatch<BlogFormValues>;
  setValue: UseFormSetValue<BlogFormValues>;
}

const BlogSectionEditor: React.FC<BlogSectionEditorProps> = ({
  control,
  register,
  errors,
  watch,
  setValue,
}) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "sections",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const sectionParam = searchParams.get("section");

  const [activeMediaPicker, setActiveMediaPicker] = useState<{
    sectionIndex: number;
    subSectionIndex?: number;
  } | null>(null);

  const [activeSectionIndex, setActiveSectionIndex] = useState<number | null>(() => {
    if (sectionParam !== null) {
      const parsed = parseInt(sectionParam, 10);
      if (!isNaN(parsed) && parsed >= 0) return parsed;
    }
    return 0;
  });

  const hasInitializedRef = useRef(false);

  useEffect(() => {
    if (!hasInitializedRef.current && fields.length > 0) {
      hasInitializedRef.current = true;
      if (sectionParam !== null) {
        const parsed = parseInt(sectionParam, 10);
        if (!isNaN(parsed) && parsed >= 0 && parsed < fields.length) {
          setActiveSectionIndex(parsed);
          return;
        }
      }
      setActiveSectionIndex(0);
    }
  }, [fields.length, sectionParam]);

  const [activeSubSectionIndex, setActiveSubSectionIndex] = useState<
    Record<number, number | null>
  >({});

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [draggableIndex, setDraggableIndex] = useState<number | null>(null);

  const [openAddMenu, setOpenAddMenu] = useState<"top" | "bottom" | null>(null);

  const toggleSection = (index: number) => {
    const nextVal = activeSectionIndex === index ? null : index;
    setActiveSectionIndex(nextVal);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (nextVal === null) {
          next.delete("section");
        } else {
          next.set("section", nextVal.toString());
        }
        return next;
      },
      { replace: true }
    );
  };

  const toggleSubSection = (sectionIndex: number, index: number) => {
    setActiveSubSectionIndex((prev) => ({
      ...prev,
      [sectionIndex]: prev[sectionIndex] === index ? null : index,
    }));
  };

  const isSubSectionExpanded = (sectionIndex: number, index: number) =>
    activeSubSectionIndex[sectionIndex] === index;

  const handleOpenMediaPicker = (
    sectionIndex: number,
    subSectionIndex?: number,
  ) => {
    setActiveMediaPicker({ sectionIndex, subSectionIndex });
  };

  const handleMediaSelect = (media: Media) => {
    if (!activeMediaPicker) return;
    const { sectionIndex, subSectionIndex } = activeMediaPicker;

    if (subSectionIndex !== undefined) {
      setValue(
        `sections.${sectionIndex}.subSections.${subSectionIndex}.mediaId`,
        media.id,
        { shouldValidate: true, shouldDirty: true },
      );
      setValue(
        `sections.${sectionIndex}.subSections.${subSectionIndex}.media`,
        media,
        { shouldValidate: true, shouldDirty: true },
      );
    } else {
      setValue(`sections.${sectionIndex}.mediaId`, media.id, {
        shouldValidate: true,
        shouldDirty: true,
      });
      setValue(`sections.${sectionIndex}.media`, media, {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
    setActiveMediaPicker(null);
  };

  const handleClearMedia = (sectionIndex: number, subSectionIndex?: number) => {
    if (subSectionIndex !== undefined) {
      setValue(
        `sections.${sectionIndex}.subSections.${subSectionIndex}.mediaId`,
        null,
      );
      setValue(
        `sections.${sectionIndex}.subSections.${subSectionIndex}.media`,
        null,
      );
    } else {
      setValue(`sections.${sectionIndex}.mediaId`, null);
      setValue(`sections.${sectionIndex}.media`, null);
    }
  };

  const handleAddSection = (type: BlogSectionType) => {
    

    const nextIndex = fields.length;
    append({
      title: "",
      content: "",
      sectionType: type,
      displayOrder: fields.length,
      mediaId: null,
      media: null,
      ctaButtonText: type === BlogSectionType.CTA ? "Learn More" : "",
      ctaButtonUrl: type === BlogSectionType.CTA ? "" : "",
      subSections: [],
    });
    setActiveSectionIndex(nextIndex);
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("section", nextIndex.toString());
        return next;
      },
      { replace: true }
    );
  };

  const handleAddSubSection = (sectionIndex: number) => {
    const currentSS = watch(`sections.${sectionIndex}.subSections`) || [];
    const newIndex = currentSS.length;
    setValue(
      `sections.${sectionIndex}.subSections`,
      [
        ...currentSS,
        {
          title: "",
          content: "",
          displayOrder: newIndex,
          mediaId: null,
          media: null,
        },
      ],
      { shouldDirty: true },
    );
    setActiveSubSectionIndex((prev) => ({
      ...prev,
      [sectionIndex]: newIndex,
    }));
  };

  const removeSection = (sIndex: number) => {
    remove(sIndex);
    setActiveSectionIndex((prev) => {
      if (prev === sIndex) return null;
      if (prev !== null && prev > sIndex) return prev - 1;
      return prev;
    });
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        if (activeSectionIndex === sIndex) {
          next.delete("section");
        } else if (activeSectionIndex !== null && activeSectionIndex > sIndex) {
          next.set("section", (activeSectionIndex - 1).toString());
        }
        return next;
      },
      { replace: true }
    );
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    move(draggedIndex, targetIndex);

    if (activeSectionIndex === draggedIndex) {
      setActiveSectionIndex(targetIndex);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("section", targetIndex.toString());
          return next;
        },
        { replace: true }
      );
    } else if (
      activeSectionIndex !== null &&
      activeSectionIndex >= Math.min(draggedIndex, targetIndex) &&
      activeSectionIndex <= Math.max(draggedIndex, targetIndex)
    ) {
      const newActive = draggedIndex < targetIndex ? activeSectionIndex - 1 : activeSectionIndex + 1;
      setActiveSectionIndex(newActive);
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set("section", newActive.toString());
          return next;
        },
        { replace: true }
      );
    }

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
    setDraggableIndex(null);
  };

  return (
    <div className="space-y-8 my-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="h4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            Blog Sections Manager
          </h3>
          <p className="extra-small-paragraph text-dark-blue/40 mt-1">
            Build your blog layout dynamically with content, FAQ accordions, CTA cards, and summaries
          </p>
        </div>
      </div>

      {fields.length === 0 ? (
        <EmptySectionState
          isAddMenuOpen={openAddMenu === "bottom"}
          setIsAddMenuOpen={(open) => setOpenAddMenu(open ? "bottom" : null)}
          handleAddSection={handleAddSection}
        />
      ) : (
        <div className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, sIndex) => (
              <SectionCard
                key={field.id}
                fieldId={field.id}
                sIndex={sIndex}
                control={control}
                register={register}
                errors={errors}
                watch={watch}
                setValue={setValue}
                expanded={activeSectionIndex === sIndex}
                toggleSection={toggleSection}
                removeSection={removeSection}
                draggableIndex={draggableIndex}
                draggedIndex={draggedIndex}
                dragOverIndex={dragOverIndex}
                setDraggableIndex={setDraggableIndex}
                handleDragStart={handleDragStart}
                handleDragEnd={handleDragEnd}
                handleDragOver={handleDragOver}
                handleDrop={handleDrop}
                handleOpenMediaPicker={handleOpenMediaPicker}
                handleClearMedia={handleClearMedia}
                handleAddSubSection={handleAddSubSection}
                isSubSectionExpanded={isSubSectionExpanded}
                toggleSubSection={toggleSubSection}
              />
            ))}
          </div>

          <div className="relative flex flex-col items-center justify-center pt-8 border-t border-gray/40">
            <SectionAdderMenu
              isAddMenuOpen={openAddMenu === "bottom"}
              setIsAddMenuOpen={(open) => setOpenAddMenu(open ? "bottom" : null)}
              handleAddSection={handleAddSection}
              direction="up"
            />
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <MediaPickerModal
          isOpen={activeMediaPicker !== null}
          onClose={() => setActiveMediaPicker(null)}
          onSelect={(media) => handleMediaSelect(Array.isArray(media) ? media[0] : media)}
          title={
            activeMediaPicker?.subSectionIndex !== undefined
              ? "Select Sub-Section Image"
              : "Select Section Image"
          }
        />
      </Suspense>
    </div>
  );
};

export default BlogSectionEditor;
