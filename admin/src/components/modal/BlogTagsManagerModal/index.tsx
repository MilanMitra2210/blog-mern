import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag as TagIcon, Plus } from "lucide-react";
import {
  useGetBlogTagsQuery,
  useCreateBlogTagMutation,
  useUpdateBlogTagMutation,
  useDeleteBlogTagMutation,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import { GhostButton, PrimaryButton } from "@/components/ui/Button";
import DataTable from "@/components/ui/Table/DataTable";
import Pagination from "@/components/ui/Table/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import BlogTagModal from "../BlogTagModal";
import { getColumns } from "./columns";

interface BlogTagsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LIMIT = 5;

const BlogTagsManagerModal: React.FC<BlogTagsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    setPage(1);
  };

  const { data: tagsResponse, refetch, isLoading } = useGetBlogTagsQuery(
    isOpen ? { page, limit: LIMIT, search: searchQuery } : undefined,
    { skip: !isOpen }
  );

  const [createTag, { isLoading: isCreating }] = useCreateBlogTagMutation();
  const [updateTag, { isLoading: isUpdating }] = useUpdateBlogTagMutation();
  const [deleteTag] = useDeleteBlogTagMutation();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);

  const responseData = tagsResponse?.data as any;
  const tags: Tag[] = responseData && "items" in responseData ? responseData.items : (Array.isArray(responseData) ? responseData : []);
  const totalCount = responseData && "total" in responseData ? responseData.total : tags.length;
  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setSelectedTag(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (tag: Tag) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };

  const handleDeleteTag = async (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    tag: Tag
  ) => {
    event.stopPropagation();
    try {
      await deleteTag(tag.id).unwrap();
      toast.success(`Tag "${tag.name}" deleted successfully`);
      setDeleteConfirm(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete tag");
    }
  };

  const handleModalSubmit = async (data: { name: string; slug: string }) => {
    try {
      if (selectedTag) {
        await updateTag({ id: selectedTag.id, body: data }).unwrap();
        toast.success("Tag updated successfully");
      } else {
        await createTag(data).unwrap();
        toast.success("Tag created successfully");
      }
      setIsEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to save tag");
    }
  };

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const columns = getColumns({
    handleOpenEdit,
    handleDeleteTag,
    deleteConfirm,
    setDeleteConfirm,
    handleCopyId,
    copiedId,
    isAdmin,
    currentUserId: user?.id,
  });

  if (!isOpen) return null;

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
              className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray flex flex-col h-full max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <TagIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none">Manage Blog Tags</h3>
                    <p className="extra-small-paragraph uppercase tracking-widest mt-1 text-dark-blue/40">
                      Create, edit and copy UUIDs for article tags
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

              {/* Toolbar */}
              <div className="px-8 py-4 border-b border-gray bg-light-blue/10 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search tags..."
                  className="sm:max-w-xs"
                  delay={300}
                />
                <PrimaryButton
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Tag
                </PrimaryButton>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                <DataTable
                  columns={columns}
                  data={tags}
                  isLoading={isLoading}
                  emptyMessage={searchQuery ? "No tags found in database matching your search" : "No tags found in database"}
                  rowKey={(item) => item.id}
                  onRowClick={handleOpenEdit}
                />

                {!isLoading && totalPages > 1 && (
                  <Pagination
                    currentPage={page}
                    totalPages={totalPages}
                    onPageChange={setPage}
                  />
                )}
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      <BlogTagModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedTag}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default BlogTagsManagerModal;
