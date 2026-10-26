import React from "react";
import { ArrowUpRight } from "lucide-react";
import { PrimaryButton } from "@/components/ui/Button";

interface RevisionDetailHeaderProps {
  selectedRev: any;
  isRestoring: boolean;
  formatDate: (date: string) => string;
  handleRestore: (revisionId: string, revisionNumber: number) => Promise<void>;
}

export const RevisionDetailHeader: React.FC<RevisionDetailHeaderProps> = ({
  selectedRev,
  isRestoring,
  formatDate,
  handleRestore,
}) => {
  return (
    <div className="bg-light-blue/10 border border-light-blue/20 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <div>
        <div className="flex items-center gap-2.5">
          <h4 className="text-lg font-black text-dark-blue">
            {selectedRev.isCurrent ? "Current Draft" : `Revision #${selectedRev.revisionNumber || selectedRev.revision_number}`}
          </h4>
          {selectedRev.isCurrent && (
            <span className="text-[10px] font-extrabold bg-green-500/10 text-green-600 px-2 py-0.5 rounded-full border border-green-500/20">
              Active Editor State
            </span>
          )}
        </div>
        <p className="text-xs text-dark-blue/60 mt-1 font-medium">
          {selectedRev.isCurrent ? "Last edited" : "Saved on"}{" "}
          <span className="font-bold">{formatDate(selectedRev.createdAt || selectedRev.created_at)}</span>
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!selectedRev.isCurrent && (
          <PrimaryButton
            onClick={() => handleRestore(selectedRev.id, selectedRev.revisionNumber || selectedRev.revision_number)}
            disabled={isRestoring}
            className="py-2.5 px-4 text-xs flex items-center gap-1.5 shrink-0 font-bold"
          >
            Restore Version
            <ArrowUpRight className="w-3.5 h-3.5" />
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
