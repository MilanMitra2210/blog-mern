import React, { useState, useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Search } from "lucide-react";
import {
  useGetMediaQuery,
  useUploadMediaMutation,
  useUploadMediaBulkMutation,
  useUpdateMediaMutation,
  useReplaceMediaMutation,
  useDeleteMediaMutation,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  useBulkMoveMediaMutation,
  useGetAllFoldersQuery,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { useDebounce } from "@/hooks/useDebounce";
import MediaItem from "./MediaItem";
import MediaBreadcrumbs from "./MediaBreadcrumbs";
import UploadModal from "@/components/modal/UploadModal";
import FolderModal from "@/components/modal/FolderModal";
import MoveModal from "@/components/modal/MoveModal";
import MediaDetailModal from "@/components/modal/MediaDetailModal";
import MediaHeader from "@/components/pages/media-manager/MediaHeader";
import MediaPagination from "@/components/pages/media-manager/MediaPagination";
import BulkActionBar from "@/components/pages/media-manager/BulkActionBar";
import { motion } from "framer-motion";
import { useTableParams } from "@/hooks/useTableParams";

import { Permission } from "@/constants/permissions";

const MediaManagerFeature: React.FC = () => {
  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.roleRel?.permissions || user?.role_rel?.permissions || [];
  const canWrite =
    user?.role === "ADMIN" ||
    permissions.includes(Permission.MEDIA_WRITE);

  const [tableParams, setParam, setParams] = useTableParams({
    page: 1,
    search: "",
    folderId: "",
  });

  const [searchParams, setSearchParams] = useSearchParams();
  const modalParam = searchParams.get("modal");

  const currentFolderId = tableParams.folderId || undefined;
  const searchQuery = tableParams.search;
  const debouncedSearch = useDebounce(searchQuery, 400);
  const limit = 20;

  const isUploadModalOpen = modalParam === "upload";
  const isFolderModalOpen = modalParam === "folder";

  const handleOpenUpload = () => {
    setSearchParams(
      (prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        next.set("modal", "upload");
        return next;
      },
      { replace: true }
    );
  };

  const handleOpenFolder = () => {
    setSearchParams(
      (prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        next.set("modal", "folder");
        return next;
      },
      { replace: true }
    );
  };

  const handleCloseModal = () => {
    setSearchParams(
      (prev: URLSearchParams) => {
        const next = new URLSearchParams(prev);
        next.delete("modal");
        return next;
      },
      { replace: true }
    );
  };

  const [isMoveModalOpen, setIsMoveModalOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<Media | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const isAdmin = user?.role === "ADMIN";

  const { data: mediaResponse, isLoading } = useGetMediaQuery({
    folderId: debouncedSearch ? undefined : currentFolderId,
    search: debouncedSearch,
    page: tableParams.page,
    limit,
    userId: !isAdmin ? user?.id : undefined,
  });

  const media = mediaResponse?.data;

  const { data: foldersResponse } = useGetAllFoldersQuery();
  const allFolders = foldersResponse?.data;

  const breadcrumb = useMemo(() => {
    if (!currentFolderId || !allFolders) return [];
    const trail: { id: string; name: string }[] = [];
    let currentId: string | undefined | null = currentFolderId;
    while (currentId) {
      const folder = allFolders.find((f) => f.id === currentId);
      if (folder) {
        trail.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parentId;
      } else {
        break;
      }
    }
    return trail;
  }, [currentFolderId, allFolders]);

  const [uploadMedia] = useUploadMediaMutation();
  const [uploadMediaBulk] = useUploadMediaBulkMutation();
  const [updateMedia] = useUpdateMediaMutation();
  const [replaceMedia] = useReplaceMediaMutation();
  const [deleteMedia] = useDeleteMediaMutation();
  const [createFolder] = useCreateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();
  const [bulkMoveMedia] = useBulkMoveMediaMutation();

  const handleFolderClick = useCallback((folder: { id: string; name: string }) => {
    setParams({
      folderId: folder.id,
      page: 1,
      search: "",
    });
    setSelectedIds([]);
  }, [setParams]);

  const handleBreadcrumbClick = useCallback((index: number) => {
    if (index === -1) {
      setParams({
        folderId: "",
        page: 1,
        search: "",
      });
    } else {
      const targetFolder = breadcrumb[index];
      setParams({
        folderId: targetFolder.id,
        page: 1,
        search: "",
      });
    }
    setSelectedIds([]);
  }, [breadcrumb, setParams]);

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }, []);

  const handleBulkMove = async (folderId: string | null) => {
    try {
      await bulkMoveMedia({ media_ids: selectedIds, folder_id: folderId }).unwrap();
      setSelectedIds([]);
      setIsMoveModalOpen(false);
    } catch (error) {
      console.error("Bulk move failed", error);
    }
  };

  const handleBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteMedia(id).unwrap();
      }
      setSelectedIds([]);
      setIsDeleting(false);
    } catch (error) {
      console.error("Bulk delete failed", error);
    }
  };

  return (
    <div className="space-y-12 pb-32">
      <MediaHeader
        searchQuery={searchQuery}
        onSearchChange={(val) => {
          setParam("search", val);
        }}
        onFolderCreate={handleOpenFolder}
        onUpload={handleOpenUpload}
        isSearching={!!debouncedSearch}
        canWrite={canWrite}
      />

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-2">
        <MediaBreadcrumbs
          breadcrumb={breadcrumb}
          onNavigate={handleBreadcrumbClick}
        />

        {selectedIds.length > 0 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <button
              onClick={() => setSelectedIds([])}
              className="text-[10px] font-black text-dark-blue/30 uppercase tracking-widest hover:text-red-500 transition-colors cursor-pointer"
            >
              Clear {selectedIds.length} Selections
            </button>
            <div className="h-6 w-px bg-gray" />
            <span className="px-4 py-2 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
              Selection Mode
            </span>
          </motion.div>
        )}
      </div>

      <div className="min-h-125">
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-square bg-gray/5 border border-gray rounded-[2.5rem] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {media?.folders?.map((folder) => (
                <MediaItem
                  key={folder.id}
                  type="folder"
                  item={folder}
                  onClick={() => handleFolderClick(folder)}
                  onDelete={() => deleteFolder(folder.id).unwrap()}
                  canWrite={canWrite}
                />
              ))}

              {media?.files?.map((file) => (
                <MediaItem
                  key={file.id}
                  type="file"
                  item={file}
                  isSelected={selectedIds.includes(file.id)}
                  onSelect={() => toggleSelect(file.id)}
                  onClick={() => {}}
                  onDelete={() => deleteMedia(file.id).unwrap()}
                  onOpenDetail={() => setSelectedMedia(file)}
                  canWrite={canWrite}
                />
              ))}
            </div>

            {(!media?.files?.length && !media?.folders?.length) && (
              <div className="py-40 flex flex-col items-center justify-center gap-8 text-center bg-gray/5 rounded-[4rem] border border-dashed border-gray">
                <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-2xl border border-gray">
                  <Search className="w-8 h-8 text-dark-blue/10" />
                </div>
                <div className="space-y-2">
                  <h3 className="h3">Nothing found here</h3>
                  <p className="small-paragraph max-w-sm mx-auto text-dark-blue/40">
                    {debouncedSearch
                      ? "Try adjusting your search filters to find what you're looking for."
                      : "This workspace is currently empty. Use the buttons above to populate it."}
                  </p>
                </div>
              </div>
            )}

            <MediaPagination
              currentPage={tableParams.page}
              totalPages={media?.pagination?.totalPages || 0}
              onPageChange={(p) => setParam("page", p)}
            />
          </>
        )}
      </div>

      <BulkActionBar
        selectedCount={selectedIds.length}
        isDeleting={isDeleting}
        onClearSelection={() => setSelectedIds([])}
        onMoveOpen={() => setIsMoveModalOpen(true)}
        onDeleteToggle={setIsDeleting}
        onConfirmDelete={handleBulkDelete}
      />

      <UploadModal
        isOpen={isUploadModalOpen}
        onClose={handleCloseModal}
        folderId={currentFolderId}
        onUpload={async (data) => {
          if (data.files.length === 1) {
            return uploadMedia({ 
              file: data.files[0], 
              folderId: data.folderId, 
              altText: data.altText 
            }).unwrap();
          } else {
            return uploadMediaBulk({ 
              files: data.files, 
              folderId: data.folderId 
            }).unwrap();
          }
        }}
      />

      <FolderModal
        isOpen={isFolderModalOpen}
        onClose={handleCloseModal}
        parentId={currentFolderId}
        onCreate={(data) => createFolder(data).unwrap()}
      />

      <MoveModal 
        isOpen={isMoveModalOpen}
        onClose={() => setIsMoveModalOpen(false)}
        folders={allFolders || []}
        onMove={handleBulkMove}
        selectedCount={selectedIds.length}
      />

      {selectedMedia && (
        <MediaDetailModal
          isOpen={!!selectedMedia}
          onClose={() => setSelectedMedia(null)}
          item={selectedMedia}
          onUpdate={(data) => updateMedia(data).unwrap()}
          onReplace={(data) => replaceMedia(data).unwrap()}
          onDelete={(id) => deleteMedia(id).unwrap()}
          canWrite={canWrite}
        />
      )}
    </div>
  );
};

export default MediaManagerFeature;
