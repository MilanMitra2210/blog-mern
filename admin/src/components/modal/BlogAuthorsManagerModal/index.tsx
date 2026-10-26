import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  UserCircle,
  Plus,
} from "lucide-react";
import {
  useGetBlogAuthorsQuery,
  useCreateBlogAuthorMutation,
  useUpdateBlogAuthorMutation,
  useDeleteBlogAuthorMutation,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import { GhostButton, PrimaryButton } from "@/components/ui/Button";
import DataTable from "@/components/ui/Table/DataTable";
import Pagination from "@/components/ui/Table/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import BlogAuthorModal from "../BlogAuthorModal";
import { getColumns } from "./columns";

interface BlogAuthorsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LIMIT = 5;

const BlogAuthorsManagerModal: React.FC<BlogAuthorsManagerModalProps> = ({
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

  const { data: authorsResponse, refetch, isLoading } = useGetBlogAuthorsQuery(
    isOpen ? { page, limit: LIMIT, search: searchQuery } : undefined,
    { skip: !isOpen }
  );

  const [createAuthor, { isLoading: isCreating }] = useCreateBlogAuthorMutation();
  const [updateAuthor, { isLoading: isUpdating }] = useUpdateBlogAuthorMutation();
  const [deleteAuthor] = useDeleteBlogAuthorMutation();

  // State for single Author modal (add/edit)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAuthor, setSelectedAuthor] = useState<BlogAuthor | null>(null);

  // Extract pagination and items safely
  const responseData = authorsResponse?.data;
  const authors = responseData && "items" in responseData ? responseData.items : (Array.isArray(responseData) ? responseData : []);
  const totalCount = responseData && "total" in responseData ? responseData.total : authors.length;
  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setSelectedAuthor(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (author: BlogAuthor) => {
    setSelectedAuthor(author);
    setIsEditModalOpen(true);
  };

  const handleDeleteAuthor = async (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    author: BlogAuthor
  ) => {
    event.stopPropagation();
    try {
      await deleteAuthor(author.id).unwrap();
      toast.success(`Author "${author.name}" deleted successfully`);
      setDeleteConfirm(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete author");
    }
  };

  const handleModalSubmit = async (data: {
    name: string;
    bio?: string;
    designation?: string;
    image_id?: string;
  }) => {
    try {
      if (selectedAuthor) {
        await updateAuthor({ id: selectedAuthor.id, body: data }).unwrap();
        toast.success("Author updated successfully");
      } else {
        await createAuthor(data).unwrap();
        toast.success("Author created successfully");
      }
      setIsEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to save author");
    }
  };

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const columns = getColumns({
    handleOpenEdit,
    handleDeleteAuthor,
    deleteConfirm,
    setDeleteConfirm,
    handleCopyId,
    copiedId,
    isAdmin,
    currentUserId: user?.id,
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6">
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
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none">Manage Blog Authors</h3>
                    <p className="extra-small-paragraph uppercase tracking-widest mt-1 text-dark-blue/40">
                      Create, edit and copy UUIDs for article authors
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

              <div className="px-8 py-4 border-b border-gray bg-light-blue/10 flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                <SearchBar
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search authors..."
                  className="sm:max-w-xs"
                  delay={300}
                />
                <PrimaryButton
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Author
                </PrimaryButton>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                <DataTable
                  columns={columns}
                  data={authors}
                  isLoading={isLoading}
                  rowKey={(author) => author.id}
                  emptyMessage={searchQuery ? "No authors found in database matching your search" : "No authors found in database"}
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

      <BlogAuthorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedAuthor}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default BlogAuthorsManagerModal;
