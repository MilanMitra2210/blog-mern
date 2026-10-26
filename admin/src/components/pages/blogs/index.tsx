import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Permission } from "@/constants/permissions";
import {
  useGetBlogsQuery,
  useDeleteBlogMutation,
  useGetBlogCategoriesQuery,
} from "@/services/api";
import { useAppSelector } from "@/store/store";
import { toast } from "react-toastify";
import { Plus, RefreshCw, Sparkles, Users, Tag, FolderOpen, Link2 } from "lucide-react";
import DataTable from "@/components/ui/Table/DataTable";
import BlogAuthorsManagerModal from "@/components/modal/BlogAuthorsManagerModal";
import BlogCategoriesManagerModal from "@/components/modal/BlogCategoriesManagerModal";
import BlogTagsManagerModal from "@/components/modal/BlogTagsManagerModal";
import BlogImportModal from "@/components/modal/BlogImportModal";
import BlogRedirectsManagerModal from "@/components/modal/BlogRedirectsManagerModal";
import Pagination from "@/components/ui/Table/Pagination";
import { GhostButton, PrimaryButton } from "@/components/ui/Button";
import BlogFilters from "./BlogFilters";
import { getColumns } from "./columns";
import { AnimatePresence, motion } from "framer-motion";
import { SecondaryButton } from "@/components/ui/Button";
import { useTableParams } from "@/hooks/useTableParams";
import PostAnalyticsModal from "@/components/pages/dashboard/PostAnalyticsModal";

export default function BlogsFeature() {
  const navigate = useNavigate();
  const location = useLocation();
  const [tableParams, setParam] = useTableParams({
    page: 1,
    limit: 8,
    search: "",
    status: "all" as "all" | "published" | "draft",
    categoryId: "",
  });

  const user = useAppSelector((state) => state.auth.user);
  const permissions = user?.roleRel?.permissions || user?.role_rel?.permissions || [];
  const isAdmin = user?.role === "ADMIN";
  const canWrite = isAdmin || permissions.includes(Permission.BLOGS_WRITE);

  const [isAuthorsOpen, setIsAuthorsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
  const [isTagsOpen, setIsTagsOpen] = useState(false);
  const [isRedirectsOpen, setIsRedirectsOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const analyticsBlogId = location.search ? new URLSearchParams(location.search).get("analyticsBlogId") : null;

  const handleOpenAnalytics = (blog: Blog) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set("analyticsBlogId", blog.id);
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const handleCloseAnalytics = () => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete("analyticsBlogId");
    navigate({ search: searchParams.toString() }, { replace: true });
  };

  const { data: categoriesResponse } = useGetBlogCategoriesQuery();
  const categoriesData = categoriesResponse?.data;
  const categories: BlogCategory[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData && "items" in categoriesData
    ? categoriesData.items
    : [];

  const selectedCategory = categories.find((c) => c.slug === tableParams.categoryId);
  const categoryId = selectedCategory?.id || "";

  const {
    data: blogsResponse,
    isLoading,
    isFetching,
    refetch,
  } = useGetBlogsQuery({
    page: tableParams.page,
    limit: tableParams.limit,
    search: tableParams.search || undefined,
    status: tableParams.status,
    categoryId: categoryId || undefined,
    authorId: !isAdmin ? user?.id : undefined,
    userId: !isAdmin ? user?.id : undefined,
  });

  const [deleteBlog] = useDeleteBlogMutation();
  const [deleteConfirm, setDeleteConfirm] = useState<Blog | null>(null);

  const blogs = blogsResponse?.data?.items || [];

  const handleSearchChange = (val: string) => {
    setParam("search", val);
  };

  const handleStatusChange = (val: "all" | "published" | "draft") => {
    setParam("status", val);
  };

  const handleCategoryChange = (val: string) => {
    setParam("categoryId", val);
  };

  const handleOpenEdit = (blog: Blog) => {
    navigate(`/blogs/${blog.id}/edit`, { state: { search: location.search } });
  };

  const handleDeleteBlog = async () => {
    if (!deleteConfirm) return;
    try {
      await deleteBlog(deleteConfirm.id).unwrap();
      toast.success(`Blog "${deleteConfirm.title}" deleted`);
      setDeleteConfirm(null);
    } catch (err: unknown) {
      const error = err as { data?: { detail?: string } };
      toast.error(error?.data?.detail || "Failed to delete blog");
    }
  };

  const columns = getColumns({
    handleOpenEdit,
    setDeleteConfirm,
    handleOpenAnalytics,
    canWrite,
    isAdmin,
    currentUserId: user?.id,
  });

  const total = blogsResponse?.data?.total || 0;
  const totalPages = Math.ceil(total / tableParams.limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 2xl:flex-row 2xl:items-center 2xl:justify-between">
        <div className="min-w-0">
          <h1 className="h1 flex items-center gap-2.5">Blog Management</h1>
          <p className="small-paragraph mt-1">
            Create, publish, and manage your blog content
          </p>
        </div>
        <div className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 2xl:flex 2xl:w-auto 2xl:items-center 2xl:justify-end">
          <GhostButton
            onClick={() => refetch()}
            paddingClassName="p-2.5"
            className="min-h-11 rounded-xl border border-gray bg-white/60 hover:bg-white text-dark-blue/40 hover:text-dark-blue/70 transition-all cursor-pointer 2xl:size-11"
          >
            <RefreshCw
              className={`w-4 h-4 shrink-0 ${isFetching ? "animate-spin" : ""}`}
            />
          </GhostButton>

          {canWrite && (
            <>
              <SecondaryButton
                onClick={() => setIsAuthorsOpen(true)}
                className="min-h-11 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all cursor-pointer"
              >
                <Users className="w-4 h-4 shrink-0" />
                Authors
              </SecondaryButton>

              <SecondaryButton
                onClick={() => setIsCategoriesOpen(true)}
                className="min-h-11 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all cursor-pointer"
              >
                <FolderOpen className="w-4 h-4 shrink-0" />
                Categories
              </SecondaryButton>

              <SecondaryButton
                onClick={() => setIsTagsOpen(true)}
                className="min-h-11 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all cursor-pointer"
              >
                <Tag className="w-4 h-4 shrink-0" />
                Tags
              </SecondaryButton>

              <SecondaryButton
                onClick={() => setIsRedirectsOpen(true)}
                className="min-h-11 whitespace-nowrap flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all cursor-pointer"
              >
                <Link2 className="w-4 h-4 shrink-0" />
                Redirects
              </SecondaryButton>

              {isAdmin && (
                <button
                  type="button"
                  onClick={() => setIsImportOpen(true)}
                  className="flex min-h-11 items-center justify-center gap-2 rounded-xl bg-linear-to-r from-indigo-500 to-primary px-5 py-3 text-[10px] font-black uppercase tracking-widest text-white shadow-md shadow-primary/10 transition-all hover:shadow-lg hover:shadow-indigo-500/20 active:scale-95 cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-4 h-4 shrink-0 text-white animate-pulse" />
                  Import Blog
                </button>
              )}
            </>
          )}

          {canWrite && (
            <PrimaryButton
              onClick={() => navigate("/blogs/new", { state: { search: location.search } })}
              className="min-h-11 whitespace-nowrap shadow-primary/20"
            >
              <Plus className="w-4 h-4 shrink-0" />
              New Blog
            </PrimaryButton>
          )}
        </div>
      </div>

      {/* Filters */}
      <BlogFilters
        search={tableParams.search}
        onSearchChange={handleSearchChange}
        statusFilter={tableParams.status}
        onStatusChange={handleStatusChange}
        categoryFilter={tableParams.categoryId}
        onCategoryChange={handleCategoryChange}
        categories={categories}
      />

      {/* Table */}
      <DataTable
        columns={columns}
        data={blogs}
        isLoading={isLoading}
        rowKey={(blog) => blog.id}
        emptyMessage="No blog posts found. Create your first blog!"
        onRowClick={canWrite ? handleOpenEdit : undefined}
      />

      {/* Pagination */}
      <Pagination
        currentPage={tableParams.page}
        totalPages={totalPages}
        onPageChange={(p) => setParam("page", p)}
        totalItems={total}
        itemsPerPage={tableParams.limit}
        onPageSizeChange={(size) => setParam("limit", size)}
      />

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray"
            >
              <h3 className="h3 mb-2">Delete Blog</h3>
              <p className="small-paragraph mb-6">
                Are you sure you want to delete{" "}
                <strong>"{deleteConfirm.title}"</strong>? This action cannot
                be undone.
              </p>
              <div className="flex justify-end gap-3">
                <SecondaryButton
                  onClick={() => setDeleteConfirm(null)}
                  className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  onClick={handleDeleteBlog}
                  className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 shadow-red-500/20"
                >
                  Delete
                </PrimaryButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Authors Manager Modal */}
      <BlogAuthorsManagerModal
        isOpen={isAuthorsOpen}
        onClose={() => setIsAuthorsOpen(false)}
      />

      {/* Categories Manager Modal */}
      <BlogCategoriesManagerModal
        isOpen={isCategoriesOpen}
        onClose={() => setIsCategoriesOpen(false)}
      />

      {/* Import Blog Modal */}
      <BlogImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={() => refetch()}
      />

      {/* Redirects Manager Modal */}
      <BlogRedirectsManagerModal
        isOpen={isRedirectsOpen}
        onClose={() => setIsRedirectsOpen(false)}
      />

      {/* Tags Manager Modal */}
      <BlogTagsManagerModal
        isOpen={isTagsOpen}
        onClose={() => setIsTagsOpen(false)}
      />

      {/* Analytics Modal */}
      {(() => {
        const selectedBlogForAnalytics = analyticsBlogId ? blogs.find((b) => b.id === analyticsBlogId) : null;
        if (!selectedBlogForAnalytics) return null;
        return (
          <PostAnalyticsModal
            post={{
              id: selectedBlogForAnalytics.id,
              title: selectedBlogForAnalytics.title,
              slug: selectedBlogForAnalytics.slug,
              views: selectedBlogForAnalytics.metrics?.views || 0,
              likes: selectedBlogForAnalytics.metrics?.likes || 0,
              comments: selectedBlogForAnalytics.totalComments || 0,
              completions: selectedBlogForAnalytics.metrics?.completions || 0,
              completionRate: selectedBlogForAnalytics.metrics?.completionRate || 0,
              googleViews: selectedBlogForAnalytics.metrics?.googleViews || 0,
              twitterViews: selectedBlogForAnalytics.metrics?.twitterViews || 0,
              linkedinViews: selectedBlogForAnalytics.metrics?.linkedinViews || 0,
              directViews: selectedBlogForAnalytics.metrics?.directViews || 0,
              uniqueViews: selectedBlogForAnalytics.metrics?.uniqueViews || 0,
              mobileViews: selectedBlogForAnalytics.metrics?.mobileViews || 0,
              tabletViews: selectedBlogForAnalytics.metrics?.tabletViews || 0,
              desktopViews: selectedBlogForAnalytics.metrics?.desktopViews || 0,
            }}
            entityType="blog"
            onClose={handleCloseAnalytics}
          />
        );
      })()}
    </div>
  );
}
