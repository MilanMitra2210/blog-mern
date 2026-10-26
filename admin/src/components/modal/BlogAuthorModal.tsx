import React, { useState, useEffect, lazy, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, UserCircle, Camera, Copy, Check } from "lucide-react";
import { PrimaryButton, SecondaryButton, GhostButton } from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";

const MediaPickerModal = lazy(() => import("@/components/modal/MediaPickerModal"));

interface BlogAuthorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    name: string;
    bio?: string;
    designation?: string;
    image_id?: string;
  }) => Promise<void>;
  initialData?: BlogAuthor | null;
  isLoading?: boolean;
}

const BlogAuthorModal: React.FC<BlogAuthorModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  isLoading,
}) => {
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [designation, setDesignation] = useState("");
  const [selectedImage, setSelectedImage] = useState<Media | null>(null);
  const [isMediaOpen, setIsMediaOpen] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  const hasChanges = initialData
    ? name !== initialData.name ||
      bio !== (initialData.bio || "") ||
      designation !== (initialData.designation || "") ||
      (selectedImage?.id || "") !== (initialData.image?.id || "")
    : true;

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setBio(initialData.bio || "");
      setDesignation(initialData.designation || "");
      setSelectedImage(initialData.image || null);
    } else {
      setName("");
      setBio("");
      setDesignation("");
      setSelectedImage(null);
    }
  }, [initialData, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onSubmit({
      name: name.trim(),
      bio: bio.trim() || undefined,
      designation: designation.trim() || undefined,
      image_id: selectedImage?.id || undefined,
    });
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
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-2xl flex items-center justify-center">
                    <UserCircle className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="h3 leading-none">
                    {initialData ? "Edit Author" : "New Author"}
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
                      <p className="extra-small-paragraph uppercase tracking-widest mb-1">Author UUID</p>
                      <p className="text-xs font-mono font-bold text-dark-blue truncate max-w-60">{initialData.id}</p>
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

                {/* Avatar */}
                <div className="flex justify-center">
                  <div
                    className="relative group cursor-pointer"
                    onClick={() => setIsMediaOpen(true)}
                  >
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-primary/5 border-2 border-gray flex items-center justify-center">
                      {selectedImage ? (
                        <img
                          src={selectedImage.url}
                          alt="Author"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <UserCircle className="w-8 h-8 text-dark-blue/20" />
                      )}
                    </div>
                    <div className="absolute inset-0 bg-dark-blue/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                </div>

                <TextField
                  label="Author Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Doe"
                  required
                />
                <TextField
                  label="Designation"
                  value={designation}
                  onChange={(e) => setDesignation(e.target.value)}
                  placeholder="e.g. Senior Content Writer"
                />
                <div className="space-y-2">
                  <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
                    Bio
                  </label>
                  <textarea
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    placeholder="Brief biography..."
                    rows={3}
                    className="w-full px-4 py-3 bg-light-blue/50 border border-gray rounded-2xl text-sm focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary/30 transition-all resize-none"
                  />
                </div>

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
                    disabled={isLoading || !name.trim() || (!!initialData && !hasChanges)}
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

      <Suspense fallback={null}>
        <MediaPickerModal
          isOpen={isMediaOpen}
          onClose={() => setIsMediaOpen(false)}
          onSelect={(media) => {
            setSelectedImage(media as Media);
            setIsMediaOpen(false);
          }}
          title="Select Author Photo"
        />
      </Suspense>
    </div>
  );
};

export default BlogAuthorModal;
