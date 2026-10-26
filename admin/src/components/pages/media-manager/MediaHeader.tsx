import React from "react";
import { Upload, FolderPlus } from "lucide-react";
import SearchBar from "@/components/ui/SearchBar";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";

interface MediaHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onFolderCreate: () => void;
  onUpload: () => void;
  isSearching: boolean;
  canWrite?: boolean;
}

const MediaHeader: React.FC<MediaHeaderProps> = ({
  searchQuery,
  onSearchChange,
  onFolderCreate,
  onUpload,
  isSearching,
  canWrite = true,
}) => {
  return (
    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 border-b border-gray pb-10">
      <div className="space-y-4">
        <h1 className="h1 tracking-tightest">
          Media <span className="text-primary">Library</span>
        </h1>
        <p className="small-paragraph text-dark-blue/40 max-w-md">
          {isSearching
            ? "Showing matching assets for your search query."
            : "Manage your digital workspace with precision and style."}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
        <SearchBar
          value={searchQuery}
          onChange={onSearchChange}
          placeholder="Search assets..."
          className="w-full sm:w-80"
        />
        {canWrite && (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <SecondaryButton
              onClick={onFolderCreate}
              className="flex-1 sm:flex-none"
              paddingClassName="py-2.5 px-6"
            >
              <FolderPlus className="w-4 h-4 mr-2" />
              Folder
            </SecondaryButton>
            <PrimaryButton
              onClick={onUpload}
              className="flex-1 sm:flex-none shadow-xl shadow-primary/20"
              paddingClassName="py-2.5 px-6"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaHeader;
