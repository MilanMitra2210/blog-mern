import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { UserCircle, Plus, Tag, Clock, Calendar } from "lucide-react";
import TextField from "@/components/ui/Form/TextField";
import { GhostButton } from "@/components/ui/Button";
import { BlogFormValues } from "../schema";

interface BlogMetadataSectionProps {
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  authors: BlogAuthor[];
  categories: BlogCategory[];
  tags: Tag[];
  selectedTagIds: string[];
  onToggleTag: (tagId: string) => void;
  onAddAuthor: () => void;
  onAddCategory: () => void;
}

const BlogMetadataSection: React.FC<BlogMetadataSectionProps> = ({
  register,
  errors,
  authors,
  categories,
  tags,
  selectedTagIds,
  onToggleTag,
  onAddAuthor,
  onAddCategory,
}) => (
  <section className="pt-8 border-t border-gray space-y-6">
    <h3 className="h4">Metadata & Classification</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
          Author <span className="text-red-500">*</span>
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-blue/30">
              <UserCircle className="w-4 h-4" />
            </div>
            <select
              {...register("authorId")}
              className="w-full pl-10 pr-4 py-2.5 bg-light-blue/50 border border-gray rounded-2xl text-sm appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Select Author...</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <GhostButton
            type="button"
            onClick={onAddAuthor}
            className="p-2.5 border border-gray rounded-2xl hover:bg-primary/5 text-primary transition-colors cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
          </GhostButton>
        </div>
        {errors.authorId && (
          <p className="text-xs text-red-500 mt-1 font-medium">{errors.authorId.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
          Category
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-blue/30">
              <Tag className="w-4 h-4" />
            </div>
            <select
              {...register("categoryId")}
              className="w-full pl-10 pr-4 py-2.5 bg-light-blue/50 border border-gray rounded-2xl text-sm appearance-none focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Select Category...</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <GhostButton
            type="button"
            onClick={onAddCategory}
            className="p-2.5 border border-gray rounded-2xl hover:bg-primary/5 text-primary transition-colors cursor-pointer"
          >
            <Plus className="w-4.5 h-4.5" />
          </GhostButton>
        </div>
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 translate-y-[10%] text-dark-blue/30 z-10">
          <Clock className="w-4 h-4" />
        </div>
        <TextField
          label="Read Time (Minutes)"
          type="number"
          placeholder="5"
          className="pl-10"
          error={errors.readTime}
          {...register("readTime")}
        />
      </div>

      <div className="relative">
        <div className="absolute left-3.5 top-1/2 translate-y-[10%] text-dark-blue/30 z-10">
          <Calendar className="w-4 h-4" />
        </div>
        <TextField
          label="Publish Date (Optional)"
          type="datetime-local"
          className="pl-10"
          error={errors.publishDate}
          {...register("publishDate")}
        />
      </div>

      <div className="space-y-2 col-span-1 md:col-span-2">
        <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
          Associated Tags
        </label>
        <div className="flex flex-wrap gap-2 p-4 bg-light-blue/20 rounded-2xl border border-gray min-h-15 items-center">
          {tags.length === 0 ? (
            <p className="text-xs text-dark-blue/40 font-medium">No tags available. Open the Tags panel from the blogs page to create one.</p>
          ) : (
            tags.map((tag) => {
              const isSelected = selectedTagIds.includes(tag.id);
              return (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => onToggleTag(tag.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none ${
                    isSelected
                      ? "bg-primary border-primary text-white shadow-md shadow-primary/20 scale-105 animate-pulse-once"
                      : "bg-white border-gray text-dark-blue/60 hover:border-dark-blue/30"
                  }`}
                >
                  #{tag.name}
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  </section>
);

export default BlogMetadataSection;
