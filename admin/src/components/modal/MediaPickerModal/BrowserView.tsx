import React from "react";
import clsx from "clsx";
import { Folder, Check, FileText } from "lucide-react";

interface BrowserViewProps {
  isLoading: boolean;
  media: {
    folders: { id: string; name: string }[];
    files: Media[];
  } | undefined;
  selectedItem?: Media | null;
  selectedItems?: Media[];
  onFolderClick: (folder: { id: string; name: string }) => void;
  onSelectItem: (file: Media) => void;
}

export const BrowserView: React.FC<BrowserViewProps> = ({
  isLoading,
  media,
  selectedItem,
  selectedItems,
  onFolderClick,
  onSelectItem,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="aspect-square bg-gray/5 border border-gray rounded-xl animate-pulse"
          />
        ))}
      </div>
    );
  }

  const hasFolders = media?.folders && media.folders.length > 0;
  const hasFiles = media?.files && media.files.length > 0;

  if (!hasFolders && !hasFiles) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center py-20">
        <p className="large-paragraph text-dark-blue/20 italic">
          No assets found
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-6">
      {/* Folders */}
      {media?.folders.map((folder) => (
        <button
          type="button"
          key={folder.id}
          onClick={() => onFolderClick(folder)}
          className="group flex flex-col items-center gap-4 p-4 rounded-2xl hover:bg-primary/5 transition-all"
        >
          <div className="w-full aspect-square bg-amber-50 rounded-2xl flex items-center justify-center border border-amber-200/50 group-hover:scale-105 transition-transform">
            <Folder className="w-12 h-12 text-amber-400" />
          </div>
          <span className="text-[10px] font-black uppercase tracking-widest text-dark-blue/60 group-hover:text-primary truncate w-full text-center">
            {folder.name}
          </span>
        </button>
      ))}

      {/* Files */}
      {media?.files.map((file) => {
        const isSelected = selectedItems && selectedItems.length > 0
          ? selectedItems.some((item) => item.id === file.id)
          : selectedItem?.id === file.id;

        return (
          <button
            type="button"
            key={file.id}
            onClick={() => onSelectItem(file)}
            className={clsx(
              "group relative flex flex-col items-center gap-4 p-4 rounded-2xl transition-all border-2",
              isSelected
                ? "border-primary bg-primary/5"
                : "border-transparent hover:bg-gray/50"
            )}
          >
            <div className="w-full aspect-square rounded-2xl overflow-hidden border border-gray bg-gray/5 group-hover:scale-105 transition-transform flex items-center justify-center">
              {file.mimeType?.startsWith("image/") ? (
                <img
                  src={file.url}
                  alt={file.name}
                  className="w-full h-full object-contain"
                />
              ) : file.mimeType?.startsWith("video/") || file.name?.toLowerCase().endsWith(".mp4") || file.url?.toLowerCase().endsWith(".mp4") ? (
                <div className="w-full h-full relative overflow-hidden bg-black flex items-center justify-center">
                  <video
                    src={file.url}
                    className="w-full h-full object-cover pointer-events-none"
                    muted
                    playsInline
                  />
                  <div className="absolute inset-0 bg-black/10 pointer-events-none" />
                  <div className="absolute top-1.5 left-1.5 bg-primary text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs z-10">
                    Video
                  </div>
                </div>
              ) : file.mimeType?.endsWith("/pdf") || file.mimeType === "application/pdf" || file.name?.toLowerCase().endsWith(".pdf") || file.url?.toLowerCase().endsWith(".pdf") ? (
                <div className="w-full h-full relative overflow-hidden bg-white">
                  <iframe
                    src={`${file.url}#toolbar=0&navpanes=0&scrollbar=0`}
                    scrolling="no"
                    className="absolute top-0 left-0 w-[calc(100%+24px)] h-[calc(100%+24px)] border-none pointer-events-none select-none overflow-hidden"
                    style={{ overflow: "hidden" }}
                    title="PDF Preview"
                  />
                  <div className="absolute inset-0 bg-red-500/5 pointer-events-none" />
                  <div className="absolute top-1.5 left-1.5 bg-red-500 text-white text-[7px] font-black uppercase px-1.5 py-0.5 rounded-md shadow-xs z-10">
                    PDF
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray/20 text-dark-blue/20 gap-2">
                  <FileText className="w-8 h-8" />
                  <span className="text-[8px] font-black tracking-widest uppercase">File</span>
                </div>
              )}
            </div>
            <span
              className={clsx(
                "text-[10px] font-black uppercase tracking-widest truncate w-full text-center",
                isSelected ? "text-primary" : "text-dark-blue/40"
              )}
            >
              {file.name}
            </span>

            {isSelected && (
              <div className="absolute top-2 right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Check className="w-3 h-3 text-white" />
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
};
