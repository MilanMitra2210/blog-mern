import { useState, lazy, Suspense } from "react";
import { UseFormRegister, FieldValues, Path, FieldError } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { GhostButton } from "@/components/ui/Button";

const MediaPickerModal = lazy(() => import("@/components/modal/MediaPickerModal"));

interface MultiImagePickerProps<TFieldValues extends FieldValues = FieldValues> {
  label?: string;
  selectedMedias: Media[];
  onSelectMedias: (medias: Media[]) => void;
  onRemoveMedia: (mediaId: string) => void;
  register: UseFormRegister<TFieldValues>;
  name: Path<TFieldValues>;
  error?: FieldError;
  placeholderText?: string;
  modalTitle?: string;
}

const MultiImagePicker = <TFieldValues extends FieldValues = FieldValues>({
  label,
  selectedMedias = [],
  onSelectMedias,
  onRemoveMedia,
  register,
  name,
  error,
  placeholderText = "Add Images",
  modalTitle = "Select Images",
}: MultiImagePickerProps<TFieldValues>) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const handleMediaSelect = (medias: Media | Media[]) => {
    const selectedArray = Array.isArray(medias) ? medias : [medias];
    // Merge new selections while avoiding duplicates
    const existingIds = new Set(selectedMedias.map((m) => m.id));
    const newUnique = selectedArray.filter((m) => !existingIds.has(m.id));
    if (newUnique.length > 0) {
      onSelectMedias([...selectedMedias, ...newUnique]);
    }
    setIsMediaPickerOpen(false);
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="text-[11px] font-black uppercase tracking-widest text-dark-blue/40 ml-1 block mb-1">
          {label}
        </label>
      )}

      <div className="flex flex-wrap gap-3">
        <AnimatePresence>
          {selectedMedias.map((media) => (
            <motion.div
              key={media.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative group w-20 h-20 rounded-2xl border border-gray overflow-hidden bg-white shadow-sm shrink-0"
            >
              <img
                src={media.url}
                alt={media.name || "Gallery image"}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-dark-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <GhostButton
                  type="button"
                  onClick={() => onRemoveMedia(media.id)}
                  className="bg-red-500 text-white hover:bg-red-600 p-1.5 rounded-lg cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </GhostButton>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <button
          type="button"
          onClick={() => setIsMediaPickerOpen(true)}
          className={clsx(
            "w-20 h-20 flex flex-col items-center justify-center gap-1.5 border-2 border-dashed rounded-2xl transition-all group shrink-0 cursor-pointer",
            error
              ? "border-red-500/60 bg-red-500/5 hover:bg-red-500/5"
              : "border-gray bg-gray/5 hover:bg-primary/5 hover:border-primary/20"
          )}
        >
          <Plus className="w-5 h-5 text-primary/60 group-hover:text-primary transition-transform group-hover:scale-110" />
          <span className="text-[9px] font-extrabold text-dark-blue/50 group-hover:text-dark-blue leading-none">
            {placeholderText}
          </span>
        </button>
      </div>

      <input type="hidden" {...register(name)} />

      {isMediaPickerOpen && (
        <Suspense fallback={null}>
          <MediaPickerModal
            isOpen={isMediaPickerOpen}
            onClose={() => setIsMediaPickerOpen(false)}
            onSelect={handleMediaSelect}
            title={modalTitle}
            allowMultiple
          />
        </Suspense>
      )}
    </div>
  );
};

export default MultiImagePicker;
