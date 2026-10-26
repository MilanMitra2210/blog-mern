import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  FolderOpen,
  Plus,
} from "lucide-react";
import {
  useGetBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import { GhostButton, PrimaryButton } from "@/components/ui/Button";
import DataTable from "@/components/ui/Table/DataTable";
import Pagination from "@/components/ui/Table/Pagination";
import SearchBar from "@/components/ui/SearchBar";
import BlogCategoryModal from "../BlogCategoryModal";
import { getColumns } from "./columns";

interface BlogCategoriesManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LIMIT = 5;

const BlogCategoriesManagerModal: React.FC<BlogCategoriesManagerModalProps> = ({
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

  const { data: categoriesResponse, refetch, isLoading } = useGetBlogCategoriesQuery(
    isOpen ? { page, limit: LIMIT, search: searchQuery } : undefined,
    { skip: !isOpen }
  );

  const [createCategory, { isLoading: isCreating }] = useCreateBlogCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] = useUpdateBlogCategoryMutation();
  const [deleteCategory] = useDeleteBlogCategoryMutation();

  // State for single Category modal (add/edit)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BlogCategory | null>(null);

  // Extract pagination and items safely
  const responseData = categoriesResponse?.data;
  const categories = responseData && "items" in responseData ? responseData.items : (Array.isArray(responseData) ? responseData : []);
  const totalCount = responseData && "total" in responseData ? responseData.total : categories.length;
  const totalPages = Math.ceil(totalCount / LIMIT) || 1;

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleOpenAdd = () => {
    setSelectedCategory(null);
    setIsEditModalOpen(true);
  };

  const handleOpenEdit = (category: BlogCategory) => {
    setSelectedCategory(category);
    setIsEditModalOpen(true);
  };

  const handleDeleteCategory = async (
    event: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>,
    category: BlogCategory
  ) => {
    event.stopPropagation();
    try {
      await deleteCategory(category.id).unwrap();
      toast.success(`Category "${category.name}" deleted successfully`);
      setDeleteConfirm(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete category");
    }
  };

  const handleModalSubmit = async (data: { name: string; slug: string }) => {
    try {
      if (selectedCategory) {
        await updateCategory({ id: selectedCategory.id, body: data }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(data).unwrap();
        toast.success("Category created successfully");
      }
      setIsEditModalOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to save category");
    }
  };

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const columns = getColumns({
    handleOpenEdit,
    handleDeleteCategory,
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
                    <FolderOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none">Manage Blog Categories</h3>
                    <p className="extra-small-paragraph uppercase tracking-widest mt-1 text-dark-blue/40">
                      Create, edit and copy UUIDs for article categories
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
                  placeholder="Search categories..."
                  className="sm:max-w-xs"
                  delay={300}
                />
                <PrimaryButton
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Category
                </PrimaryButton>
              </div>

              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-4">
                <DataTable
                  columns={columns}
                  data={categories}
                  isLoading={isLoading}
                  rowKey={(cat) => cat.id}
                  emptyMessage={searchQuery ? "No categories found in database matching your search" : "No categories found in database"}
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

      <BlogCategoryModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={selectedCategory}
        isLoading={isCreating || isUpdating}
      />
    </div>
  );
};

export default BlogCategoriesManagerModal;
