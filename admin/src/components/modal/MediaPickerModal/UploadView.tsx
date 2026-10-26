import React from "react";
import { Upload, Trash2 } from "lucide-react";
import { GhostButton } from "@/components/ui/Button";

interface UploadViewProps {
  selectedFile: File | null;
  altText: string;
  onFileChange: (files: FileList | null) => void;
  onAltTextChange: (text: string) => void;
  onRemoveFile: () => void;
  allowedMimeTypes?: string[];
}

export const UploadView: React.FC<UploadViewProps> = ({
  selectedFile,
  altText,
  onFileChange,
  onAltTextChange,
  onRemoveFile,
  allowedMimeTypes,
}) => {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {!selectedFile ? (
        <div
          className="border-4 border-dashed border-gray rounded-2xl p-12 flex flex-col items-center justify-center gap-6 hover:border-primary/20 hover:bg-primary/5 transition-all relative cursor-pointer min-h-80"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            onFileChange(e.dataTransfer.files);
          }}
        >
          <div className="w-20 h-20 bg-gray rounded-3xl flex items-center justify-center text-dark-blue/20">
            <Upload className="w-10 h-10" />
          </div>
          <div className="text-center">
            <p className="large-paragraph font-black text-dark-blue">
              Drop your file here, or click to browse
            </p>
            <p className="extra-small-paragraph font-bold text-dark-blue/30 mt-1 uppercase tracking-wider">
              {allowedMimeTypes ? `Allowed formats: ${allowedMimeTypes.join(', ')}` : "Single image upload"} (Max 10MB)
            </p>
          </div>
          <input
            type="file"
            accept={allowedMimeTypes ? allowedMimeTypes.join(',') : "image/*"}
            className="absolute inset-0 opacity-0 cursor-pointer"
            onChange={(e) => onFileChange(e.target.files)}
          />
        </div>
      ) : (
        <div className="space-y-8">
          <div className="flex items-center gap-4 p-4 bg-light-blue/10 rounded-2xl border border-gray group">
            <div className="w-20 h-20 rounded-xl overflow-hidden border border-gray bg-white shrink-0 flex items-center justify-center">
              {selectedFile.type.startsWith("image/") ? (
                <img
                  src={URL.createObjectURL(selectedFile)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-[10px] font-black uppercase text-dark-blue/30 tracking-widest">
                  {selectedFile.name.split('.').pop()?.toUpperCase() || "FILE"}
                </span>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="small-paragraph font-bold text-dark-blue truncate">
                {selectedFile.name}
              </p>
              <p className="extra-small-paragraph text-dark-blue/30 uppercase tracking-widest">
                {(selectedFile.size / 1024).toFixed(1)} KB
              </p>
            </div>
            <GhostButton
              type="button"
              onClick={onRemoveFile}
              className="p-3 text-red-500 hover:bg-red-50 rounded-xl"
            >
              <Trash2 className="w-5 h-5" />
            </GhostButton>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-dark-blue/40 ml-1 block">
              Accessibility Alt Text (SEO)
            </label>
            <input
              type="text"
              value={altText}
              onChange={(e) => onAltTextChange(e.target.value)}
              placeholder="Briefly describe this image for SEO and screen readers..."
              className="input-field w-full rounded-xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};
