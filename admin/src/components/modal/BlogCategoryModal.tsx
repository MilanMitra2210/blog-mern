import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag, Copy, Check } from "lucide-react";
import { PrimaryButton, SecondaryButton, GhostButton } from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";

interface BlogCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; slug: string }) => Promise<void>;
  initialData?: BlogCategory | null;
  isLoading?: boolean;
}

const BlogCategoryModal: React.FC<BlogCategoryModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [copiedId, setCopiedId] = useState(false);

  const hasChanges = initialData
    ? name !== initialData.name || slug !== initialData.slug
    : true;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setSlug(initialData.slug);
    } else {
      setName("");
      setSlug("");
    }
  }, [initialData, isOpen]);

  const generateSlug = (val: string) =>
    val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleNameChange = (val: string) => {
    setName(val);
    if (!initialData) {
      setSlug(generateSlug(val));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) return;
    await onSubmit({ name: name.trim(), slug: slug.trim() });
  };

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
              className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <Tag className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="h3 leading-none">
                    {initialData ? "Edit Category" : "New Category"}
                  </h3>
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
                {initialData && (
                  <div className="flex items-center justify-between p-4 bg-light-blue/20 rounded-2xl border border-gray">
                    <div className="min-w-0">
                      <p className="extra-small-paragraph uppercase tracking-widest mb-1">Category UUID</p>
                      <p className="text-xs font-mono font-bold text-dark-blue truncate max-w-50">{initialData.id}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(initialData.id);
                        setCopiedId(true);
                        setTimeout(() => setCopiedId(false), 2000);
                      }}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all shrink-0 ${copiedId ? 'bg-green text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{copiedId ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                )}

                <TextField
                  label="Category Name"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="e.g. Technology"
                  required
                />
                <TextField
                  label="Slug"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="e.g. technology"
                  required
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
                    disabled={isLoading || !name.trim() || !slug.trim() || (!!initialData && !hasChanges)}
                    className="px-8 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : initialData ? "Update" : "Create"}
                  </PrimaryButton>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogCategoryModal;
