import React from "react";
import {
  UseFormRegister,
  FieldErrors,
  UseFormWatch,
  UseFormSetValue,
} from "react-hook-form";
import TextField from "@/components/ui/Form/TextField";
import ImagePickerField from "@/components/ui/Form/ImagePickerField";
import SEOJsonLdFields from "./SEOJsonLdFields";
import clsx from "clsx";

interface SEOFieldsProps {
  register: UseFormRegister<any>;
  errors: FieldErrors<any>;
  watch: UseFormWatch<any>;
  setValue: UseFormSetValue<any>;
  control: any;
  basePath?: string;
  className?: string;
}

const SEOFields: React.FC<SEOFieldsProps> = ({
  register,
  errors,
  watch,
  setValue,
  control,
  basePath = "seo",
  className = "",
}) => {
  const getPath = (field: string) =>
    basePath ? `${basePath}.${field}` : field;

  const getError = (field: string) => {
    if (!basePath) return (errors as any)[field];
    return (errors as any)[basePath]?.[field];
  };

  const selectedMedia = watch(getPath("metaImage"));

  const handleMediaSelect = (media: Media) => {
    setValue(getPath("metaImageId"), media.id, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(getPath("metaImage"), media, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const handleClearMedia = () => {
    setValue(getPath("metaImageId"), null, {
      shouldValidate: true,
      shouldDirty: true,
    });
    setValue(getPath("metaImage"), null, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  return (
    <section className={clsx("space-y-6", className)}>
      <div className="flex items-center justify-between">
        <h3 className="h4">Metadata & SEO</h3>
        <span className="px-3 py-1 bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest rounded-lg">
          Google Search Preview
        </span>
      </div>

      <div className="space-y-6">
        <TextField
          label="Meta Title"
          placeholder="Search engine title"
          maxLength={60}
          currentLength={watch(getPath("metaTitle"))?.length}
          error={getError("metaTitle")}
          {...register(getPath("metaTitle"))}
        />

        <TextField
          label="Meta Description"
          placeholder="Brief description for search results"
          isTextArea
          rows={3}
          maxLength={160}
          currentLength={watch(getPath("metaDescription"))?.length}
          error={getError("metaDescription")}
          {...register(getPath("metaDescription"))}
        />

        <TextField
          label="Meta Keywords"
          placeholder="e.g. furniture, sofa, decor (comma separated)"
          error={getError("metaKeywords")}
          {...register(getPath("metaKeywords"))}
        />

        <div className="pt-6 border-t border-gray/50 space-y-6">
          <ImagePickerField
            label="Social Media Preview Image"
            selectedMedia={selectedMedia}
            onSelectMedia={handleMediaSelect}
            onClearMedia={handleClearMedia}
            register={register}
            name={getPath("metaImageId")}
            error={getError("metaImage") || getError("metaImageId")}
            aspectRatio="seo"
            recommendedSize="Recommended 1200x630px"
            placeholderText="Select Meta Image"
            modalTitle="Select SEO Meta Image"
          />

          <TextField
            label="Meta Robots"
            placeholder="index, follow"
            error={getError("metaRobots")}
            {...register(getPath("metaRobots"))}
          />
        </div>
        
        <SEOJsonLdFields
          register={register}
          control={control}
          errors={errors}
          watch={watch}
          basePath={getPath("jsonLd")}
        />
      </div>
    </section>
  );
};

export default SEOFields;
