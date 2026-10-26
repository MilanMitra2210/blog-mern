import { useState, lazy, Suspense } from "react";
import { UseFormRegister, FieldValues, Path, FieldError } from "react-hook-form";
import { PlusCircle, RefreshCw, X, Camera, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { GhostButton } from "@/components/ui/Button";

const MediaPickerModal = lazy(() => import("@/components/modal/MediaPickerModal"));

interface ImagePickerFieldProps<TFieldValues extends FieldValues = FieldValues> {
  label?: string;
  selectedMedia: Media | null;
  onSelectMedia: (media: Media) => void;
  onClearMedia: () => void;
  register: UseFormRegister<TFieldValues>;
  name: Path<TFieldValues>;
  error?: FieldError;
  aspectRatio?: "video" | "banner" | "seo" | "square";
  recommendedSize?: string;
  placeholderText?: string;
  modalTitle?: string;
  allowedMimeTypes?: string[];
}

const ImagePickerField = <TFieldValues extends FieldValues = FieldValues>({
  label,
  selectedMedia,
  onSelectMedia,
  onClearMedia,
  register,
  name,
  error,
  aspectRatio = "video",
  recommendedSize,
  placeholderText = "Select Image",
  modalTitle = "Select Image",
  allowedMimeTypes,
}: ImagePickerFieldProps<TFieldValues>) => {
  const [isMediaPickerOpen, setIsMediaPickerOpen] = useState(false);

  const aspectClass = {
    video: "aspect-video max-w-md rounded-2xl",
    banner: "aspect-21/9 max-w-xl rounded-2xl",
    seo: "aspect-1200/630 max-w-md rounded-2xl",
    square: "aspect-square max-w-sm rounded-2xl",
  }[aspectRatio];

  const iconForAspect = aspectRatio === "banner" ? Camera : PlusCircle;
  const IconComponent = iconForAspect;

  return (
    <div className="space-y-4">
      {label && (
        <label className="text-[11px] font-black uppercase tracking-widest text-dark-blue/40 ml-1 block mb-1">
          {label}
        </label>
      )}

      {selectedMedia ? (
        <div className={clsx(
          "relative group w-full overflow-hidden border shadow-2xl shadow-primary/5 bg-gray/5 flex items-center justify-center",
          aspectClass,
          error ? "border-red-500" : "border-gray"
        )}>
          {selectedMedia.mimeType?.startsWith("image/") ? (
            <img
              src={selectedMedia.url}
              alt="Preview"
              className={clsx(
                "w-full h-full transition-transform duration-500 group-hover:scale-105",
                aspectRatio === "banner" ? "object-cover" : "object-contain"
              )}
            />
          ) : selectedMedia.mimeType?.startsWith("video/") || selectedMedia.name?.toLowerCase().endsWith(".mp4") || selectedMedia.url?.toLowerCase().endsWith(".mp4") ? (
            <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
              <video
                src={selectedMedia.url}
                className="w-full h-full object-cover pointer-events-none"
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                Video
              </div>
            </div>
          ) : selectedMedia.mimeType?.endsWith("/pdf") || selectedMedia.mimeType === "application/pdf" || selectedMedia.name?.toLowerCase().endsWith(".pdf") || selectedMedia.url?.toLowerCase().endsWith(".pdf") ? (
            <div className="w-full h-full relative overflow-hidden bg-white">
              <iframe
                src={`${selectedMedia.url}#toolbar=0&navpanes=0&scrollbar=0`}
                scrolling="no"
                className="absolute top-0 left-0 w-[calc(100%+24px)] h-[calc(100%+24px)] border-none pointer-events-none select-none overflow-hidden"
                style={{ overflow: "hidden" }}
                title="PDF Preview"
              />
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs">
                PDF
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gray/20 text-dark-blue/80 gap-2 p-6">
              <FileText className="w-10 h-10 text-dark-blue/30" />
              <span className="text-[10px] font-black tracking-widest uppercase text-dark-blue/30">Catalog File</span>
              <span className="text-xs font-bold truncate max-w-full mt-2">{selectedMedia.name}</span>
            </div>
          )}
          <div className="absolute inset-0 bg-dark-blue/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
            <GhostButton
              type="button"
              onClick={() => setIsMediaPickerOpen(true)}
              className="bg-white text-dark-blue hover:bg-white/90 px-6 h-10 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Replace
            </GhostButton>
            <GhostButton
              type="button"
              onClick={onClearMedia}
              className="bg-red-500 text-white hover:bg-red-600 px-6 h-10 rounded-xl font-bold text-xs cursor-pointer flex items-center gap-1.5"
            >
              <X className="w-3.5 h-3.5" />
              Remove
            </GhostButton>
          </div>
          {selectedMedia.mimeType?.startsWith("image/") && (
            <div className="absolute bottom-4 left-6 right-6">
              <p className="text-[10px] font-black text-white uppercase tracking-widest drop-shadow-md truncate">
                {selectedMedia.name}
              </p>
            </div>
          )}
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setIsMediaPickerOpen(true)}
          className={clsx(
            "w-full flex flex-col items-center justify-center gap-6 border-2 border-dashed transition-all group mt-2",
            aspectClass,
            error
              ? "border-red-500/60 bg-red-500/5 hover:bg-red-500/5"
              : "border-gray bg-gray/5 hover:bg-primary/5 hover:border-primary/20"
          )}
        >
          <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
            <IconComponent className={clsx(
              "w-8 h-8 transition-colors",
              error ? "text-red-500/60 group-hover:text-red-500" : "text-primary/40 group-hover:text-primary"
            )} />
          </div>
          <div className="text-center px-4">
            <p className={clsx(
              "text-sm font-bold",
              error ? "text-red-500/80" : "text-dark-blue/80"
            )}>
              {placeholderText}
            </p>
            {recommendedSize && (
              <p className="extra-small-paragraph text-dark-blue/30 uppercase tracking-widest mt-1">
                {recommendedSize}
              </p>
            )}
          </div>
        </button>
      )}

      <input type="hidden" {...register(name)} />

      <AnimatePresence mode="wait">
        {error && (
          <motion.p
            initial={{ opacity: 0, height: 0, y: -5 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -5 }}
            className="text-red-500 extra-small-paragraph ml-1 overflow-hidden"
          >
            {error.message}
          </motion.p>
        )}
      </AnimatePresence>

      <Suspense fallback={null}>
        <MediaPickerModal
          isOpen={isMediaPickerOpen}
          onClose={() => setIsMediaPickerOpen(false)}
          onSelect={(media) => {
            onSelectMedia(Array.isArray(media) ? media[0] : media);
            setIsMediaPickerOpen(false);
          }}
          title={modalTitle}
          allowedMimeTypes={allowedMimeTypes}
        />
      </Suspense>
    </div>
  );
};

export default ImagePickerField;
