import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { RedirectRow } from "./columns";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading: boolean;
  row: RedirectRow | null;
}

const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  isLoading,
  row,
}) => {
  if (!row) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 bg-dark-blue/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl border border-gray"
          >
            <h3 className="h3 mb-2">Delete Redirect</h3>
            <p className="small-paragraph mb-6">
              Are you sure you want to delete the redirect from{" "}
              <strong>"/{row.oldSlug}"</strong> to{" "}
              <strong>"/{row.currentSlug}"</strong>? This will result in 404 errors for clients trying to reach the old URL.
            </p>
            <div className="flex justify-end gap-3">
              <SecondaryButton
                onClick={onClose}
                className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest"
              >
                Cancel
              </SecondaryButton>
              <PrimaryButton
                onClick={onConfirm}
                disabled={isLoading}
                className="px-6 rounded-xl text-[10px] font-black uppercase tracking-widest bg-red-500 hover:bg-red-600 shadow-red-500/20"
              >
                {isLoading ? "Deleting..." : "Delete"}
              </PrimaryButton>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default DeleteConfirmModal;
