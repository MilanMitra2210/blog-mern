import React, { useEffect, useState, Suspense, useMemo } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import clsx from "clsx";
import {
  useGetBlogCategoriesQuery,
  useGetBlogAuthorsQuery,
  useCreateBlogCategoryMutation,
  useCreateBlogAuthorMutation,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useGetBlogByIdQuery,
  useGetBlogTagsQuery,
} from "@/services/api";
import { blogSchema, BlogFormValues, BlogSectionType } from "./schema";
import SEOFields from "@/components/pages/seo/SEOFields";
import BlogSectionEditor from "./BlogSectionEditor";
import BlogIdentitySection from "./BlogSectionEditor/BlogIdentitySection";
import BlogMetadataSection from "./BlogSectionEditor/BlogMetadataSection";
import BlogBannerSection from "./BlogSectionEditor/BlogBannerSection";
import BlogVisibilitySection from "./BlogSectionEditor/BlogVisibilitySection";
import {
  PrimaryButton,
  SecondaryButton,
  GhostButton,
} from "@/components/ui/Button";
import {
  FileText,
  Layers,
  Globe,
  ArrowLeft,
  Check,
  Sparkles,
  BookOpen,
  History,
} from "lucide-react";

// Modals
import BlogCategoryModal from "@/components/modal/BlogCategoryModal";
import BlogAuthorModal from "@/components/modal/BlogAuthorModal";
import BlogRevisionsModal from "@/components/modal/BlogRevisionsModal";
import { SEOAuditorSidebar } from "./SEOAuditorSidebar";

enum BlogTab {
  GENERAL = "general",
  SECTIONS = "sections",
  SEO = "seo",
}

const BlogEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isEdit = !!id;

  const currentTabParam = searchParams.get("tab");

  const activeTab = useMemo(() => {
    if (
      currentTabParam &&
      Object.values(BlogTab).includes(currentTabParam as BlogTab)
    ) {
      return currentTabParam as BlogTab;
    }
    return BlogTab.GENERAL;
  }, [currentTabParam]);

  const changeTab = (tabId: BlogTab) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.set("tab", tabId);
        return next;
      },
      { replace: true }
    );
  };

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAuthorModalOpen, setIsAuthorModalOpen] = useState(false);
  const [isSeoAuditorOpen, setIsSeoAuditorOpen] = useState(true);

  const { data: blogData, isLoading: isBlogLoading, refetch: refetchBlog } = useGetBlogByIdQuery(
    id || "",
    {
      skip: !isEdit,
    },
  );

  const { data: categoriesResponse, refetch: refetchCategories } =
    useGetBlogCategoriesQuery();
  const { data: authorsResponse, refetch: refetchAuthors } =
    useGetBlogAuthorsQuery();

  const [createCategory, { isLoading: isCreatingCat }] =
    useCreateBlogCategoryMutation();
  const [createAuthor, { isLoading: isCreatingAuthor }] =
    useCreateBlogAuthorMutation();

  const [createBlog, { isLoading: isCreatingBlog }] = useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdatingBlog }] = useUpdateBlogMutation();

  const [isRevisionsOpen, setIsRevisionsOpen] = useState(false);
  const { data: tagsResponse } = useGetBlogTagsQuery();

  const tagsData = tagsResponse?.data as any;
  const tags: Tag[] = Array.isArray(tagsData)
    ? tagsData
    : tagsData && "items" in tagsData
    ? tagsData.items
    : [];

  const categoriesData = categoriesResponse?.data;
  const categories: BlogCategory[] = Array.isArray(categoriesData)
    ? categoriesData
    : categoriesData && "items" in categoriesData
    ? categoriesData.items
    : [];

  const authorsData = authorsResponse?.data;
  const authors: BlogAuthor[] = Array.isArray(authorsData)
    ? authorsData
    : authorsData && "items" in authorsData
    ? authorsData.items
    : [];

  const defaultValues: BlogFormValues = {
    title: "",
    slug: "",
    excerpt: "",
    publishDate: "",
    readTime: 5,
    isPublished: false,
    isFeatured: false,
    displayOrder: 0,
    categoryId: null,
    authorId: "",
    bannerImageId: null,
    bannerImage: null,
    tagIds: [],
    sections: [],
    seo: {
      metaTitle: "",
      metaDescription: "",
      metaKeywords: "",
      metaImageId: null,
      metaImage: null,
      metaRobots: "",
      jsonLd: [],
    },
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm<BlogFormValues>({
    resolver: yupResolver(blogSchema) as any,
    defaultValues,
  });

  const selectedTagIds = (watch("tagIds") || []) as string[];

  const onToggleTag = (tagId: string) => {
    const current = (watch("tagIds") || []) as string[];
    const next = current.includes(tagId)
      ? current.filter((id) => id !== tagId)
      : [...current, tagId];
    setValue("tagIds", next, { shouldValidate: true, shouldDirty: true });
  };

  const isPublished = watch("isPublished");
  const isFeatured = watch("isFeatured");
  const bannerImage = watch("bannerImage") as Media | null;
  const slug = watch("slug");

  const titleVal = watch("title") || "";
  const metaTitleVal = watch("seo.metaTitle") || "";
  const metaDescriptionVal = watch("seo.metaDescription") || "";
  const excerptVal = watch("excerpt") || "";
  const sectionsVal = watch("sections") || [];

  const sectionsContentVal = useMemo(() => {
    return sectionsVal
      .map((s: any) => {
        let contentStr = "";
        if (s.content) {
          contentStr = typeof s.content === "string" ? s.content : JSON.stringify(s.content);
        }
        return `${s.title || ""} ${contentStr}`;
      })
      .join(" ");
  }, [sectionsVal]);

  const hasBannerImage = !!watch("bannerImageId") || !!bannerImage;
  const bannerImageAlt = bannerImage?.altText || "";

  useEffect(() => {
    if (isEdit && blogData?.data) {
      const b = blogData.data;
      reset({
        title: b.title,
        slug: b.slug,
        excerpt: b.excerpt || "",
        publishDate: b.publishDate ? b.publishDate.substring(0, 16) : "",
        readTime: b.readTime,
        isPublished: b.isPublished,
        isFeatured: b.isFeatured,
        displayOrder: b.displayOrder,
        categoryId: b.category?.id || (b as any).categoryId || null,
        authorId: b.author?.id || (b as any).authorId || ((b.author as any)?._id ? (b.author as any)._id.toString() : "") || (typeof b.author === 'string' ? b.author : "") || "",
        bannerImageId: b.bannerImage?.id || (b as any).bannerImageId || null,
        bannerImage: b.bannerImage || null,
        tagIds: b.tags?.map((t: any) => t.id) || [],
        sections:
          b.sections?.map((s: any) => ({
            ...s,
            sectionType: (s.sectionType || BlogSectionType.CONTENT) as BlogSectionType,
            content: s.content || "",
            mediaId: s.media?.id || s.mediaId || null,
            media: s.media || null,
            subSections:
              s.subSections?.map((ss: any) => ({
                ...ss,
                content: ss.content || "",
                mediaId: ss.media?.id || ss.mediaId || null,
                media: ss.media || null,
              })) || [],
          })) || [],
        seo: {
          metaTitle: b.seo?.metaTitle || "",
          metaDescription: b.seo?.metaDescription || "",
          metaKeywords: b.seo?.metaKeywords || "",
          metaImageId: b.seo?.metaImageId || null,
          metaImage: b.seo?.metaImage || null,
          metaRobots: b.seo?.metaRobots || "",
          jsonLd: (b.seo?.jsonLd || []).map((item: any) => ({
            id: item.id || "",
            schema: typeof item.schema === "string" ? item.schema : JSON.stringify(item.schema || {}, null, 2),
          })),
        },
      });
    }
  }, [isEdit, blogData, reset]);

  useEffect(() => {
    if (!isEdit && authors.length > 0 && !watch("authorId")) {
      setValue("authorId", authors[0].id, { shouldValidate: true });
    }
  }, [isEdit, authors, setValue, watch]);

  const generateSlug = (titleStr: string) => {
    return titleStr
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setValue("title", val, { shouldValidate: true, shouldDirty: true });
    if (!isEdit) {
      setValue("slug", generateSlug(val), {
        shouldValidate: true,
        shouldDirty: true,
      });
    }
  };

  const onSubmit = async (values: BlogFormValues) => {
    try {
      const { publishDate, ...restValues } = values;
      const payload = {
        ...restValues,
        tagIds: selectedTagIds,
        publishDate: publishDate
          ? new Date(publishDate).toISOString()
          : null,
        seo: values.seo ? {
          ...values.seo,
          jsonLd: (values.seo.jsonLd || []).map((item) => ({
            id: item.id,
            schema: JSON.parse(item.schema || "{}"),
          })),
        } : undefined,
      };

      if (isEdit) {
        await updateBlog({ id: id!, body: payload as any }).unwrap();
        toast.success("Blog updated successfully");
      } else {
        await createBlog(payload as any).unwrap();
        toast.success("Blog published successfully");
      }
      navigate("/blogs");
    } catch (err: any) {
      toast.error(err?.data?.detail || err?.message || "Action failed");
    }
  };

  const getTabHasError = (tabId: BlogTab) => {
    switch (tabId) {
      case BlogTab.GENERAL:
        return !!(
          errors.title ||
          errors.slug ||
          errors.excerpt ||
          errors.publishDate ||
          errors.readTime ||
          errors.categoryId ||
          errors.authorId ||
          errors.bannerImageId ||
          errors.bannerImage
        );
      case BlogTab.SECTIONS:
        return !!errors.sections;
      case BlogTab.SEO:
        return !!errors.seo;
      default:
        return false;
    }
  };

  const onError = (errors: any) => {
    if (
      errors.title ||
      errors.slug ||
      errors.excerpt ||
      errors.publishDate ||
      errors.readTime ||
      errors.categoryId ||
      errors.authorId ||
      errors.bannerImageId ||
      errors.bannerImage
    ) {
      changeTab(BlogTab.GENERAL);
    } else if (errors.sections) {
      changeTab(BlogTab.SECTIONS);
    } else if (errors.seo) {
      changeTab(BlogTab.SEO);
    }
  };

  const handleQuickCategorySubmit = async (data: {
    name: string;
    slug: string;
  }) => {
    try {
      const res = await createCategory(data).unwrap();
      refetchCategories();
      setValue("categoryId", res.data.id, { shouldDirty: true });
      setIsCategoryModalOpen(false);
      toast.success("Blog category created");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to create category");
    }
  };

  const handleQuickAuthorSubmit = async (data: {
    name: string;
    bio?: string;
    designation?: string;
    image_id?: string;
  }) => {
    try {
      const res = await createAuthor(data).unwrap();
      refetchAuthors();
      setValue("authorId", res.data.id, { shouldDirty: true });
      setIsAuthorModalOpen(false);
      toast.success("Blog author created");
    } catch (err: any) {
      toast.error(err?.data?.detail || "Failed to create author");
    }
  };

  const tabs = [
    {
      id: BlogTab.GENERAL,
      label: "Basic Settings",
      icon: FileText,
      desc: "Blog metadata, Author & Category",
    },
    {
      id: BlogTab.SECTIONS,
      label: "Blog Sections",
      icon: Layers,
      desc: "Order section paragraphs, CTA cards",
    },
    {
      id: BlogTab.SEO,
      label: "SEO Configuration",
      icon: Globe,
      desc: "Search engine title and previews",
    },
  ] as const;

  console.log({blogData})

  if (isEdit && isBlogLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Sparkles className="w-8 h-8 text-primary animate-spin" />
        <p className="text-xs font-bold text-dark-blue/40 uppercase tracking-widest">
          Loading blog configurations...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 h-full">
      {/* Header */}
      <div className="flex items-center gap-4 w-full">
        <GhostButton
          onClick={() => navigate("/blogs")}
          paddingClassName="p-2.5"
          className="rounded-xl border border-gray bg-white hover:bg-gray/50 text-dark-blue/60 transition-colors shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </GhostButton>
        <div className="min-w-0 flex-1">
          <h1 className="h1">{isEdit ? "Edit Blog Post" : "New Blog Post"}</h1>
          <p className="small-paragraph mt-1">
            Author premium publications with visual rich blocks and layouts
          </p>
        </div>
        {isEdit && (
          <SecondaryButton
            type="button"
            onClick={() => setIsRevisionsOpen(true)}
            className="h-11 rounded-xl px-4 py-2.5 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-dark-blue/60 hover:text-primary transition-all border border-gray cursor-pointer"
          >
            <History className="w-4 h-4 text-primary" />
            Revisions
          </SecondaryButton>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-gray overflow-hidden flex flex-col md:flex-row shadow-sm ">
        <div className="w-full md:w-72 bg-light-blue/20 border-r border-gray p-4 flex flex-col">
          <div className="mb-8">
            <h3 className="h4 flex items-center gap-2">
              <BookOpen className="w-4.5 h-4.5 text-primary" />
              Settings
            </h3>
            <p className="extra-small-paragraph text-dark-blue/30 uppercase tracking-widest mt-1">
              Publication Config
            </p>
          </div>

          <nav className="space-y-1.5 flex-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => changeTab(tab.id)}
                className={clsx(
                  "w-full flex items-start gap-3 p-3.5 rounded-2xl transition-all cursor-pointer text-left group",
                  activeTab === tab.id
                    ? "bg-white shadow-sm ring-1 ring-black/5"
                    : "hover:bg-white/50",
                )}
              >
                <div
                  className={clsx(
                    "mt-0.5 p-1.5 rounded-lg transition-colors",
                    activeTab === tab.id
                      ? "bg-primary text-white"
                      : "bg-dark-blue/5 text-dark-blue/40 group-hover:text-dark-blue/60",
                  )}
                >
                  <tab.icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <p
                      className={clsx(
                        "text-xs font-black uppercase tracking-wider",
                        activeTab === tab.id
                          ? "text-dark-blue"
                          : "text-dark-blue/40 group-hover:text-dark-blue/60",
                      )}
                    >
                      {tab.label}
                    </p>
                    {getTabHasError(tab.id) && (
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                    )}
                  </div>
                  <p className="text-[10px] text-dark-blue/30 font-medium mt-0.5 leading-tight">
                    {tab.desc}
                  </p>
                </div>
              </button>
            ))}
          </nav>

          <div className="pt-6 border-t border-gray space-y-3">
            <div className="flex items-center gap-3 px-3 py-2.5 bg-white/50 rounded-2xl border border-gray">
              <div
                className={clsx(
                  "w-2 h-2 rounded-full",
                  isPublished
                    ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"
                    : "bg-orange shadow-[0_0_8px_rgba(255,140,0,0.5)]",
                )}
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-dark-blue/50">
                Visibility: {isPublished ? "Published" : "Draft"}
              </span>
            </div>
            {isFeatured && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-500/5 border border-amber-500/10 text-amber-600 rounded-xl text-[10px] font-black uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5" />
                Featured Post
              </div>
            )}
            
            {isEdit && blogData?.data && (
              <div className="pt-4 border-t border-gray space-y-2 text-[10px] text-dark-blue/40 font-bold uppercase tracking-wider">
                {blogData.data && (
                  <div>
                    <span className="text-dark-blue/20">Created By:</span>
                    <p className="text-dark-blue/70 truncate mt-0.5">
                      {blogData.data.createdBy?.name || blogData.data.author?.name || (blogData.data.createdBy as any)?.email || "System"}
                    </p>
                  </div>
                )}
                {blogData.data.updatedBy && (
                  <div className="pt-1">
                    <span className="text-dark-blue/20">Updated By:</span>
                    <p className="text-dark-blue/70 truncate mt-0.5">{blogData.data.updatedBy.name || "Unknown"}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <form
            onSubmit={handleSubmit(onSubmit, onError)}
            className="flex flex-col flex-1 custom-scrollbar max-h-[calc(100vh-125px)]"
          >
            <div className="flex-1 overflow-y-auto px-6 space-y-8">
              <Suspense
                fallback={
                  <div className="flex items-center justify-center py-20">
                    <Sparkles className="w-6 h-6 text-primary animate-spin" />
                  </div>
                }
              >
                {activeTab === BlogTab.GENERAL && (
                  <div className="space-y-8 animate-fadeIn my-8">
                    <BlogIdentitySection
                      register={register}
                      errors={errors}
                      handleTitleChange={handleTitleChange}
                      slug={slug}
                    />

                    <BlogMetadataSection
                      register={register}
                      errors={errors}
                      authors={authors}
                      categories={categories}
                      tags={tags}
                      selectedTagIds={selectedTagIds}
                      onToggleTag={onToggleTag}
                      onAddAuthor={() => setIsAuthorModalOpen(true)}
                      onAddCategory={() => setIsCategoryModalOpen(true)}
                    />

                    <BlogBannerSection
                      bannerImage={bannerImage}
                      register={register}
                      setValue={setValue}
                      error={errors.bannerImage || errors.bannerImageId}
                    />

                    <BlogVisibilitySection
                      isPublished={isPublished}
                      isFeatured={isFeatured}
                      register={register}
                      onTogglePublish={() =>
                        setValue("isPublished", !isPublished, {
                          shouldDirty: true,
                        })
                      }
                      onToggleFeatured={() =>
                        setValue("isFeatured", !isFeatured, {
                          shouldDirty: true,
                        })
                      }
                    />
                  </div>
                )}

                {activeTab === BlogTab.SECTIONS && (
                  <div className="animate-fadeIn">
                    <BlogSectionEditor
                      control={control}
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                    />
                  </div>
                )}

                {activeTab === BlogTab.SEO && (
                  <div className="space-y-6 animate-fadeIn">
                    <SEOFields
                      register={register}
                      errors={errors}
                      watch={watch}
                      setValue={setValue}
                      control={control}
                      className="my-8"
                    />
                  </div>
                )}
              </Suspense>
            </div>

            {/* Footer Control Panel */}
            <div className="px-8 py-6 bg-white border-t border-gray flex items-center justify-end gap-3">
              <SecondaryButton type="button" onClick={() => navigate("/blogs")}>
                Cancel
              </SecondaryButton>
              <PrimaryButton
                type="submit"
                disabled={isCreatingBlog || isUpdatingBlog || (isEdit && !isDirty)}
              >
                {isCreatingBlog || isUpdatingBlog ? (
                  <Sparkles className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )}
                {isEdit ? "Save Changes" : "Publish Publication"}
              </PrimaryButton>
            </div>
          </form>
        </div>

        <SEOAuditorSidebar
          title={titleVal}
          metaTitle={metaTitleVal}
          metaDescription={metaDescriptionVal}
          excerpt={excerptVal}
          bannerImageAlt={bannerImageAlt}
          hasBannerImage={hasBannerImage}
          hasH2={sectionsVal.some((s: any) => s.title && s.title.trim().length > 0) || /<h2[^>]*>/i.test(sectionsContentVal) || sectionsContentVal.includes("## ")}
          isOpen={isSeoAuditorOpen}
          onToggle={() => setIsSeoAuditorOpen(!isSeoAuditorOpen)}
        />
      </div>

      <BlogCategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        onSubmit={handleQuickCategorySubmit}
        isLoading={isCreatingCat}
      />

      <BlogAuthorModal
        isOpen={isAuthorModalOpen}
        onClose={() => setIsAuthorModalOpen(false)}
        onSubmit={handleQuickAuthorSubmit}
        isLoading={isCreatingAuthor}
      />

      {isEdit && (
        <BlogRevisionsModal
          isOpen={isRevisionsOpen}
          onClose={() => setIsRevisionsOpen(false)}
          blogId={id!}
          onRestoreSuccess={refetchBlog}
          currentBlog={blogData?.data}
          categories={categories}
          authors={authors}
          tags={tags}
        />
      )}
    </div>
  );
};

export default BlogEditor;
