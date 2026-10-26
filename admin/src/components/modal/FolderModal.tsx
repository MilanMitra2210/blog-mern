import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, FolderPlus } from "lucide-react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { PrimaryButton, GhostButton, SecondaryButton } from "@/components/ui/Button";
import TextField from "@/components/ui/Form/TextField";

const folderSchema = yup.object({
  name: yup.string().required("Folder name is required").max(50, "Name is too long"),
});

type FolderFormValues = yup.InferType<typeof folderSchema>;

interface FolderModalProps {
  isOpen: boolean;
  onClose: () => void;
  parentId?: string;
  onCreate: (data: { name: string; parentId?: string }) => Promise<ApiResponse<Folder>>;
}

const FolderModal: React.FC<FolderModalProps> = ({ isOpen, onClose, parentId, onCreate }) => {
  const [isCreating, setIsCreating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FolderFormValues>({
    resolver: yupResolver(folderSchema),
    defaultValues: {
      name: "",
    },
  });

  const onFormSubmit = async (values: FolderFormValues) => {
    setIsCreating(true);
    try {
      await onCreate({ name: values.name, parentId });
      reset();
      onClose();
    } finally {
      setIsCreating(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
      <AnimatePresence>
        {isOpen && (
          <>
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
              className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-white/20"
            >
              <div className="px-10 py-8 border-b border-gray flex items-center justify-between bg-white">
                <h2 className="h2 uppercase tracking-tighter">New Folder</h2>
                <GhostButton onClick={onClose} className="p-3 -mr-3 rounded-2xl bg-gray/50 hover:bg-gray">
                  <X className="w-5 h-5" />
                </GhostButton>
              </div>
              
              <form onSubmit={handleSubmit(onFormSubmit)} className="p-6 space-y-8">
                <div className="flex flex-col items-center gap-6">
                  <div className="w-20 h-20 bg-primary/5 rounded-2xl flex items-center justify-center text-primary">
                    <FolderPlus className="w-10 h-10" />
                  </div>
                  <div className="text-center">
                    <p className="large-paragraph font-black text-dark-blue tracking-tight">Create a new category</p>
                    <p className="extra-small-paragraph font-bold text-dark-blue/30 uppercase tracking-widest mt-1">Keep your assets organized</p>
                  </div>
                </div>

                <TextField
                  label="Folder Title"
                  placeholder="e.g. Summer Collection 2024"
                  error={errors.name}
                  autoFocus
                  {...register("name")}
                />

                <div className="flex gap-4 pt-4">
                  <SecondaryButton type="button" onClick={onClose} className="flex-1 py-5 rounded-xl font-black uppercase tracking-widest text-xs">Discard</SecondaryButton>
                  <PrimaryButton 
                    type="submit"
                    disabled={isCreating}
                    className="flex-1 py-5 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                  >
                    {isCreating ? 'Creating...' : 'Create Folder'}
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

export default FolderModal;
