import React from "react";
import { UseFormRegister, UseFormSetValue } from "react-hook-form";
import { BlogFormValues } from "../schema";
import ImagePickerField from "@/components/ui/Form/ImagePickerField";

interface BlogBannerSectionProps {
  bannerImage: Media | null;
  register: UseFormRegister<BlogFormValues>;
  setValue: UseFormSetValue<BlogFormValues>;
  error?: any;
}

const BlogBannerSection: React.FC<BlogBannerSectionProps> = ({
  bannerImage,
  register,
  setValue,
  error,
}) => {
  const handleSelect = (media: Media) => {
    setValue("bannerImageId", media.id, { shouldValidate: true, shouldDirty: true });
    setValue("bannerImage", media, { shouldValidate: true, shouldDirty: true });
  };

  const handleClear = () => {
    setValue("bannerImageId", null, { shouldValidate: true, shouldDirty: true });
    setValue("bannerImage", null, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <section className="pt-8 border-t border-gray">
      <ImagePickerField
        label="Banner Cover Image"
        selectedMedia={bannerImage}
        onSelectMedia={handleSelect}
        onClearMedia={handleClear}
        register={register}
        name="bannerImageId"
        error={error}
        aspectRatio="banner"
        recommendedSize="Landscape 1200x500px suggested"
        placeholderText="Select Banner Cover"
        modalTitle="Select Banner Cover"
      />
    </section>
  );
};

export default BlogBannerSection;
