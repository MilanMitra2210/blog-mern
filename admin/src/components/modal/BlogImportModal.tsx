import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  UploadCloud,
  FileText,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import { useImportBlogMutation } from "@/services/api";
import { toast } from "react-toastify";
import { GhostButton, PrimaryButton, SecondaryButton } from "@/components/ui/Button";

interface BlogImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const BlogImportModal: React.FC<BlogImportModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [importBlog, { isLoading, error, isSuccess }] = useImportBlogMutation();
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingSteps = [
    "Analyzing document structure and hierarchy...",
    "Validating cover image, category & author IDs...",
    "Extracting plain text, hyperlinks & formatting runs...",
    "Compiling rich-text content blocks & SEO tags...",
    "Writing to database & finalizing blog creation...",
  ];

  // Cycle through loading steps to show a gorgeous compiling animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  // Handle auto-close on success
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        onSuccess();
        onClose();
        setSelectedFile(null);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isSuccess, onSuccess, onClose]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".docx")) {
        setSelectedFile(file);
      } else {
        toast.error("Invalid file format. Please upload a .docx file.");
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.name.toLowerCase().endsWith(".docx")) {
        setSelectedFile(file);
      } else {
        toast.error("Invalid file format. Please upload a .docx file.");
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    try {
      await importBlog(selectedFile).unwrap();
      toast.success("Blog post imported successfully!");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to import blog post");
    }
  };

  const handleCancelFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Convert bytes to readable format
  const formatBytes = (bytes: number, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
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
              onClick={isLoading ? undefined : onClose}
              className="absolute inset-0 bg-dark-blue/40 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray flex flex-col"
            >
              {/* Header */}
              <div className="px-8 py-6 border-b border-gray flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-linear-to-r from-indigo-500 to-primary rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/10">
                    <Sparkles className="w-5 h-5 text-white animate-pulse" />
                  </div>
                  <div>
                    <h3 className="h3 leading-none">Import Blog Post</h3>
                    <p className="extra-small-paragraph uppercase tracking-widest mt-1 text-dark-blue/40">
                      Import structured articles directly from MS Word
                    </p>
                  </div>
                </div>
                {!isLoading && (
                  <GhostButton
                    onClick={onClose}
                    className="p-2 -mr-2 text-dark-blue/40 hover:text-dark-blue hover:bg-gray rounded-xl"
                  >
                    <X className="w-5 h-5" />
                  </GhostButton>
                )}
              </div>

              {/* Content Panel */}
              <div className="p-8 space-y-6">
                {!isLoading && !isSuccess && (
                  <>
                    <p className="small-paragraph">
                      Upload a `.docx` file authored in accordance with the <strong>QuillForge Blog Writing Guide</strong>. The system will compile metadata, extract cover images, and map formatted content blocks instantly. You can also download a <a href={`${import.meta.env.VITE_API_URL}/admin/blogs/import/template`} download className="text-primary font-bold hover:underline">writing guide template</a> here.
                    </p>

                    {/* Drag and Drop Zone */}
                    <div
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={selectedFile ? undefined : triggerFileInput}
                      className={`relative rounded-3xl border-2 border-dashed transition-all p-8 flex flex-col items-center justify-center cursor-pointer min-h-55 ${
                        dragActive
                          ? "border-primary bg-primary/5"
                          : selectedFile
                          ? "border-green/30 bg-green/5 cursor-default"
                          : "border-gray hover:border-primary/40 hover:bg-light-blue/20"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept=".docx"
                        onChange={handleFileChange}
                        className="hidden"
                      />

                      {selectedFile ? (
                        <div className="flex flex-col items-center text-center gap-4 w-full">
                          <div className="w-16 h-16 rounded-2xl bg-green/10 border border-green/20 flex items-center justify-center text-green">
                            <FileText className="w-8 h-8" />
                          </div>
                          <div className="min-w-0 max-w-full">
                            <p className="text-sm font-black text-dark-blue truncate px-4">
                              {selectedFile.name}
                            </p>
                            <p className="extra-small-paragraph font-bold text-dark-blue/40 mt-1 uppercase tracking-widest">
                              {formatBytes(selectedFile.size)} • Word Document
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={handleCancelFile}
                              className="px-4 py-2 border border-gray rounded-xl text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 bg-white shadow-sm transition-all"
                            >
                              Choose Another
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center text-center gap-3">
                          <div className="w-16 h-16 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/70">
                            <UploadCloud className="w-8 h-8" />
                          </div>
                          <div>
                            <p className="text-sm font-bold text-dark-blue">
                              Drag & drop your .docx file here
                            </p>
                            <p className="extra-small-paragraph text-dark-blue/40 mt-1">
                              or click to browse local files
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </>
                )}

                {/* Loading State / Compiling */}
                {isLoading && (
                  <div className="flex flex-col items-center text-center py-8 space-y-6">
                    <div className="relative w-24 h-24 flex items-center justify-center">
                      <motion.div
                        className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
                      />
                      <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                    </div>

                    <div className="space-y-2 w-full max-w-xs">
                      <h4 className="h4 text-primary">Compiling Blog Post</h4>
                      <p className="text-xs font-black text-dark-blue/30 uppercase tracking-widest">
                        Document Processor
                      </p>
                    </div>

                    {/* Step-by-Step logs */}
                    <div className="w-full bg-light-blue/20 rounded-2xl border border-gray p-4 text-left">
                      <div className="flex items-center gap-3 text-primary text-xs font-bold animate-pulse">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        <span>{loadingSteps[loadingStep]}</span>
                      </div>
                      <div className="mt-3 w-full bg-gray h-1 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          animate={{ width: `${((loadingStep + 1) / loadingSteps.length) * 100}%` }}
                          transition={{ duration: 0.5 }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Success State */}
                {isSuccess && (
                  <div className="flex flex-col items-center text-center py-12 space-y-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-16 h-16 rounded-full bg-green flex items-center justify-center text-white shadow-lg shadow-green/20"
                    >
                      <CheckCircle className="w-8 h-8" />
                    </motion.div>
                    <div>
                      <h3 className="h3 text-green">Import Complete!</h3>
                      <p className="extra-small-paragraph text-dark-blue/40 mt-1 uppercase tracking-widest">
                        Publication Created Successfully
                      </p>
                    </div>
                  </div>
                )}

                {/* Error Diagnostics */}
                {error && !isLoading && (
                  <div className="bg-red-50 rounded-2xl border border-red-100 p-5 flex gap-3 text-red-700">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div className="space-y-1">
                      <p className="text-xs font-black uppercase tracking-widest">Import Failed</p>
                      <p className="text-xs font-bold leading-normal text-red-600">
                        {(error as any)?.data?.detail || "An unexpected parser error occurred while compiling your Word document. Please verify the metadata matches the required values."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {!isLoading && !isSuccess && (
                <div className="px-8 py-5 border-t border-gray bg-light-blue/10 flex justify-end gap-3 shrink-0">
                  <SecondaryButton
                    onClick={onClose}
                    className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    onClick={handleStartImport}
                    disabled={!selectedFile}
                    className="px-8 bg-linear-to-r from-indigo-500 to-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-40"
                  >
                    Start Import
                    <ArrowRight className="w-3.5 h-3.5" />
                  </PrimaryButton>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BlogImportModal;
