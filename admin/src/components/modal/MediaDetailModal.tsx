import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Trash2,
  RefreshCw,
  Check,
  Copy,
  ExternalLink,
  FileText,
  AlertTriangle,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  PrimaryButton,
  SecondaryButton,  
} from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";
import SelectField from "@/components/ui/Form/SelectField";
import { useGetAllFoldersQuery } from "@/services/api";

const schema = yup.object().shape({
  name: yup.string().required("File name is required").min(2, "Name too short"),
  altText: yup.string().nullable(),
  folderId: yup.string().nullable(),
});

type MediaFormValues = yup.InferType<typeof schema>;

interface MediaDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: Media;
  onUpdate: (data: {
    id: string;
    name?: string;
    altText?: string | null;
    folderId?: string | null;
  }) => Promise<ApiResponse<Media>>;
  onReplace: (data: { id: string; file: File }) => Promise<ApiResponse<Media>>;
  onDelete: (id: string) => Promise<ApiResponse<SuccessResponse>>;
  canWrite?: boolean;
}

const MediaDetailModal: React.FC<MediaDetailModalProps> = ({
  isOpen,
  onClose,
  item,
  onUpdate,
  onReplace,
  onDelete,
  canWrite = true,
}) => {
  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: foldersResponse } = useGetAllFoldersQuery();
  const folders = foldersResponse?.data;

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<MediaFormValues>({
    resolver: yupResolver(schema) as any,
    defaultValues: {
      name: item?.name || "",
      altText: item?.altText || "",
      folderId: item?.folderId || "",
    },
  });

  useEffect(() => {
    if (item) {
      reset({
        name: item.name,
        altText: item.altText || "",
        folderId: item.folderId || "",
      });
      setIsConfirmingDelete(false);
    }
  }, [item, reset]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(item.url);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(item.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const onFormSubmit = async (data: MediaFormValues) => {
    setIsSaving(true);
    try {
      await onUpdate({
        id: item.id,
        name: data.name,
        altText: data.altText,
        folderId: data.folderId,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const handleReplace = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSaving(true);
      try {
        await onReplace({ id: item.id, file });
        onClose();
      } finally {
        setIsSaving(false);
      }
    }
  };

  const handleDelete = async () => {
    setIsSaving(true);
    try {
      await onDelete(item.id);
      setIsConfirmingDelete(false);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !item) return null;

  const dateFormatted = new Date(item.createdAt).toLocaleDateString('en-US', { 
    day: 'numeric', 
    month: 'short', 
    year: 'numeric' 
  });
  
  const extension = item.mimeType?.split("/")[1]?.toUpperCase() || "FILE";
  const folderOptions = [
    { label: "Root (Media Library)", value: "" },
    ...(folders?.map((f) => ({ label: f.name, value: f.id })) || []),
  ];

  return (
    <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-dark-blue/20 backdrop-blur-md"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 10 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray flex flex-col md:flex-row h-full max-h-[85vh]"
      >
        <form
          onSubmit={handleSubmit(onFormSubmit)}
          className="flex flex-col md:flex-row w-full overflow-hidden"
        >
          <div className="w-full md:w-[45%] flex flex-col bg-light-blue/10 border-r border-gray">
            <div className="flex-1 flex items-center justify-center p-8 overflow-hidden relative group">
              {item.mimeType?.startsWith("image/") ? (
                <div className="relative h-full w-full flex items-center justify-center bg-white rounded-2xl border border-gray shadow-inner p-4 overflow-hidden">
                  <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'conic-gradient(#000 90deg, #fff 90deg 180deg, #000 180deg 270deg, #fff 270deg)', backgroundSize: '20px 20px' }} />
                  <img
                    src={item.url}
                    alt={item.name}
                    className="max-w-full max-h-full object-contain relative z-10"
                  />
                </div>
              ) : item.mimeType?.startsWith("video/") ? (
                <div className="relative h-full w-full flex items-center justify-center bg-white rounded-2xl border border-gray shadow-inner p-4 overflow-hidden">
                  <video
                    src={item.url}
                    controls
                    className="max-w-full max-h-full rounded-2xl relative z-10"
                  />
                </div>
              ) : item.mimeType?.endsWith("/pdf") || item.mimeType === "application/pdf" ? (
                <div className="relative h-full w-full bg-white rounded-2xl border border-gray shadow-inner overflow-hidden">
                  <iframe
                    src={item.url}
                    className="w-full h-full border-none"
                    title={item.name}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-white rounded-2xl border border-gray gap-4">
                  <FileText className="w-16 h-16 text-dark-blue/10" />
                  <span className="text-xs font-black text-dark-blue/30 uppercase tracking-widest">{extension} Document</span>
                </div>
              )}
            </div>

            <div className="px-8 pb-8 space-y-4">
              <div className="grid grid-cols-1 gap-2">
                 <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray">
                    <div>
                       <p className="extra-small-paragraph uppercase tracking-widest mb-1">Asset ID (UUID)</p>
                       <p className="text-xs font-bold text-dark-blue truncate max-w-50">{item.id}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleCopyId}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${copiedId ? 'bg-green text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                    >
                      {copiedId ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{copiedId ? 'Copied' : 'Copy'}</span>
                    </button>
                 </div>

                 <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray">
                    <div>
                       <p className="extra-small-paragraph uppercase tracking-widest mb-1">Asset Link</p>
                       <p className="text-xs font-bold text-dark-blue truncate max-w-50">{item.url}</p>
                    </div>
                    <button 
                      type="button" 
                      onClick={handleCopyUrl}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg transition-all ${copiedUrl ? 'bg-green text-white' : 'bg-primary/5 text-primary hover:bg-primary/10'}`}
                    >
                      {copiedUrl ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{copiedUrl ? 'Copied' : 'Copy'}</span>
                    </button>
                 </div>

                 <div className="flex items-center gap-2">
                    <button 
                      type="button" 
                      onClick={() => window.open(item.url, "_blank")}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View Full
                    </button>
                    {canWrite && (
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white rounded-xl border border-gray text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all shadow-sm"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        Replace
                      </button>
                    )}
                 </div>
              </div>

              <div className="p-4 bg-white/50 rounded-xl border border-dashed border-gray flex flex-wrap gap-4 justify-between items-center">
                 <div className="space-y-1">
                    <p className="extra-small-paragraph uppercase tracking-widest">Format</p>
                    <p className="text-xs font-black text-dark-blue">{extension}</p>
                 </div>
                 {item.width && item.height && (
                   <div className="space-y-1">
                      <p className="extra-small-paragraph uppercase tracking-widest">Dimension</p>
                      <p className="text-xs font-black text-dark-blue">{item.width} × {item.height}</p>
                   </div>
                 )}
                 <div className="space-y-1">
                    <p className="extra-small-paragraph uppercase tracking-widest">Weight</p>
                    <p className="text-xs font-black text-dark-blue">{(item.size / 1024).toFixed(1)} KB</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="flex-1 p-10 flex flex-col bg-white overflow-y-auto custom-scrollbar">
            <div className="flex items-center justify-between mb-8">
               <div>
                  <h3 className="h3">Asset Details</h3>
                  <p className="extra-small-paragraph uppercase tracking-widest mt-1">Uploaded {dateFormatted}</p>
               </div>
               <button 
                type="button" 
                onClick={onClose}
                className="w-10 h-10 flex items-center justify-center bg-gray/50 hover:bg-gray rounded-xl transition-all"
               >
                 <X className="w-5 h-5 text-dark-blue/40" />
               </button>
            </div>
            <fieldset disabled={!canWrite} className="space-y-8 flex-1">
               <TextField
                label="Filename"
                {...register("name")}
                error={errors.name}
                placeholder="Image name..."
               />

               <TextField
                label="Alt Text"
                {...register("altText")}
                error={errors.altText}
                placeholder="Search engine description..."
               />

               <SelectField
                label="Location"
                options={folderOptions}
                {...register("folderId")}
                error={errors.folderId}
               />

               {canWrite && (
                 <div className="pt-4 space-y-4">
                    <p className="extra-small-paragraph font-black uppercase tracking-widest border-b border-gray pb-2">Danger Zone</p>
                    
                    <AnimatePresence mode="wait">
                      {!isConfirmingDelete ? (
                        <motion.button 
                          key="delete-btn"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          type="button"
                          onClick={() => setIsConfirmingDelete(true)}
                          className="flex items-center gap-3 text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="text-xs font-black uppercase tracking-widest">Delete Asset Permanently</span>
                        </motion.button>
                      ) : (
                        <motion.div 
                          key="confirm-delete"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-3"
                        >
                          <div className="flex items-center gap-2 text-red-600">
                            <AlertTriangle className="w-4 h-4" />
                            <p className="text-[10px] font-black uppercase tracking-widest">Are you absolutely sure?</p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleDelete}
                              disabled={isSaving}
                              className="flex-1 bg-red-500 text-white py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-red-600 transition-all shadow-sm shadow-red-500/20"
                            >
                              {isSaving ? "Deleting..." : "Yes, Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setIsConfirmingDelete(false)}
                              className="flex-1 bg-white text-dark-blue/60 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest border border-gray hover:bg-gray transition-all"
                            >
                              Cancel
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                 </div>
               )}
            </fieldset>

            <div className="flex items-center gap-4 pt-8 mt-8 border-t border-gray w-full">
              {!canWrite ? (
                <PrimaryButton
                  type="button"
                  onClick={onClose}
                  className="w-full py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                >
                  Close
                </PrimaryButton>
              ) : (
                <>
                  <SecondaryButton
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-4 rounded-xl font-black uppercase tracking-widest text-xs"
                  >
                    Cancel
                  </SecondaryButton>
                  <PrimaryButton
                    type="submit"
                    disabled={isSaving || !isDirty}
                    className="flex-[1.5] py-4 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </PrimaryButton>
                </>
              )}
            </div>
          </div>
        </form>

        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleReplace}
        />
      </motion.div>
    </div>
  );
};

export default MediaDetailModal;
