import * as React from "react";
import { motion } from "framer-motion";
import {
  X,
  Move,
  Folder as FolderIcon,
  Layers,
  CheckCircle2,
} from "lucide-react";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
} from "@/components/ui/Button";
import SearchBar from "@/components/ui/SearchBar";

interface MoveModalProps {
  isOpen: boolean;
  onClose: () => void;
  folders: Folder[];
  onMove: (folderId: string | null) => void;
  selectedCount: number;
}

const MoveModal: React.FC<MoveModalProps> = ({
  isOpen,
  onClose,
  folders,
  onMove,
  selectedCount,
}) => {
  const [search, setSearch] = React.useState("");
  const [selectedFolderId, setSelectedFolderId] = React.useState<string | null>(
    null,
  );

  const filteredFolders = React.useMemo(() => {
    return (
      folders?.filter((f) =>
        f.name.toLowerCase().includes(search.toLowerCase()),
      ) || []
    );
  }, [folders, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-120 flex items-center justify-center p-4">
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
        className="relative w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-gray flex items-center justify-between bg-light-blue/5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Move className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h3 className="h3 leading-none">Move Assets</h3>
              <p className="extra-small-paragraph text-dark-blue/30 uppercase tracking-widest mt-2">
                Relocating {selectedCount} items
              </p>
            </div>
          </div>
          <GhostButton
            onClick={onClose}
            className="p-2 -mr-2 text-dark-blue/40 hover:text-dark-blue hover:bg-gray rounded-xl"
          >
            <X className="w-6 h-6" />
          </GhostButton>
        </div>

        <div className="p-6 border-b border-gray">
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Find target folder..."
            className="w-full"
          />
        </div>

        <div className="flex-1 max-h-100 overflow-y-auto p-4 space-y-2 scrollbar-hide">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${selectedFolderId === null ? "bg-primary text-white shadow-xl shadow-primary/20" : "hover:bg-primary/5 text-dark-blue"}`}
          >
            <div className="flex items-center gap-4">
              <Layers
                className={`w-5 h-5 ${selectedFolderId === null ? "text-white" : "text-dark-blue/20"}`}
              />
              <span className="text-xs font-black uppercase tracking-widest">
                Root Media Library
              </span>
            </div>
            {selectedFolderId === null && (
              <CheckCircle2 className="w-5 h-5 text-white" />
            )}
          </button>

          {filteredFolders.map((folder) => (
            <button
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all ${selectedFolderId === folder.id ? "bg-primary text-white shadow-xl shadow-primary/20" : "hover:bg-primary/5 text-dark-blue"}`}
            >
              <div className="flex items-center gap-4">
                <FolderIcon
                  className={`w-5 h-5 ${selectedFolderId === folder.id ? "text-white" : "text-dark-blue/20"}`}
                />
                <span className="text-xs font-black uppercase tracking-widest">
                  {folder.name}
                </span>
              </div>
              {selectedFolderId === folder.id && (
                <CheckCircle2 className="w-5 h-5 text-white" />
              )}
            </button>
          ))}

          {filteredFolders.length === 0 && search && (
            <div className="py-12 text-center">
              <p className="small-paragraph text-dark-blue/20 italic">
                No matching folders found
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-gray bg-light-blue/5 flex items-center justify-end gap-4">
          <SecondaryButton
            onClick={onClose}
            className="px-8 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest"
          >
            Cancel
          </SecondaryButton>
          <PrimaryButton
            disabled={selectedFolderId === undefined}
            onClick={() => onMove(selectedFolderId)}
            className="px-10 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20"
          >
            Confirm Move
          </PrimaryButton>
        </div>
      </motion.div>
    </div>
  );
};

export default MoveModal;
