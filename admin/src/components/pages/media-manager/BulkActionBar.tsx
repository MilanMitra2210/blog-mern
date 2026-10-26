import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Move, Trash2, X, CheckCircle2 } from "lucide-react";
import { GhostButton } from "@/components/ui/Button";

interface BulkActionBarProps {
  selectedCount: number;
  isDeleting: boolean;
  onClearSelection: () => void;
  onMoveOpen: () => void;
  onDeleteToggle: (isDeleting: boolean) => void;
  onConfirmDelete: () => void;
}

const BulkActionBar: React.FC<BulkActionBarProps> = ({
  selectedCount,
  isDeleting,
  onClearSelection,
  onMoveOpen,
  onDeleteToggle,
  onConfirmDelete,
}) => {
  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0, scale: 0.9 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 100, opacity: 0, scale: 0.9 }}
          className="fixed bottom-12 left-1/2 -translate-x-1/2 z-100 flex items-center p-2 bg-dark-blue rounded-[2.5rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.6)] border border-white/10 text-white min-w-[500px]"
        >
          <div className="flex-1 px-8 py-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/20 rounded-2xl flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-black text-white">
                  {selectedCount} Assets
                </p>
                <p className="text-[10px] font-bold text-white/30 uppercase tracking-widest">
                  Bulk Actions
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2">
            <AnimatePresence mode="wait">
              {isDeleting ? (
                <motion.div
                  key="confirm-delete"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={() => onDeleteToggle(false)}
                    className="px-6 h-14 bg-white/5 hover:bg-white/10 rounded-3xl transition-colors font-black text-[10px] uppercase tracking-widest border border-white/5 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={onConfirmDelete}
                    className="flex items-center gap-3 px-8 h-14 bg-red-500 hover:bg-red-600 text-white rounded-3xl transition-all font-black text-[10px] uppercase tracking-widest shadow-lg shadow-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Confirm Delete
                  </button>
                </motion.div>
              ) : (
                <motion.div
                  key="normal-actions"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center gap-2"
                >
                  <button
                    onClick={onMoveOpen}
                    className="flex items-center gap-3 px-8 h-14 bg-white/5 hover:bg-white/10 rounded-3xl transition-colors font-black text-[10px] uppercase tracking-widest border border-white/5 cursor-pointer"
                  >
                    <Move className="w-4 h-4" />
                    Move
                  </button>

                  <button
                    onClick={() => onDeleteToggle(true)}
                    className="flex items-center gap-3 px-8 h-14 bg-red-500/10 hover:bg-red-500 hover:text-white text-red-500 rounded-3xl transition-all font-black text-[10px] uppercase tracking-widest border border-red-500/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>

                  <GhostButton
                    onClick={onClearSelection}
                    paddingClassName="p-0"
                    className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-3xl text-white/30 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </GhostButton>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default BulkActionBar;
