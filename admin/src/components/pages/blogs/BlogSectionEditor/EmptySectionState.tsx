import React from "react";
import { Layers } from "lucide-react";
import SectionAdderMenu from "./SectionAdderMenu";
import { BlogSectionType } from "../schema";

interface EmptySectionStateProps {
  isAddMenuOpen: boolean;
  setIsAddMenuOpen: (isOpen: boolean) => void;
  handleAddSection: (type: BlogSectionType) => void;
}

const EmptySectionState: React.FC<EmptySectionStateProps> = ({
  isAddMenuOpen,
  setIsAddMenuOpen,
  handleAddSection,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 border-2 border-dashed border-gray rounded-xl bg-gray/5 space-y-6">
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-md">
        <Layers className="w-6 h-6 text-primary/45 animate-pulse" />
      </div>
      <div className="text-center">
        <p className="text-sm font-bold text-dark-blue/75">
          No sections added yet
        </p>
        <p className="extra-small-paragraph text-dark-blue/30 mt-1 max-w-sm">
          Dynamically structure your post layout by adding a Content Section,
          CTA Banner, or Summary block below
        </p>
      </div>

      <SectionAdderMenu
        isAddMenuOpen={isAddMenuOpen}
        setIsAddMenuOpen={setIsAddMenuOpen}
        handleAddSection={handleAddSection}
        label="Add First Section"
        direction="down"
      />
    </div>
  );
};

export default EmptySectionState;
