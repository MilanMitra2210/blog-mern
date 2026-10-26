import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Tag as TagIcon, Copy, Check } from "lucide-react";
import { PrimaryButton, SecondaryButton, GhostButton } from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";

interface BlogTagModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { name: string; slug: string }) => Promise<void>;
  initialData?: Tag | null;
  isLoading?: boolean;
}

const BlogTagModal: React.FC<BlogTagModalProps> = ({
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

  const handleCopyId = () => {
    if (!initialData) return;
    navigator.clipboard.writeText(initialData.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
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
                    <TagIcon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="h3 leading-none">
                    {initialData ? "Edit Tag" : "New Tag"}
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
                    <div>
                      <p className="text-[10px] font-black text-dark-blue/30 uppercase tracking-widest leading-none">
                        Tag ID
                      </p>
                      <p className="text-[11px] font-bold text-dark-blue/70 font-mono mt-1 text-ellipsis max-w-50 overflow-hidden">
                        {initialData.id}
                      </p>
                    </div>
                    <GhostButton
                      type="button"
                      onClick={handleCopyId}
                      className="p-2 rounded-xl text-dark-blue/40 hover:text-primary hover:bg-white"
                      title="Copy ID"
                    >
                      {copiedId ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </GhostButton>
                  </div>
                )}

                <TextField
                  label="Tag Name"
                  placeholder="e.g. Technology"
                  value={name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                />

                <TextField
                  label="Slug"
                  placeholder="e.g. technology"
                  value={slug}
                  onChange={(e) => setSlug(generateSlug(e.target.value))}
                  required
                />

                <div className="flex gap-4 pt-4 border-t border-gray">
                  <SecondaryButton
                    type="button"
                    onClick={onClose}
                    className="flex-1"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    className="flex-1"
                    disabled={isLoading || !name.trim() || !slug.trim() || !hasChanges}
                  >
                    {isLoading ? "Saving..." : "Save Tag"}
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

export default BlogTagModal;
