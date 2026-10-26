// Client-safe endpoints (calls Next.js server route handlers)
const CLIENT_API_BASE = '/api';

// Server-only endpoint (used strictly during server-side rendering / server components)
const SERVER_BACKEND_URL = process.env.BACKEND_API_URL || 'http://localhost:8080/api/v1';

export interface Author {
  _id: string;
  name: string;
  email?: string;
  avatar?: string;
  bio?: string;
  designation?: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  _id: string;
  name: string;
  slug: string;
}

export interface SectionMedia {
  id?: string;
  _id?: string;
  name?: string;
  url?: string;
  altText?: string;
}

export interface SubSection {
  id?: string;
  _id?: string;
  title?: string;
  content?: any;
  displayOrder?: number;
  mediaId?: string;
  media?: SectionMedia;
  codeBlock?: string;
  codeLanguage?: string;
}

export interface Section {
  id?: string;
  _id?: string;
  title?: string;
  content?: any;
  sectionType?: 'content' | 'cta' | 'summary' | 'media' | 'embed' | 'code' | 'quote' | 'faq' | string;
  displayOrder?: number;
  mediaId?: string;
  media?: SectionMedia;
  ctaButtonText?: string;
  ctaButtonUrl?: string;
  embedUrl?: string;
  embedProvider?: string;
  codeBlock?: string;
  codeLanguage?: string;
  subSections?: SubSection[];
}

export interface PostSeo {
  metaTitle?: string;
  metaDescription?: string;
  focusKeyword?: string;
  canonicalUrl?: string;
  keywords?: string[];
  metaKeywords?: string;
  metaRobots?: string;
  jsonLd?: any[];
  ogImage?: string;
  metaImageId?: string;
  metaImage?: any;
}

export interface Post {
  id?: string;
  _id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content?: string;
  sections?: Section[];
  featuredImage?: string;
  bannerImage?: SectionMedia;
  bannerImageId?: string;
  category?: Category | string;
  categoryId?: string;
  tags?: Array<Tag | string>;
  author?: Author | string;
  authorId?: string;
  status?: 'draft' | 'published' | 'scheduled';
  isPublished?: boolean;
  isFeatured?: boolean;
  displayOrder?: number;
  readTime?: number;
  publishDate?: string;
  publishedAt?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  likes?: number;
  totalComments?: number;
  commentsCount?: number;
  seo?: PostSeo;
  metrics?: {
    views?: number;
    likes?: number;
    googleViews?: number;
    twitterViews?: number;
    linkedinViews?: number;
    directViews?: number;
    otherViews?: number;
    mobileViews?: number;
    tabletViews?: number;
    desktopViews?: number;
  };
}

export interface Comment {
  id?: string;
  _id?: string;
  post: string;
  authorName: string;
  authorEmail?: string;
  content: string;
  status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved?: boolean;
  isAdmin?: boolean;
  parentId?: string | null;
  replies?: Comment[];
  createdAt: string;
  updatedAt?: string;
}

// Client-side fetch published posts via Next.js internal API proxy
export async function fetchPosts(params?: {
  page?: number;
  limit?: number;
  category?: string;
  search?: string;
}): Promise<{ items: Post[]; total: number; page: number; totalPages: number }> {
  try {
    const query = new URLSearchParams();
    query.set('status', 'published');
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.category) query.set('category', params.category);
    if (params?.search) query.set('search', params.search);

    const isServer = typeof window === 'undefined';
    const url = isServer
      ? `${SERVER_BACKEND_URL}/blogs?${query.toString()}`
      : `${CLIENT_API_BASE}/blogs?${query.toString()}`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch posts');
    const json = await res.json();
    return json.data || { items: [], total: 0, page: 1, totalPages: 1 };
  } catch (err) {
    console.error('fetchPosts error:', err);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

// Server-side direct fetch by slug (Backend URL never touches browser)
export async function fetchPostBySlugServer(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${SERVER_BACKEND_URL}/blogs/slug/${slug}`, {
      cache: 'no-store',
    });

    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch (err) {
    console.error('fetchPostBySlugServer error:', err);
    return null;
  }
}

// Record view beacon (proxies through Next.js server route handler)
export async function recordPostView(postId: string): Promise<void> {
  try {
    await fetch(`${CLIENT_API_BASE}/blogs/${postId}/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('recordPostView error:', err);
  }
}

// Like a post (proxies through Next.js server route handler)
export async function likePost(postId: string): Promise<{ likes: number } | null> {
  try {
    const res = await fetch(`${CLIENT_API_BASE}/blogs/${postId}/like`, {
      method: 'POST',
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (err) {
    console.error('likePost error:', err);
    return null;
  }
}

// Fetch approved comments for a post (proxies through Next.js server route handler)
export async function fetchComments(postId: string): Promise<Comment[]> {
  try {
    const res = await fetch(`${CLIENT_API_BASE}/comments/post/${postId}`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data || [];
  } catch (err) {
    console.error('fetchComments error:', err);
    return [];
  }
}

// Submit a new comment (proxies through Next.js server route handler)
export async function submitComment(data: {
  postId: string;
  authorName: string;
  authorEmail: string;
  content: string;
  parentId?: string;
}): Promise<{ success: boolean; message?: string; comment?: Comment }> {
  try {
    const res = await fetch(`${CLIENT_API_BASE}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) {
      return { success: false, message: json.message || 'Failed to submit comment' };
    }
    return { success: true, message: json.message, comment: json.data };
  } catch (err: any) {
    return { success: false, message: err.message || 'Something went wrong' };
  }
}

// Fetch categories (proxies through Next.js server route handler)
export async function fetchCategories(): Promise<Category[]> {
  try {
    const isServer = typeof window === 'undefined';
    const url = isServer
      ? `${SERVER_BACKEND_URL}/blogs/categories`
      : `${CLIENT_API_BASE}/categories`;

    const res = await fetch(url, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data?.items || json.data || [];
  } catch (err) {
    return [];
  }
}
