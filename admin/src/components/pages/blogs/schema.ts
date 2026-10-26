import * as yup from "yup";

export enum BlogSectionType {
  CONTENT = "content",
  CTA = "cta",
  SUMMARY = "summary",
  MEDIA = "media",
  EMBED = "embed",
  CODE = "code",
  QUOTE = "quote",
  FAQ = "faq",
  WIDGET_CALCULATOR = "widget_calculator",
  WIDGET_QUIZ = "widget_quiz",
  WIDGET_POLL = "widget_poll",
}

export const blogSchema = yup.object({
  title: yup.string().required("Title is required").max(500, "Title cannot exceed 500 characters"),
  slug: yup
    .string()
    .required("Slug is required")
    .matches(/^[a-z0-9-]+$/, "Slug must only contain lowercase letters, numbers, and hyphens")
    .max(500, "Slug cannot exceed 500 characters"),
  excerpt: yup.string().nullable().optional(),
  publishDate: yup.string().required("Publish date is required"),
  readTime: yup.number().typeError("Read time must be a number").integer().min(1, "Read time must be at least 1 minute").default(5),
  isPublished: yup.boolean().default(false),
  isFeatured: yup.boolean().default(false),
  displayOrder: yup.number().typeError("Display order must be a number").integer().default(0),
  categoryId: yup.string().nullable().optional(),
  authorId: yup.string().required("Author is required"),
  bannerImageId: yup.string().nullable().test("required", "Banner image is required", val => !!val),
  bannerImage: yup.mixed().nullable().test("required", "Banner image is required", val => !!val),
  tagIds: yup.array().of(yup.string().required()).default([]),
  sections: yup
    .array()
    .of(
      yup.object({
        id: yup.string().nullable().optional(),
        title: yup.string().nullable().optional(),
        content: yup.mixed().nullable().optional(),
        sectionType: yup.string().oneOf(Object.values(BlogSectionType)).default(BlogSectionType.CONTENT),
        displayOrder: yup.number().integer().default(0),
        mediaId: yup.string().nullable().optional(),
        media: yup.mixed().nullable().optional(),
        ctaButtonText: yup.string().nullable().optional(),
        ctaButtonUrl: yup.string().nullable().optional(),
        embedUrl: yup.string().nullable().optional(),
        embedProvider: yup.string().nullable().optional(),
        codeBlock: yup.string().nullable().optional(),
        codeLanguage: yup.string().nullable().optional(),
        subSections: yup
          .array()
          .of(
            yup.object({
              id: yup.string().nullable().optional(),
              title: yup.string().nullable().optional(),
              content: yup.mixed().nullable().optional(),
              displayOrder: yup.number().integer().default(0),
              mediaId: yup.string().nullable().optional(),
              media: yup.mixed().nullable().optional(),
            })
          )
          .default([]),
      })
    )
    .default([]),
  seo: yup
    .object({
      metaTitle: yup.string().required("Meta title is required"),
      metaDescription: yup.string().required("Meta description is required"),
      metaKeywords: yup.string().required("Meta keywords are required"),
      metaImageId: yup.string().nullable().optional(),
      metaImage: yup.mixed().nullable().optional(),
      metaRobots: yup.string().required("Meta robots directive is required"),
      jsonLd: yup.array().of(
        yup.object({
          id: yup.string().required("Schema ID is required"),
          schema: yup.string().default("{}").test(
            "valid-json",
            "Must be valid JSON",
            (val) => {
              try {
                JSON.parse(val || "{}");
                return true;
              } catch {
                return false;
              }
            }
          ).required()
        })
      ).default([]),
    })
    .required(),
});

export type BlogFormValues = yup.InferType<typeof blogSchema>;
