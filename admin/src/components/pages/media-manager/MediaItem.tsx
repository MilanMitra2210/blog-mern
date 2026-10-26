import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Folder as FolderIcon,
  File as FileIcon,
  Trash2,
  Copy,
  Check,
  X,
  Edit3,
} from "lucide-react";
import clsx from "clsx";
import { GhostButton } from "@/components/ui/Button";

interface MediaItemProps {
  type: "file" | "folder";
  item: Media | Folder;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  onClick: () => void;
  onDelete: () => void;
  onOpenDetail?: () => void;
  canWrite?: boolean;
}

const MediaItem: React.FC<MediaItemProps> = ({
  type,
  item,
  isSelected,
  onSelect,
  onClick,
  onDelete,
  onOpenDetail,
  canWrite = true,
}) => {
  const [copied, setCopied] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (type === "file") {
      navigator.clipboard.writeText((item as Media).url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setDeleteConfirm(false);
  };

  const toggleDeleteConfirm = (e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteConfirm(!deleteConfirm);
  };

  if (type === "folder") {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        whileHover={{ y: -5 }}
        className="group relative"
      >
        <div
          onClick={onClick}
          className="aspect-square bg-white dark:bg-white/5 border border-gray rounded-xl flex flex-col items-center justify-center gap-4 cursor-pointer transition-all duration-500 hover:shadow-2xl hover:shadow-primary/10 hover:border-primary/20"
        >
          <div className="relative">
            <div className="w-20 h-20 bg-primary/5 rounded-4xl flex items-center justify-center group-hover:bg-primary/10 transition-colors duration-500">
              <FolderIcon className="w-10 h-10 text-primary group-hover:scale-110 transition-transform duration-500" />
            </div>
            <div className="absolute -bottom-2 inset-x-4 h-4 bg-primary/5 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>

          <div className="text-center px-6">
            <p className="small-paragraph font-black text-dark-blue truncate max-w-37.5 uppercase tracking-wider">
              {item.name}
            </p>
            <p className="text-[9px] font-bold text-dark-blue/20 uppercase tracking-[0.2em] mt-1">
              Collection
            </p>
          </div>
        </div>

        {canWrite && (
          <div className="absolute top-4 right-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
            {deleteConfirm ? (
              <div
                className="flex items-center gap-1 bg-white p-1 rounded-2xl shadow-2xl border border-gray"
                onClick={(e) => e.stopPropagation()}
              >
                <GhostButton
                  onClick={handleDelete}
                  className="p-2 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Check className="w-4 h-4" />
                </GhostButton>
                <GhostButton
                  onClick={toggleDeleteConfirm}
                  className="p-2 rounded-xl hover:bg-gray text-dark-blue/30 transition-all"
                >
                  <X className="w-4 h-4" />
                </GhostButton>
              </div>
            ) : (
              <GhostButton
                onClick={toggleDeleteConfirm}
                className="p-2.5 bg-white/90 backdrop-blur-md text-red-500 rounded-xl hover:bg-red-500 hover:text-white shadow-lg border border-red-500/10 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </GhostButton>
            )}
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <div
        className={clsx(
          "aspect-square bg-white dark:bg-white/5 border rounded-4xl overflow-hidden flex flex-col transition-all duration-500 relative",
          isSelected
            ? "border-primary shadow-2xl shadow-primary/20 scale-[0.98]"
            : "border-gray hover:border-primary/30 hover:shadow-2xl",
        )}
      >
        {canWrite && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              onSelect?.(!isSelected);
            }}
            className={clsx(
              "absolute top-5 left-5 z-30 w-7 h-7 rounded-4xl border-2 transition-all cursor-pointer flex items-center justify-center shadow-sm",
              isSelected
                ? "bg-primary border-primary scale-110"
                : "bg-white/40 backdrop-blur-md border-white/60 group-hover:border-primary/40 opacity-0 group-hover:opacity-100",
            )}
          >
            <Check
              className={clsx(
                "w-4.5 h-4.5 text-white transition-transform",
                isSelected ? "scale-100" : "scale-0",
              )}
            />
          </div>
        )}

        <div
          onClick={onOpenDetail}
          className="w-full h-full relative cursor-pointer group/content"
        >
          {type === "file" && (item as Media).mimeType?.startsWith("image/") ? (
            <img
              src={(item as Media).url}
              alt={(item as Media).altText || (item as Media).name}
              className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110"
            />
          ) : type === "file" && ((item as Media).mimeType?.startsWith("video/") || (item as Media).name?.toLowerCase().endsWith(".mp4") || (item as Media).url?.toLowerCase().endsWith(".mp4")) ? (
            <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
              <video
                src={(item as Media).url}
                className="w-full h-full object-cover pointer-events-none"
                muted
                playsInline
              />
              <div className="absolute inset-0 bg-black/10 pointer-events-none" />
              <div className="absolute top-2 left-2 bg-primary text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs z-10">
                Video
              </div>
            </div>
          ) : type === "file" && ((item as Media).mimeType?.endsWith("/pdf") || (item as Media).mimeType === "application/pdf" || (item as Media).name?.toLowerCase().endsWith(".pdf") || (item as Media).url?.toLowerCase().endsWith(".pdf")) ? (
            <div className="w-full h-full relative overflow-hidden bg-white">
              <iframe
                src={`${(item as Media).url}#toolbar=0&navpanes=0&scrollbar=0`}
                scrolling="no"
                className="absolute top-0 left-0 w-[calc(100%+24px)] h-[calc(100%+24px)] border-none pointer-events-none select-none overflow-hidden"
                style={{ overflow: "hidden" }}
                title="PDF Preview"
              />
              <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
              <div className="absolute top-2 left-2 bg-red-500 text-white text-[8px] font-black uppercase px-2 py-0.5 rounded-md shadow-xs z-10">
                PDF
              </div>
            </div>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-light-blue/20 p-4">
              <div className="w-16 h-16 bg-white dark:bg-white/10 rounded-3xl flex items-center justify-center shadow-sm">
                <FileIcon className="w-8 h-8 text-dark-blue/20" />
              </div>
              <p className="text-[10px] font-black text-dark-blue/20 mt-4 uppercase tracking-[0.2em]">
                {type === "file" ? (item as Media).mimeType?.split("/")[1] || "FILE" : "FOLDER"}
              </p>
            </div>
          )}

          <div className="absolute inset-0 bg-linear-to-t from-dark-blue/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

          <div className="absolute inset-x-0 bottom-0 p-6 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
            <p
              className="extra-small-paragraph font-black text-white truncate leading-none mb-1"
              title={item.name}
            >
              {item.name}
            </p>
            <p className="text-[9px] font-bold text-white/50 uppercase tracking-widest">
              {type === "file" ? (
                <>
                  {((item as Media).size / 1024).toFixed(1)} KB •{" "}
                  {(item as Media).mimeType?.split("/")[1] || "ASSET"}
                </>
              ) : (
                "COLLECTION"
              )}
            </p>
          </div>

          <div className="absolute top-5 right-5 z-30 flex flex-col gap-2 opacity-0 group-hover:opacity-100 translate-x-4 group-hover:translate-x-0 transition-all duration-500">
            <ActionCircle
              icon={copied ? <Check /> : <Copy />}
              onClick={handleCopy}
              className={
                copied
                  ? "bg-green text-white"
                  : "bg-white/90 backdrop-blur-md text-dark-blue/60 hover:text-primary"
              }
            />
            <ActionCircle
              icon={<Edit3 />}
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail?.();
              }}
              className="bg-white/90 backdrop-blur-md text-dark-blue/60 hover:text-primary"
            />
            {canWrite && (
              <ActionCircle
                icon={<Trash2 />}
                onClick={toggleDeleteConfirm}
                className="bg-white/90 backdrop-blur-md text-red-500 hover:bg-red-500 hover:text-white"
              />
            )}
          </div>
        </div>

        <AnimatePresence>
          {deleteConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-red-500/80 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", damping: 12 }}
                className="mb-4 w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30"
              >
                <Trash2 className="w-6 h-6 text-white" />
              </motion.div>
              
              <motion.p 
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-[10px] font-black text-white uppercase tracking-[0.2em] mb-6"
              >
                Confirm Delete?
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="flex items-center gap-2 w-full max-w-40"
              >
                <GhostButton
                  onClick={handleDelete}
                  paddingClassName="p-0"
                  className="flex-1 h-11 bg-white text-red-500 hover:bg-white hover:text-red-600 shadow-2xl transition-transform"
                >
                  <Check className="w-5 h-5" />
                </GhostButton>
                <GhostButton
                  onClick={toggleDeleteConfirm}
                  paddingClassName="p-0"
                  className="flex-1 h-11 bg-white/10 text-white border border-white/20 hover:bg-white/20 transition-transform"
                >
                  <X className="w-5 h-5" />
                </GhostButton>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

function ActionCircle({
  icon,
  onClick,
  className,
}: {
  icon: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  className?: string;
}) {
  return (
    <GhostButton
      onClick={onClick}
      paddingClassName=""
      className={clsx(
        "w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all active:scale-95",
        className,
      )}
    >
      {React.isValidElement(icon) ? React.cloneElement(icon as React.ReactElement<{ size?: number }>, { size: 20 }) : icon}
    </GhostButton>
  );
}

export default MediaItem;