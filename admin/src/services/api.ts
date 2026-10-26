import { createApi } from "@reduxjs/toolkit/query/react";
import { baseQueryWithReauth, baseUrl } from "./baseQuery";

export enum ApiTag {
  ME = "ME",
  MEDIA = "MEDIA",
  USERS = "USERS",
  BLOGS = "BLOGS",
  BLOG_CATEGORIES = "BLOG_CATEGORIES",
  BLOG_AUTHORS = "BLOG_AUTHORS",
  BLOG_REDIRECTS = "BLOG_REDIRECTS",
  BLOG_TAGS = "BLOG_TAGS",
  ROLES = "ROLES",
  COMMENTS = "COMMENTS",
}

export const api = createApi({
  reducerPath: "api",
  tagTypes: Object.values(ApiTag),
  baseQuery: baseQueryWithReauth,
  endpoints: (builder) => ({
    // ---- Auth & User ----
    me: builder.query<ApiResponse<User>, void>({
      query: () => `/users/me`,
      providesTags: [ApiTag.ME],
    }),
    login: builder.mutation<ApiResponse<LoginResponse>, LoginRequest>({
      query: (body) => ({ url: `/users/login`, method: "POST", body }),
    }),
    register: builder.mutation<ApiResponse<User>, RegisterRequest>({
      query: (body) => ({ url: `/users/register`, method: "POST", body }),
    }),
    updateUser: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (body) => ({ url: `/users/${body.id}`, method: "PUT", body }),
      invalidatesTags: [ApiTag.ME, ApiTag.USERS],
    }),
    createUser: builder.mutation<ApiResponse<User>, Partial<User>>({
      query: (body) => ({ url: `/users`, method: "POST", body }),
      invalidatesTags: [ApiTag.USERS],
    }),
    getUsers: builder.query<
      ApiResponse<PaginatedResponse<User>>,
      {
        page: number;
        limit: number;
        search?: string;
        role?: string;
        status?: string;
      } | void
    >({
      query: (params) => ({
        url: `/users`,
        params: params || undefined,
      }),
      providesTags: [ApiTag.USERS],
    }),
    deleteUser: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({ url: `/users/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTag.USERS],
    }),
    logout: builder.mutation<ApiResponse<SuccessResponse>, void>({
      query: () => ({ url: `/users/logout`, method: "POST" }),
    }),
    forgotPassword: builder.mutation<
      ApiResponse<MessageResponse>,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: `/users/forgot-password`,
        method: "POST",
        body,
      }),
    }),
    resetPassword: builder.mutation<
      ApiResponse<MessageResponse>,
      ResetPasswordRequest
    >({
      query: (body) => ({ url: `/users/reset-password`, method: "POST", body }),
    }),
    verfiyInvitation: builder.mutation<
      ApiResponse<MessageResponse>,
      VerifyInvitationRequest
    >({
      query: (body) => ({
        url: `/users/verify-invitation`,
        method: "POST",
        body,
      }),
    }),
    changePassword: builder.mutation<
      ApiResponse<SuccessResponse & MessageResponse>,
      ChangePasswordRequest
    >({
      query: (body) => ({
        url: `/users/change-password`,
        method: "POST",
        body,
      }),
    }),

    // ---- Roles ----
    getRoles: builder.query<ApiResponse<Role[]>, void>({
      query: () => `/admin/roles`,
      providesTags: [ApiTag.ROLES],
    }),
    getAvailablePermissions: builder.query<ApiResponse<{ key: string; label: string; group: string }[]>, void>({
      query: () => `/admin/roles/permissions`,
    }),
    createRole: builder.mutation<ApiResponse<Role>, Partial<Role>>({
      query: (body) => ({ url: `/admin/roles/`, method: "POST", body }),
      invalidatesTags: [ApiTag.ROLES],
    }),
    updateRole: builder.mutation<ApiResponse<Role>, Partial<Role>>({
      query: (body) => ({ url: `/admin/roles/${body.id}`, method: "PUT", body }),
      invalidatesTags: [ApiTag.ROLES],
    }),
    deleteRole: builder.mutation<ApiResponse<void>, string>({
      query: (id) => ({ url: `/admin/roles/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTag.ROLES],
    }),


    getRevalidateModels: builder.query<ApiResponse<{ name: string; label: string; slugPrefix: string }[]>, void>({
      query: () => `/admin/revalidate/models`,
    }),
    triggerRevalidate: builder.mutation<ApiResponse<SuccessResponse>, { model: string; slug?: string | null; action?: string }>({
      query: (body) => ({
        url: `/admin/revalidate`,
        method: "POST",
        body,
      }),
    }),
    upgradeTenantSubscription: builder.mutation<ApiResponse<string>, string>({
      query: (tenantId) => ({
        url: `/admin/mock-subscription/upgrade`,
        method: "POST",
        params: { tenantId },
      }),
    }),
    cancelTenantSubscription: builder.mutation<ApiResponse<string>, string>({
      query: (tenantId) => ({
        url: `/admin/mock-subscription/cancel`,
        method: "POST",
        params: { tenantId },
      }),
    }),
    getMockSubscriptionTenants: builder.query<ApiResponse<string[]>, void>({
      query: () => ({
        url: `/admin/mock-subscription/tenants`,
        method: "GET",
      }),
    }),

    getDashboardStats: builder.query<ApiResponse<{
      totalBlogs: number;
      totalEnquiries: number;
      pendingEnquiries: number;
      recentBlogs: any[];
      recentEnquiries: any[];
      analytics: AnalyticsSummaryResponse;
    }>, void>({
      query: () => `/dashboard/stats`,
      providesTags: [ApiTag.BLOGS, ApiTag.COMMENTS],
    }),
    getRealtimeActiveReaders: builder.query<
      {
        totalActive: number;
        entityActive: number;
        activePosts: Record<string, number>;
        activeCountries: Record<string, number>;
      },
      { token: string; entityId?: string; entityType?: string }
    >({
      queryFn: () => ({
        data: {
          totalActive: 0,
          entityActive: 0,
          activePosts: {},
          activeCountries: {},
        },
      }),
      async onCacheEntryAdded(
        arg,
        { updateCachedData, cacheDataLoaded, cacheEntryRemoved }
      ) {
        if (!arg.token) return;

        try {
          await cacheDataLoaded;
        } catch {}

        const apiBaseUrl = baseUrl || "/api/v1";
        const queryParams = new URLSearchParams();
        queryParams.set("token", arg.token);
        if (arg.entityId) queryParams.set("entityId", arg.entityId);
        if (arg.entityType) queryParams.set("entityType", arg.entityType);

        const sseUrl = apiBaseUrl.startsWith("http")
          ? `${apiBaseUrl}/admin/analytics/realtime/stream?${queryParams.toString()}`
          : `${window.location.origin}${apiBaseUrl}/admin/analytics/realtime/stream?${queryParams.toString()}`;

        const eventSource = new EventSource(sseUrl);

        eventSource.addEventListener("active-metrics", (event) => {
          try {
            const data = JSON.parse(event.data);
            updateCachedData((draft) => {
              draft.totalActive = data.totalActive || 0;
              draft.entityActive = data.entityActive || 0;
              draft.activePosts = data.activePosts || {};
              draft.activeCountries = data.activeCountries || {};
            });
          } catch (err) {
            console.error("Error parsing real-time active metrics", err);
          }
        });

        await cacheEntryRemoved;
        eventSource.close();
      },
    }),
    getAnalyticsPosts: builder.query<
      ApiResponse<{
        items: PostMetricBreakdown[];
        total: number;
        page: number;
        limit: number;
      }>,
      {
        page?: number;
        limit?: number;
        search?: string;
        sortBy?: string;
      } | void
    >({
      query: (params) => ({
        url: `/dashboard/analytics/posts`,
        params: params
          ? {
              page: params.page,
              limit: params.limit,
              search: params.search,
              sort_by: params.sortBy,
            }
          : undefined,
      }),
      providesTags: [ApiTag.BLOGS, ApiTag.COMMENTS],
    }),
    getUtmMetrics: builder.query<
      ApiResponse<UtmCampaignMetricDto[]>,
      { entityId: string; entityType: string }
    >({
      query: ({ entityId, entityType }) => ({
        url: `/admin/analytics/utm`,
        params: { entityId, entityType },
      }),
    }),
    getEngagementMetrics: builder.query<
      ApiResponse<{
        id: string;
        entityId: string;
        entityType: string;
        milestone25: number;
        milestone50: number;
        milestone75: number;
        milestone100: number;
        totalViews: number;
      }>,
      { entityId: string; entityType: string }
    >({
      query: ({ entityId, entityType }) => ({
        url: `/admin/analytics/engagement`,
        params: { entityId, entityType },
      }),
    }),
    getGeoMetrics: builder.query<
      ApiResponse<Array<{
        id: string;
        entityId: string;
        entityType: string;
        countryCode: string;
        views: number;
        uniqueViews: number;
      }>>,
      { entityId: string; entityType: string }
    >({
      query: ({ entityId, entityType }) => ({
        url: `/admin/analytics/geo`,
        params: { entityId, entityType },
      }),
    }),

    // ---- Social Login ----
    loginByApple: builder.mutation<
      ApiResponse<LoginResponse>,
      { id_token: string }
    >({
      query: (body) => ({ url: `/users/social/apple`, method: "POST", body }),
    }),
    loginByGoogle: builder.mutation<
      ApiResponse<LoginResponse>,
      { access_token: string }
    >({
      query: (body) => ({ url: `/users/social/google`, method: "POST", body }),
    }),
    loginByLinkedIn: builder.mutation<
      ApiResponse<LoginResponse>,
      { access_token: string }
    >({
      query: (body) => ({
        url: `/users/social/linkedin`,
        method: "POST",
        body,
      }),
    }),
    loginByFacebook: builder.mutation<
      ApiResponse<LoginResponse>,
      { access_token: string }
    >({
      query: (body) => ({
        url: `/users/social/facebook`,
        method: "POST",
        body,
      }),
    }),

    // ---- Media Manager ----
    getMedia: builder.query<
      ApiResponse<MediaResponse>,
      {
        folderId?: string;
        search?: string;
        page?: number;
        limit?: number;
        userId?: string;
      } | void
    >({
      query: (params) => ({
        url: `/uploads`,
        params: params
          ? {
              folder_id: params.folderId,
              search: params.search,
              page: params.page,
              limit: params.limit,
              userId: params.userId,
            }
          : undefined,
      }),
      providesTags: [ApiTag.MEDIA],
    }),
    uploadMedia: builder.mutation<
      ApiResponse<Media>,
      { file: File; folderId?: string; altText?: string }
    >({
      query: ({ file, folderId, altText }) => {
        const formData = new FormData();
        formData.append("file", file);
        if (folderId) formData.append("folder_id", folderId);
        if (altText) formData.append("alt_text", altText);
        return {
          url: `/uploads`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [ApiTag.MEDIA],
    }),
    uploadMediaBulk: builder.mutation<
      ApiResponse<Media[]>,
      { files: File[]; folderId?: string }
    >({
      query: ({ files, folderId }) => {
        const formData = new FormData();
        files.forEach((file) => formData.append("files", file));
        if (folderId) formData.append("folder_id", folderId);
        return {
          url: `/uploads/bulk`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [ApiTag.MEDIA],
    }),
    replaceMedia: builder.mutation<
      ApiResponse<Media>,
      { id: string; file: File }
    >({
      query: ({ id, file }) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/uploads/${id}`,
          method: "PUT",
          body: formData,
        };
      },
      invalidatesTags: [ApiTag.MEDIA],
    }),
    updateMedia: builder.mutation<
      ApiResponse<Media>,
      {
        id: string;
        name?: string;
        altText?: string | null;
        folderId?: string | null;
      }
    >({
      query: ({ id, ...body }) => {
        const formData = new FormData();
        if (body.name) formData.append("name", body.name);
        if (body.altText !== undefined)
          formData.append("alt_text", body.altText || "");
        if (body.folderId !== undefined)
          formData.append("folder_id", body.folderId || "");
        return {
          url: `/uploads/${id}`,
          method: "PATCH",
          body: formData,
        };
      },
      invalidatesTags: [ApiTag.MEDIA],
    }),
    bulkMoveMedia: builder.mutation<
      ApiResponse<SuccessResponse>,
      { media_ids: string[]; folder_id: string | null }
    >({
      query: (body) => ({
        url: `/uploads/bulk-move`,
        method: "PATCH",
        body,
      }),
      invalidatesTags: [ApiTag.MEDIA],
    }),
    deleteMedia: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({ url: `/uploads/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTag.MEDIA],
    }),
    getAllFolders: builder.query<ApiResponse<Folder[]>, void>({
      query: () => `/uploads/folders/all`,
      providesTags: [ApiTag.MEDIA],
    }),
    createFolder: builder.mutation<
      ApiResponse<Folder>,
      { name: string; parentId?: string }
    >({
      query: (body) => ({
        url: `/uploads/folders`,
        method: "POST",
        params: {
          name: body.name,
          parent_id: body.parentId,
        },
      }),
      invalidatesTags: [ApiTag.MEDIA],
    }),
    deleteFolder: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({ url: `/uploads/folders/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTag.MEDIA],
    }),

    // ---- Blogs ----
    getBlogs: builder.query<
      ApiResponse<{
        items: Blog[];
        total: number;
        page: number;
        limit: number;
      }>,
      {
        page?: number;
        limit?: number;
        search?: string;
        status?: string;
        categoryId?: string;
        authorId?: string;
        userId?: string;
      } | void
    >({
      query: (params) => ({
        url: `/blogs`,
        params: params
          ? {
              page: params.page,
              limit: params.limit,
              search: params.search,
              status: params.status === "all" ? undefined : params.status,
              category_id: params.categoryId,
              authorId: params.authorId,
              userId: params.userId || params.authorId,
            }
          : undefined,
      }),
      providesTags: [ApiTag.BLOGS],
    }),
    getBlogById: builder.query<ApiResponse<Blog>, string>({
      query: (id) => `/admin/blogs/${id}`,
      providesTags: [ApiTag.BLOGS],
    }),
    createBlog: builder.mutation<ApiResponse<Blog>, Partial<Blog>>({
      query: (body) => ({ url: `/admin/blogs`, method: "POST", body }),
      invalidatesTags: [ApiTag.BLOGS],
    }),
    updateBlog: builder.mutation<
      ApiResponse<Blog>,
      { id: string; body: Partial<Blog> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/blogs/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [ApiTag.BLOGS],
    }),
    deleteBlog: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({ url: `/admin/blogs/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTag.BLOGS],
    }),
    importBlog: builder.mutation<ApiResponse<Blog>, File>({
      query: (file) => {
        const formData = new FormData();
        formData.append("file", file);
        return {
          url: `/admin/blogs/import`,
          method: "POST",
          body: formData,
        };
      },
      invalidatesTags: [ApiTag.BLOGS],
    }),

    // ---- Blog Redirects ----
    getBlogRedirects: builder.query<ApiResponse<any[]>, void>({
      query: () => `/admin/blogs/redirects`,
      providesTags: [ApiTag.BLOG_REDIRECTS, ApiTag.BLOGS],
    }),
    getBlogRedirectMap: builder.query<ApiResponse<Record<string, string>>, void>({
      query: () => `/blogs/redirects/map`,
      providesTags: [ApiTag.BLOG_REDIRECTS, ApiTag.BLOGS],
    }),
    createBlogRedirect: builder.mutation<
      ApiResponse<any>,
      { oldSlug: string; blogId: string }
    >({
      query: (body) => ({ url: `/admin/blogs/redirects`, method: "POST", body }),
      invalidatesTags: [ApiTag.BLOG_REDIRECTS],
    }),
    deleteBlogRedirect: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (oldSlug) => ({
        url: `/admin/blogs/redirects/${oldSlug}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTag.BLOG_REDIRECTS],
    }),
    // ---- Blog Tags ----
    getBlogTags: builder.query<ApiResponse<Tag[]>, { page?: number; limit?: number; search?: string } | void>({
      query: (params) => ({
        url: `/blogs/tags`,
        params: params || undefined,
      }),
      providesTags: [ApiTag.BLOG_TAGS],
    }),
    createBlogTag: builder.mutation<ApiResponse<Tag>, Partial<Tag>>({
      query: (body) => ({
        url: `/admin/blogs/tags`,
        method: "POST",
        body,
      }),
      invalidatesTags: [ApiTag.BLOG_TAGS],
    }),
    updateBlogTag: builder.mutation<ApiResponse<Tag>, { id: string; body: Partial<Tag> }>({
      query: ({ id, body }) => ({
        url: `/admin/blogs/tags/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [ApiTag.BLOG_TAGS, ApiTag.BLOGS],
    }),
    deleteBlogTag: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({
        url: `/admin/blogs/tags/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTag.BLOG_TAGS, ApiTag.BLOGS],
    }),

    // ---- Blog Revisions ----
    getBlogRevisions: builder.query<ApiResponse<BlogRevision[]>, string>({
      query: (blogId) => `/admin/blogs/${blogId}/revisions`,
      providesTags: [ApiTag.BLOGS],
    }),
    restoreBlogRevision: builder.mutation<ApiResponse<Blog>, { blogId: string; revisionId: string }>({
      query: ({ blogId, revisionId }) => ({
        url: `/admin/blogs/${blogId}/revisions/${revisionId}/restore`,
        method: "POST",
      }),
      invalidatesTags: [ApiTag.BLOGS],
    }),

    // ---- Blog Categories ----
    getBlogCategories: builder.query<
      ApiResponse<BlogCategory[] | PaginatedResponse<BlogCategory>>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: `/blogs/categories`,
        params: params || undefined,
      }),
      providesTags: [ApiTag.BLOG_CATEGORIES],
    }),
    createBlogCategory: builder.mutation<
      ApiResponse<BlogCategory>,
      Partial<BlogCategory>
    >({
      query: (body) => ({
        url: `/admin/blogs/categories`,
        method: "POST",
        body,
      }),
      invalidatesTags: [ApiTag.BLOG_CATEGORIES],
    }),
    updateBlogCategory: builder.mutation<
      ApiResponse<BlogCategory>,
      { id: string; body: Partial<BlogCategory> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/blogs/categories/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [ApiTag.BLOG_CATEGORIES],
    }),
    deleteBlogCategory: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({
        url: `/admin/blogs/categories/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTag.BLOG_CATEGORIES],
    }),

    // ---- Blog Authors ----
    getBlogAuthors: builder.query<
      ApiResponse<BlogAuthor[] | PaginatedResponse<BlogAuthor>>,
      { page?: number; limit?: number; search?: string } | void
    >({
      query: (params) => ({
        url: `/blogs/authors`,
        params: params || undefined,
      }),
      providesTags: [ApiTag.BLOG_AUTHORS],
    }),
    createBlogAuthor: builder.mutation<
      ApiResponse<BlogAuthor>,
      Partial<BlogAuthor>
    >({
      query: (body) => ({ url: `/admin/blogs/authors`, method: "POST", body }),
      invalidatesTags: [ApiTag.BLOG_AUTHORS],
    }),
    updateBlogAuthor: builder.mutation<
      ApiResponse<BlogAuthor>,
      { id: string; body: Partial<BlogAuthor> }
    >({
      query: ({ id, body }) => ({
        url: `/admin/blogs/authors/${id}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: [ApiTag.BLOG_AUTHORS],
    }),
    deleteBlogAuthor: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({ url: `/admin/blogs/authors/${id}`, method: "DELETE" }),
      invalidatesTags: [ApiTag.BLOG_AUTHORS],
    }),


    // ---- Comments ----
    getAdminComments: builder.query<
      ApiResponse<PaginatedResponse<BlogComment>>,
      {
        page?: number;
        limit?: number;
        postId?: string;
        approved?: boolean;
        search?: string;
      } | void
    >({
      query: (params) => ({
        url: `/admin/comments`,
        params: params
          ? {
              page: params.page,
              limit: params.limit,
              postId: params.postId,
              approved: params.approved,
              search: params.search,
            }
          : undefined,
      }),
      providesTags: [ApiTag.COMMENTS],
    }),
    approveComment: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({
        url: `/admin/comments/${id}/approve`,
        method: "PUT",
      }),
      invalidatesTags: [ApiTag.COMMENTS],
    }),
    deleteComment: builder.mutation<ApiResponse<SuccessResponse>, string>({
      query: (id) => ({
        url: `/admin/comments/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [ApiTag.COMMENTS],
    }),
    createComment: builder.mutation<
      ApiResponse<BlogComment>,
      {
        postId: string;
        authorName: string;
        authorEmail: string;
        content: string;
        parentId?: string;
      }
    >({
      query: (body) => ({
        url: `/comments`,
        method: "POST",
        body,
      }),
      invalidatesTags: [ApiTag.COMMENTS],
    }),

  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useLogoutMutation,
  useRegisterMutation,
  useUpdateUserMutation,
  useCreateUserMutation,
  useGetUsersQuery,
  useDeleteUserMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useVerfiyInvitationMutation,
  useChangePasswordMutation,
  // Social
  useLoginByAppleMutation,
  useLoginByFacebookMutation,
  useLoginByGoogleMutation,
  useLoginByLinkedInMutation,
  // Media Manager
  useGetMediaQuery,
  useUploadMediaMutation,
  useUploadMediaBulkMutation,
  useUpdateMediaMutation,
  useReplaceMediaMutation,
  useBulkMoveMediaMutation,
  useDeleteMediaMutation,
  useGetAllFoldersQuery,
  useCreateFolderMutation,
  useDeleteFolderMutation,
  // Blogs
  useGetBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useImportBlogMutation,
  // Blog Redirects
  useGetBlogRedirectsQuery,
  useGetBlogRedirectMapQuery,
  useCreateBlogRedirectMutation,
  useDeleteBlogRedirectMutation,
  // Blog Tags
  useGetBlogTagsQuery,
  useCreateBlogTagMutation,
  useUpdateBlogTagMutation,
  useDeleteBlogTagMutation,
  // Blog Revisions
  useGetBlogRevisionsQuery,
  useRestoreBlogRevisionMutation,
  // Blog Categories
  useGetBlogCategoriesQuery,
  useCreateBlogCategoryMutation,
  useUpdateBlogCategoryMutation,
  useDeleteBlogCategoryMutation,
  // Blog Authors
  useGetBlogAuthorsQuery,
  useCreateBlogAuthorMutation,
  useUpdateBlogAuthorMutation,
  useDeleteBlogAuthorMutation,
  // Revalidation
  useGetRevalidateModelsQuery,
  useTriggerRevalidateMutation,
  // Dashboard & Analytics
  useGetDashboardStatsQuery,
  useGetRealtimeActiveReadersQuery,
  useGetAnalyticsPostsQuery,
  useGetUtmMetricsQuery,
  useGetEngagementMetricsQuery,
  useGetGeoMetricsQuery,
  // Roles
  useGetRolesQuery,
  useGetAvailablePermissionsQuery,
  useCreateRoleMutation,
  useUpdateRoleMutation,
  useDeleteRoleMutation,
  // Comments
  useGetAdminCommentsQuery,
  useApproveCommentMutation,
  useDeleteCommentMutation,
  useCreateCommentMutation,
  // Mock Subscriptions
  useUpgradeTenantSubscriptionMutation,
  useCancelTenantSubscriptionMutation,
  useGetMockSubscriptionTenantsQuery,
} = api;

