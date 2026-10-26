import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, X, Image as ImageIcon, FileText, Trash2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PrimaryButton, GhostButton, SecondaryButton } from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";

const uploadSchema = yup.object({
  altText: yup.string().max(255, "Alt text is too long").optional().nullable(),
  files: yup.array().of(yup.mixed<File>()).min(1, "At least one file is required").required("Files are required"),
});

type UploadFormValues = yup.InferType<typeof uploadSchema>;

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  onUpload: (data: {
    files: File[];
    folderId?: string;
    altText?: string;
  }) => Promise<any>;
}

const UploadModal: React.FC<UploadModalProps> = ({ isOpen, onClose, folderId, onUpload }) => {
  const [isUploading, setIsUploading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UploadFormValues>({
    resolver: yupResolver(uploadSchema) as any,
    defaultValues: {
      altText: "",
      files: [],
    },
  });

  const selectedFiles = watch("files") || [];

  const handleFileChange = (newFiles: FileList | null) => {
    if (!newFiles) return;
    const filesArray = Array.from(newFiles);
    setValue("files", [...selectedFiles, ...filesArray], { shouldValidate: true });
  };

  const removeFile = (index: number) => {
    const updatedFiles = selectedFiles.filter((_, i) => i !== index);
    setValue("files", updatedFiles, { shouldValidate: true });
  };

  const onFormSubmit = async (values: UploadFormValues) => {
    if (!values.files || values.files.length === 0) return;

    setIsUploading(true);
    try {
      await onUpload({ 
        files: values.files as File[], 
        folderId, 
        altText: values.files.length === 1 ? (values.altText || undefined) : undefined
      });
      reset();
      onClose();
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-dark-blue/30 backdrop-blur-md" 
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 30 }}
            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
          >
            <div className="px-10 py-8 border-b border-gray flex items-center justify-between bg-white shrink-0">
              <div>
                <h2 className="h2 uppercase tracking-tighter">Upload Assets</h2>
                <p className="extra-small-paragraph font-bold text-dark-blue/30 uppercase tracking-widest mt-1">Bulk upload supported</p>
              </div>
              <GhostButton onClick={onClose} className="p-3 -mr-3 rounded-2xl bg-gray/50 hover:bg-gray">
                <X className="w-5 h-5" />
              </GhostButton>
            </div>
            
            <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
              <div 
                className={`border-4 border-dashed rounded-xl p-8 flex flex-col items-center justify-center gap-4 transition-all relative ${
                  selectedFiles.length > 0 ? 'border-primary/20 bg-primary/5' : errors.files ? 'border-red-500/20 bg-red-500/5' : 'border-gray hover:border-primary/20 hover:bg-primary/5'
                }`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { 
                  e.preventDefault(); 
                  handleFileChange(e.dataTransfer.files);
                }}
              >
                <div className="w-16 h-16 bg-gray rounded-2xl flex items-center justify-center text-dark-blue/10">
                  <Upload className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="large-paragraph font-black text-dark-blue">Drop your files here</p>
                  <p className="extra-small-paragraph font-bold text-dark-blue/30 mt-1 uppercase tracking-wider">Images, PDFs, and more (Max 10MB each)</p>
                </div>
                <input 
                  type="file" 
                  multiple
                  className="absolute inset-0 opacity-0 cursor-pointer" 
                  onChange={(e) => handleFileChange(e.target.files)}
                />
              </div>

              {selectedFiles.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-2">
                    <p className="extra-small-paragraph font-black text-dark-blue/30 uppercase tracking-[0.2em]">{selectedFiles.length} Files Selected</p>
                    <button 
                      type="button" 
                      onClick={() => setValue("files", [], { shouldValidate: true })}
                      className="extra-small-paragraph font-black text-red-500 uppercase tracking-widest hover:underline"
                    >
                      Clear All
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                    {selectedFiles.map((file, index) => (
                      <motion.div 
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={`${file?.name}-${index}`}
                        className="flex items-center gap-4 p-3 bg-light-blue/10 rounded-xl border border-gray group"
                      >
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0">
                          {file?.type.startsWith('image/') ? (
                            <ImageIcon className="w-5 h-5 text-primary" />
                          ) : (
                            <FileText className="w-5 h-5 text-dark-blue/40" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="small-paragraph font-bold text-dark-blue truncate">{file?.name}</p>
                          <p className="extra-small-paragraph text-dark-blue/30 uppercase tracking-widest">{(file?.size || 0 / 1024).toFixed(1)} KB</p>
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeFile(index)}
                          className="p-2 opacity-0 group-hover:opacity-100 text-red-500 hover:bg-red-50/50 rounded-lg transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFiles.length === 1 && (
                <TextField
                  label="Accessibility Alt Text"
                  placeholder="Briefly describe this image for SEO..."
                  error={errors.altText}
                  {...register("altText")}
                />
              )}

              {errors.files && (
                <p className="text-red-500 text-[10px] font-black uppercase tracking-widest text-center">
                  {errors.files.message}
                </p>
              )}

              <div className="flex gap-4 pt-4 sticky bottom-0 bg-white">
                <SecondaryButton type="button" onClick={onClose} className="flex-1 py-5 rounded-xl font-black uppercase tracking-widest text-xs">Cancel</SecondaryButton>
                <PrimaryButton 
                  type="submit" 
                  disabled={selectedFiles.length === 0 || isUploading}
                  className="flex-1 py-5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  {isUploading ? 'Uploading...' : `Complete Upload (${selectedFiles.length})`}
                </PrimaryButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default UploadModal;
