import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import TextField from "@/components/ui/Form/TextField";
import { BlogFormValues } from "../schema";
import { NextAppUrl } from "@/components/shared/NextAppUrl";

interface BlogIdentitySectionProps {
  register: UseFormRegister<BlogFormValues>;
  errors: FieldErrors<BlogFormValues>;
  handleTitleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  slug?: string;
}

const BlogIdentitySection: React.FC<BlogIdentitySectionProps> = ({
  register,
  errors,
  handleTitleChange,
  slug,
}) => (
  <section className="space-y-6">
    <h3 className="h4">Article Identity</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="md:col-span-2">
        <TextField
          label="Blog Title"
          placeholder="e.g. 10 Best Kitchen Sinks for Modern Kitchens"
          error={errors.title}
          {...register("title")}
          onChange={handleTitleChange}
        />
      </div>
      <div className="md:col-span-2">
        <TextField
          label="URL Slug"
          placeholder="e.g. best-kitchen-sinks-modern-kitchens"
          error={errors.slug}
          {...register("slug")}
        />
        {slug && <NextAppUrl path={`/blog/${slug}`} mode="edit" />}
      </div>
      <div className="md:col-span-2">
        <TextField
          label="Excerpt / Brief Summary"
          placeholder="Short overview describing this post on lists and SEO summaries..."
          isTextArea
          rows={3}
          error={errors.excerpt}
          {...register("excerpt")}
        />
      </div>
    </div>
  </section>
);

export default BlogIdentitySection;
