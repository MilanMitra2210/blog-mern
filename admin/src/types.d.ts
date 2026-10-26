declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}
type ProviderType = "GOOGLE" | "MANUAL" | "FACEBOOK" | "APPLE" | "LINKEDIN";

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: string[];
}

interface User {
  id: string;
  name?: string;
  email: string;
  active: boolean;
  role: "ADMIN" | "USER";
  role_id?: string | null;
  roleId?: string | null;
  role_rel?: Role;
  roleRel?: Role;
  site?: Site;
  blocked?: boolean;
  blockReason?: string;
  block_reason?: string;
  provider?: ProviderType;
  facebookId?: string;
  image?: string | Media;
  image_id?: string;
  imageId?: string;
  password?: string;
  linkedinId?: string;
  siteId?: string | null;
  site_id?: string | null;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: { id: string; name: string; role: string } | null;
  updatedBy?: { id: string; name: string; role: string } | null;
  tenantId?: string;
  tenant_id?: string;
}

interface ApiResponse<T> {
  success: boolean;
  detail: string;
  data: T;
}

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  tokenType?: string;
}

interface LoginResponse {
  user: User;
  tokens: TokenResponse;
}

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface SuccessResponse {
  success: boolean;
  detail?: string;
  message?: string;
}

interface MessageResponse {
  message: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest extends Partial<User> {
  confirmPassword: string;
}

interface ForgotPasswordRequest {
  email: string;
}

interface ResetPasswordRequest {
  confirmPassword: string;
  password: string;
  token: string;
}

interface VerifyInvitationRequest {
  confirmPassword: string;
  password: string;
  token: string;
}

interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

interface SocialLoginRequest {
  idToken?: string;
  accessToken?: string;
}

interface SEOSchema {
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  metaRobots?: string;
  metaImageId?: string;
  metaImage?: Media;
  jsonLd?: { id: string; schema: any }[];
}

interface Category {
  id: string;
  slug: string;
  name: string;
  label?: string;
  description?: string;
  heroImageUrl?: string;
  displayOrder: number;
  isUpcoming: boolean;
  isActive: boolean;
  catalogId?: string;
  catalog?: Media;
  contentBlocks?: { id?: string; content: any }[];
  seo?: SEOSchema;
}

interface SubCategory {
  id: string;
  slug: string;
  name: string;
  title?: string;
  description?: string;
  heroImageUrl?: string;
  displayOrder: number;
  isActive: boolean;
  categoryId: string;
  catalogId?: string;
  catalog?: Media;
  contentBlocks?: { id?: string; content: any }[];
  seo?: SEOSchema;
}

interface CategoryWithSubs extends Category {
  subCategories: SubCategory[];
}

interface ProductVariant {
  id: string;
  sku: string;
  barcode?: string;
  title?: string;
  price: number;
  compareAtPrice?: number;
  costPrice?: number;
  currencyCode: string;
  inventoryQuantity: number;
  lowStockThreshold: number;
  allowBackorder: boolean;
  weightValue?: number;
  weightUnit?: string;
  dimensions?: Record<string, string>;
  isDefault: boolean;
  isActive: boolean;
  isPurchasable: boolean;
  displayOrder: number;
  colorName?: string;
  colorHex?: string;
  primarySizeValue?: string;
  primarySizeUnit?: string;
  secondarySizeValue?: string;
  secondarySizeUnit?: string;
  imageUrl?: string;
  attributeValues?: VariantAttributeValue[];
  media?: ProductMedia[];
}

interface Attribute {
  id: string;
  name: string;
  slug: string;
  dataType: string;
  inputType: string;
  unit?: string;
  isVariantDefining: boolean;
  isFilterable: boolean;
}

interface AttributeValue {
  id: string;
  attributeId: string;
  value: string;
  label: string;
  slug: string;
  colorHex?: string;
  sortValue?: number;
}

interface VariantAttributeValue {
  id: string;
  attributeId: string;
  attributeValueId: string;
  attribute?: Attribute;
  attributeValue?: AttributeValue;
}

interface ProductBadge {
  id: string;
  label: string;
  displayOrder?: number;
}

interface ProductMedia {
  id: string;
  mediaId: string;
  role?: string;
  url: string;
  altText?: string;
  displayOrder: number;
}

interface ProductContentBlock {
  id: string;
  placement: string;
  blockType: string;
  title?: string;
  subtitle?: string;
  payload: Record<string, unknown>;
  isActive: boolean;
  displayOrder: number;
}


interface SeriesComparison {
  id: string;
  titlePrefix?: string;
  titleHighlight?: string;
  titleSuffix?: string;
  subtitle?: string;
  modelsList: string[];
  highlightIndex: number;
  rows: any[];
}

interface AboutSeries {
  id: string;
  titlePrefix?: string;
  titleHighlight?: string;
  paragraphs: string[];
}

interface BreadcrumbItem {
  label: string;
  link: string;
}

interface ProductFilterValue {
  id: string;
  filterGroupId: string;
  filterOptionId: string;
  filterGroup?: FilterGroup;
  filterOption?: FilterOption;
}

interface ProductSpecification {
  id: string;
  specKey: string;
  label: string;
  value: string;
  unit?: string | null;
  groupName?: string | null;
  displayOrder: number;
}

interface Product {
  id: string;
  slug: string;
  sku?: string;
  name: string;
  inventory?: number;
  description?: string;
  price: number;
  compareAtPrice?: number;
  isBestseller: boolean;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  categoryId: string;
  subCategoryId?: string;
  variants: ProductVariant[];
  badges: ProductBadge[];
  media: ProductMedia[];
  contentBlocks: ProductContentBlock[];
  filterValues?: ProductFilterValue[];
  specifications?: ProductSpecification[];
  seriesComparison?: SeriesComparison;
  aboutSeries?: AboutSeries;
  seo?: SEOSchema;
  breadcrumb: BreadcrumbItem[];
}

interface FilterOption {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
  subGroup?: string | null;
  colorCode?: string | null;
  mediaId?: string | null;
  media?: Media | null;
}

interface FilterGroup {
  id: string;
  categoryId: string;
  subCategoryId?: string;
  filterKey: string;
  label: string;
  isSingleSelect: boolean;
  displayOrder: number;
  options: FilterOption[];
}

interface FilterGroupList extends FilterGroup {
  categoryName: string;
  subCategoryName?: string;
  optionsCount: number;
}

interface UpcomingProduct {
  id: string;
  title: string;
  description?: string;
  imageId?: string | null;
  image?: Media | null;
  displayOrder: number;
  isActive: boolean;
  seo?: SEOSchema;
}

interface Video {
  id: string;
  tag: string;
  title: string;
  description?: string;
  videoUrl: string;
  thumbnailId?: string | null;
  thumbnail?: Media | null;
  date: string;
  author?: string;
  isFeatured: boolean;
  isActive: boolean;
  displayOrder: number;
  seo?: SEOSchema;
}

interface Catalog {
  id: string;
  title: string;
  description?: string;
  thumbnailId?: string | null;
  thumbnail?: Media | null;
  pdfId?: string | null;
  pdf?: Media | null;
  pages?: string;
  categoryId?: string | null;
  category?: Category | null;
  isUpcoming: boolean;
  isActive: boolean;
  displayOrder: number;
}



interface Folder {
  id: string;
  name: string;
  parentId?: string | null;
}

interface Media {
  id: string;
  name: string;
  altText?: string | null;
  key: string;
  url: string;
  size: number;
  mimeType: string;
  folderId?: string | null;
  width?: number | null;
  height?: number | null;
  createdAt: string;
  updatedAt: string;
}

interface MediaPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface MediaResponse {
  files: Media[];
  folders: Folder[];
  pagination: MediaPagination;
}

// ---- Blog System ----

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdBy?: { id: string; name: string; role: string } | null;
  updatedBy?: { id: string; name: string; role: string } | null;
}

interface BlogAuthor {
  id: string;
  name: string;
  bio?: string;
  designation?: string;
  image?: Media;
  createdBy?: { id: string; name: string; role: string } | null;
  updatedBy?: { id: string; name: string; role: string } | null;
}

interface BlogSubSection {
  id?: string;
  title?: string;
  content?: string;
  displayOrder: number;
  mediaId?: string | null;
  media?: Media | null;
}

interface BlogSection {
  id?: string;
  title?: string;
  content?: string;
  sectionType: "content" | "summary" | "cta";
  displayOrder: number;
  mediaId?: string | null;
  media?: Media | null;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  subSections: BlogSubSection[];
}

interface Tag {
  id: string;
  name: string;
  slug: string;
  siteId?: string;
  createdBy?: { id: string; name: string; role: string } | null;
  updatedBy?: { id: string; name: string; role: string } | null;
}

interface BlogMetric {
  id: string;
  blogId: string;
  views: number;
  likes: number;
  readProgressCount: number;
  completions?: number;
  completionRate?: number;
  googleViews?: number;
  twitterViews?: number;
  linkedinViews?: number;
  directViews?: number;
  otherViews?: number;
  uniqueViews?: number;
  mobileViews?: number;
  tabletViews?: number;
  desktopViews?: number;
}

interface BlogRevision {
  id: string;
  blogId: string;
  title: string;
  excerpt?: string;
  revisionNumber: number;
  createdAt: string;
  sections_data?: any[];
}

interface Blog {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  publishDate?: string;
  readTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  avgRating: number;
  totalRatings: number;
  totalComments?: number;
  category?: BlogCategory;
  categoryId?: string;
  author?: BlogAuthor;
  authorId?: string;
  bannerImage?: Media;
  bannerImageId?: string;
  sections?: BlogSection[];
  seo?: SEOSchema;
  tags?: Tag[];
  tagIds?: string[];
  metrics?: BlogMetric;
  createdAt?: string;
  createdBy?: { id: string; name: string; role: string } | null;
  updatedBy?: { id: string; name: string; role: string } | null;
}


interface Site {
  id: string;
  name: string;
  domain: string;
  themeColor: string;
  logoUrl?: string;
  adsenseClientId?: string;
  analyticsId?: string;
  isActive: boolean;
  seo?: SEOSchema;
}

interface BlogComment {
  id: string;
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  approved: boolean;
  parentId?: string;
  createdAt: string;
  isAdmin: boolean;
  postTitle?: string;
  postSlug?: string;
}

interface PostMetricBreakdown {
  id: string;
  title: string;
  slug: string;
  views: number;
  likes: number;
  comments: number;
  completions: number;
  completionRate: number;
  entityType?: "blog" | "cms_page";
  googleViews?: number;
  twitterViews?: number;
  linkedinViews?: number;
  directViews?: number;
  uniqueViews?: number;
  mobileViews?: number;
  tabletViews?: number;
  desktopViews?: number;
}

interface TimelineDataPoint {
  date: string;
  views: number;
  likes: number;
  comments: number;
  reach: number;
}

interface AnalyticsSummaryResponse {
  totalViews: number;
  totalLikes: number;
  totalComments: number;
  totalCompletions: number;
  averageCompletionRate: number;
  overallReach: number;
  googleViews?: number;
  twitterViews?: number;
  linkedinViews?: number;
  directViews?: number;
  totalUniqueViews?: number;
  mobileViews?: number;
  tabletViews?: number;
  desktopViews?: number;
  topPosts: PostMetricBreakdown[];
  timeline: TimelineDataPoint[];
}

interface UtmCampaignMetricDto {
  id: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  views: number;
  uniqueViews: number;
}



