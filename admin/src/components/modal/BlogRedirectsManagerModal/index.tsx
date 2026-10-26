import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Link2, Plus, RefreshCw } from "lucide-react";
import {
  useGetBlogRedirectsQuery,
  useCreateBlogRedirectMutation,
  useDeleteBlogRedirectMutation,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import { GhostButton, PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import DataTable from "@/components/ui/Table/DataTable";
import SearchBar from "@/components/ui/SearchBar";
import CreateRedirectModal from "@/components/modal/CreateRedirectModal";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { getColumns, RedirectRow } from "./columns";

interface BlogRedirectsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NEXT_URL = import.meta.env.VITE_NEXT_URL || "http://localhost:3002";

const BlogRedirectsManagerModal: React.FC<BlogRedirectsManagerModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [search, setSearch] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<RedirectRow | null>(null);

  const {
    data: redirectResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetBlogRedirectsQuery(undefined, { skip: !isOpen });

  const [createRedirect, { isLoading: isCreating }] = useCreateBlogRedirectMutation();
  const [deleteRedirect, { isLoading: isDeleting }] = useDeleteBlogRedirectMutation();

  const user = useAppSelector((state) => state.auth.user);
  const isAdmin = user?.role === "ADMIN";

  const rawRedirects = (redirectResponse?.data as any[]) || [];

  const rows: RedirectRow[] = useMemo(() => {
    const allRows = rawRedirects.map((item) => ({
      id: item.id || item._id || item.oldSlug,
      oldSlug: item.oldSlug,
      currentSlug: item.blog?.slug || "",
      blogTitle: item.blog?.title || "",
      createdBy: item.createdBy,
      createdAt: item.createdAt,
    }));
    if (!search) return allRows;
    const q = search.toLowerCase();
    return allRows.filter(
      (r) =>
        r.oldSlug.toLowerCase().includes(q) ||
        r.currentSlug.toLowerCase().includes(q) ||
        (r.blogTitle && r.blogTitle.toLowerCase().includes(q))
    );
  }, [rawRedirects, search]);

  const totalRedirects = rawRedirects.length;
  const uniqueTargets = new Set(
    rawRedirects.map((r) => r.blog?.slug || r.blog).filter(Boolean)
  ).size;

  const handleCreate = async (oldSlug: string, blogId: string) => {
    try {
      await createRedirect({ oldSlug, blogId }).unwrap();
      toast.success("Redirect created successfully");
      setIsCreateOpen(false);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to create redirect");
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteRedirect(deleteConfirm.oldSlug).unwrap();
      toast.success("Redirect deleted successfully");
      setDeleteConfirm(null);
      refetch();
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to delete redirect");
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        nextUrl: NEXT_URL,
        setDeleteConfirm,
        isAdmin,
        currentUserId: user?.id,
      }),
    [NEXT_URL, isAdmin, user?.id]
  );

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
              className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray flex flex-col h-full max-h-[85vh]"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Link2 className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none">Blog Redirects</h3>
                    <p className="extra-small-paragraph uppercase tracking-widest mt-1 text-dark-blue/40">
                      Manage old-to-new slug redirect mappings
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

              <div className="px-8 py-4 border-b border-gray bg-light-blue/10 grid grid-cols-3 gap-4 shrink-0">
                <div className="text-center">
                  <p className="extra-small-paragraph uppercase tracking-[0.2em] font-bold text-dark-blue/30">
                    Total Redirects
                  </p>
                  <p className="text-xl font-black text-dark-blue">{totalRedirects}</p>
                </div>
                <div className="text-center">
                  <p className="extra-small-paragraph uppercase tracking-[0.2em] font-bold text-dark-blue/30">
                    Unique Targets
                  </p>
                  <p className="text-xl font-black text-emerald-600">{uniqueTargets}</p>
                </div>
                <div className="text-center">
                  <p className="extra-small-paragraph uppercase tracking-[0.2em] font-bold text-dark-blue/30">
                    Filtered Results
                  </p>
                  <p className="text-xl font-black text-primary">{rows.length}</p>
                </div>
              </div>

              <div className="px-8 py-4 border-b border-gray flex flex-col sm:flex-row gap-4 justify-between items-center shrink-0">
                <SearchBar
                  value={search}
                  onChange={setSearch}
                  placeholder="Search redirects..."
                  className="sm:max-w-xs"
                />
                <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto">
                  <GhostButton
                    onClick={() => refetch()}
                    paddingClassName="p-2.5"
                    className="rounded-xl border border-gray bg-white/60 hover:bg-white text-dark-blue/40 hover:text-dark-blue/70 transition-all cursor-pointer"
                  >
                    <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                  </GhostButton>
                  <PrimaryButton
                    onClick={() => setIsCreateOpen(true)}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Create Redirect
                  </PrimaryButton>
                </div>
              </div>

              {/* Table */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                <DataTable
                  columns={columns}
                  data={rows}
                  isLoading={isLoading}
                  rowKey={(row) => row.id}
                  emptyMessage={
                    search
                      ? "No redirects match your search"
                      : "No blog redirects found. Create one manually or change a blog slug to auto-generate a redirect."
                  }
                />
              </div>

              <div className="px-8 py-5 border-t border-gray bg-light-blue/10 flex justify-end shrink-0">
                <SecondaryButton
                  onClick={onClose}
                  className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Close
                </SecondaryButton>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CreateRedirectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isLoading={isCreating}
      />

      <DeleteConfirmModal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        isLoading={isDeleting}
        row={deleteConfirm}
      />
    </div>
  );
};

export default BlogRedirectsManagerModal;
