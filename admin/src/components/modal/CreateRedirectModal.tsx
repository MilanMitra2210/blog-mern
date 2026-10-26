import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link2, X } from "lucide-react";
import { PrimaryButton, SecondaryButton, GhostButton } from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";
import InfiniteScrollSelect, {
  InfiniteScrollSelectOption,
} from "@/components/ui/Form/InfiniteScrollSelect";
import { useGetBlogsQuery } from "@/services/api";

interface CreateRedirectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (oldSlug: string, blogId: string) => Promise<void>;
  isLoading: boolean;
}

type BlogOption = InfiniteScrollSelectOption;

const BLOG_OPTION_LIMIT = 8;

const CreateRedirectModal: React.FC<CreateRedirectModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [oldSlug, setOldSlug] = useState("");
  const [blogId, setBlogId] = useState("");
  const [selectedBlog, setSelectedBlog] = useState<BlogOption | null>(null);
  const [blogSearch, setBlogSearch] = useState("");
  const [blogPage, setBlogPage] = useState(1);
  const [blogOptions, setBlogOptions] = useState<BlogOption[]>([]);

  const {
    currentData: blogsResponse,
    isLoading: isBlogsLoading,
    isFetching: isBlogsFetching,
  } = useGetBlogsQuery(
    {
      page: blogPage,
      limit: BLOG_OPTION_LIMIT,
      search: blogSearch.trim() || undefined,
    },
    { skip: !isOpen }
  );

  const blogs = useMemo(() => blogsResponse?.data?.items || [], [blogsResponse]);
  const totalBlogs = blogsResponse?.data?.total || 0;
  const hasMoreBlogs = blogOptions.length < totalBlogs;

  useEffect(() => {
    if (isOpen) {
      setOldSlug("");
      setBlogId("");
      setSelectedBlog(null);
      setBlogSearch("");
      setBlogPage(1);
      setBlogOptions([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setBlogPage(1);
    setBlogOptions([]);
  }, [blogSearch, isOpen]);

  useEffect(() => {
    if (!isOpen || blogs.length === 0) return;

    const nextOptions = blogs.map((blog) => ({
      label: blog.title,
      description: `/${blog.slug}`,
      value: blog.id,
    }));

    setBlogOptions((prev) => {
      const merged = blogPage === 1 ? nextOptions : [...prev, ...nextOptions];
      return Array.from(
        new Map(merged.map((option) => [option.value, option])).values()
      );
    });
  }, [blogPage, blogs, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!oldSlug.trim() || !blogId) return;
    await onSubmit(oldSlug.trim(), blogId);
  };

  const handleSelectBlog = (option: InfiniteScrollSelectOption) => {
    setBlogId(option.value);
    setSelectedBlog(option);
  };

  const handleLoadMoreBlogs = () => {
    setBlogPage((prev) => prev + 1);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-3xl shadow-2xl border border-gray custom-scrollbar"
          >
            {/* Header */}
            <div className="px-8 py-6 border-b border-gray flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-primary" />
                </div>
                <h3 className="h3 leading-none">New Slug Redirect</h3>
              </div>
              <GhostButton
                onClick={onClose}
                className="p-2 -mr-2 text-dark-blue/40 hover:text-dark-blue hover:bg-gray rounded-xl"
              >
                <X className="w-5 h-5" />
              </GhostButton>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-5">
              <TextField
                label="Legacy Slug (Redirects From)"
                value={oldSlug}
                onChange={(e) => setOldSlug(e.target.value)}
                placeholder="e.g. old-post-title"
                required
              />

              <InfiniteScrollSelect
                label="Target Blog Post (Redirects To)"
                value={blogId}
                selectedOption={selectedBlog}
                options={blogOptions}
                onChange={handleSelectBlog}
                search={blogSearch}
                onSearchChange={setBlogSearch}
                onLoadMore={handleLoadMoreBlogs}
                hasMore={hasMoreBlogs}
                isLoading={isBlogsLoading}
                isFetching={isBlogsFetching}
                placeholder="Select a blog..."
                searchPlaceholder="Search blog posts..."
                emptyMessage="No blog posts found"
                resultCountLabel={`${blogOptions.length} / ${totalBlogs}`}
              />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray">
                <SecondaryButton
                  onClick={onClose}
                  type="button"
                  className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  type="submit"
                  disabled={isLoading || !oldSlug.trim() || !blogId}
                  className="px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
                >
                  {isLoading ? "Creating..." : "Create"}
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CreateRedirectModal;
