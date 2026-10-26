import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useGetMediaQuery, useUploadMediaMutation } from "@/services/api";
import { useAppSelector } from "@/store/store";
import { useDebounce } from "@/hooks/useDebounce";
import {
  GhostButton,
  PrimaryButton,
  SecondaryButton,
} from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";
import MediaBreadcrumbs from "@/components/pages/media-manager/MediaBreadcrumbs";
import MediaPagination from "@/components/pages/media-manager/MediaPagination";
import { BrowserView } from "./BrowserView";
import { UploadView } from "./UploadView";

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: Media | Media[]) => void;
  title?: string;
  allowMultiple?: boolean;
  allowedMimeTypes?: string[];
}

const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  title = "Select Media",
  allowMultiple = false,
  allowedMimeTypes,
}) => {
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(
    undefined,
  );
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [page, setPage] = useState(1);
  const limit = 15;
  const [breadcrumb, setBreadcrumb] = useState<{ id: string; name: string }[]>(
    [],
  );
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);
  const [selectedItems, setSelectedItems] = useState<Media[]>([]);

  useEffect(() => {
    if (isOpen) {
      setSelectedItem(null);
      setSelectedItems([]);
    }
  }, [isOpen]);

  const [isUploadingMode, setIsUploadingMode] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState("");
  const [uploadMedia, { isLoading: isUploading }] = useUploadMediaMutation();

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles || newFiles.length === 0) return;
    setSelectedFile(newFiles[0]);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      const res = await uploadMedia({
        file: selectedFile,
        folderId: currentFolderId,
        altText: altText || undefined,
      }).unwrap();
      
      if (res?.data) {
        onSelect(allowMultiple ? [res.data] : res.data);
        onClose();
        setIsUploadingMode(false);
        setSelectedFile(null);
        setAltText("");
      }
    } catch (err) {
      console.error("Upload failed", err);
    }
  };

  const handleSelectItem = (file: Media) => {
    if (allowMultiple) {
      setSelectedItems((prev) => {
        const isSelected = prev.some((item) => item.id === file.id);
        if (isSelected) {
          return prev.filter((item) => item.id !== file.id);
        } else {
          return [...prev, file];
        }
      });
    } else {
      setSelectedItem(file);
    }
  };

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const { data: mediaResponse, isLoading } = useGetMediaQuery({
    folderId: debouncedSearch ? undefined : currentFolderId,
    search: debouncedSearch,
    page,
    limit,
    userId: !isAdmin ? user?.id : undefined,
  });

  const media = mediaResponse?.data;

  const filteredMedia = media ? {
    folders: media.folders,
    files: allowedMimeTypes && allowedMimeTypes.length > 0
      ? media.files.filter(file =>
          allowedMimeTypes.some(type => {
            if (type.endsWith("/*")) {
              return file.mimeType?.startsWith(type.slice(0, -1));
            }
            return file.mimeType === type || file.mimeType?.startsWith(type);
          })
        )
      : media.files,
    pagination: media.pagination,
  } : undefined;

  const handleFolderClick = (folder: { id: string; name: string }) => {
    setCurrentFolderId(folder.id);
    setBreadcrumb((prev) => [...prev, folder]);
    setPage(1);
    setSearchQuery("");
  };

  const handleBreadcrumbClick = (index: number) => {
    setSearchQuery("");
    if (index === -1) {
      setCurrentFolderId(undefined);
      setBreadcrumb([]);
    } else {
      setBreadcrumb((prev) => {
        const next = prev.slice(0, index + 1);
        setCurrentFolderId(next[next.length - 1].id);
        return next;
      });
    }
    setPage(1);
  };

  const handleConfirmSelection = () => {
    if (allowMultiple) {
      if (selectedItems.length > 0) {
        onSelect(selectedItems);
        onClose();
      }
    } else {
      if (selectedItem) {
        onSelect(selectedItem);
        onClose();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
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
              className="relative w-full max-w-5xl h-[85vh] bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray flex flex-col"
            >
              {/* Header */}
              <div className="px-10 py-8 border-b border-gray flex items-center justify-between bg-white shrink-0">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Search className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none">{title}</h3>
                    <p className="extra-small-paragraph text-dark-blue/30 uppercase tracking-widest mt-2">
                      Browse your library to pick an asset
                    </p>
                  </div>
                </div>
                <GhostButton
                  onClick={onClose}
                  className="p-3 -mr-3 text-dark-blue/40 hover:text-dark-blue hover:bg-gray rounded-2xl"
                >
                  <X className="w-6 h-6" />
                </GhostButton>
              </div>

              {/* Navigation & Search */}
              <div className="p-8 border-b border-gray bg-light-blue/5 shrink-0">
                {isUploadingMode ? (
                  <div className="flex items-center">
                    <GhostButton
                      type="button"
                      onClick={() => {
                        setIsUploadingMode(false);
                        setSelectedFile(null);
                        setAltText("");
                      }}
                      className="px-4 py-2 hover:bg-gray rounded-xl flex items-center gap-2 text-xs font-bold text-dark-blue/60 hover:text-dark-blue"
                    >
                      &larr; Back to Library
                    </GhostButton>
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <MediaBreadcrumbs
                      breadcrumb={breadcrumb}
                      onNavigate={handleBreadcrumbClick}
                    />
                    <div className="flex items-center gap-4">
                      <SearchBar
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder="Search media..."
                        className="w-full md:w-80"
                      />
                      <PrimaryButton
                        type="button"
                        onClick={() => setIsUploadingMode(true)}
                        className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                      >
                        Upload Asset
                      </PrimaryButton>
                    </div>
                  </div>
                )}
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {isUploadingMode ? (
                  <UploadView
                    selectedFile={selectedFile}
                    altText={altText}
                    onFileChange={handleFileChange}
                    onAltTextChange={setAltText}
                    onRemoveFile={() => setSelectedFile(null)}
                    allowedMimeTypes={allowedMimeTypes}
                  />
                ) : (
                  <BrowserView
                    isLoading={isLoading}
                    media={filteredMedia}
                    selectedItem={selectedItem}
                    selectedItems={selectedItems}
                    onFolderClick={handleFolderClick}
                    onSelectItem={handleSelectItem}
                  />
                )}
              </div>

              {/* Footer */}
              <div className="px-10 py-8 border-t border-gray bg-white shrink-0 flex items-center justify-between">
                {isUploadingMode ? (
                  <div />
                ) : (
                  <MediaPagination
                    currentPage={page}
                    totalPages={media?.pagination?.totalPages || 0}
                    onPageChange={setPage}
                  />
                )}

                <div className="flex items-center gap-4">
                  <SecondaryButton
                    onClick={() => {
                      if (isUploadingMode) {
                        setIsUploadingMode(false);
                        setSelectedFile(null);
                        setAltText("");
                      } else {
                        onClose();
                      }
                    }}
                    className="px-8 rounded-2xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </SecondaryButton>
                  
                  {isUploadingMode ? (
                    <PrimaryButton
                      disabled={!selectedFile || isUploading}
                      onClick={handleUpload}
                      className="px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      {isUploading ? "Uploading..." : "Upload & Select"}
                    </PrimaryButton>
                  ) : (
                    <PrimaryButton
                      disabled={allowMultiple ? selectedItems.length === 0 : !selectedItem}
                      onClick={handleConfirmSelection}
                      className="px-10 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                    >
                      Select Asset
                    </PrimaryButton>
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

export default MediaPickerModal;
