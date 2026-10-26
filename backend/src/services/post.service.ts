import { Post, IPost } from '../models/Post.js';
import { User } from '../models/User.js';
import { BlogRevision } from '../models/BlogRevision.js';
import { Category } from '../models/Category.js';
import { Tag } from '../models/Tag.js';
import { Author } from '../models/Author.js';
import { BlogRedirect } from '../models/BlogRedirect.js';
import { Comment } from '../models/Comment.js';
import { generateSlug } from '../utils/slugify.js';
import { emitNotification } from '../socket/index.js';
import mongoose from 'mongoose';

const renderBlocksToHtml = (content: any): string => {
  if (!content) return '';
  if (typeof content === 'string') return content;
  if (!Array.isArray(content)) return '';
  return content
    .map((b: any) => {
      const inline = Array.isArray(b.children)
        ? b.children
            .map((c: any) => {
              let t = c.text || '';
              if (c.bold) t = `<strong>${t}</strong>`;
              if (c.italic) t = `<em>${t}</em>`;
              if (c.underline) t = `<u>${t}</u>`;
              return t;
            })
            .join('')
        : b.text || '';
      if (b.type === 'heading') return `<h${b.level || 2}>${inline}</h${b.level || 2}>`;
      if (b.type === 'paragraph') return `<p>${inline}</p>`;
      if (b.type === 'blockquote') return `<blockquote>${b.text || inline}</blockquote>`;
      return `<p>${inline}</p>`;
    })
    .join('\n');
};

export class PostService {
  private static async getUniqueSlug(baseTitle: string, excludeId?: string): Promise<string> {
    const baseSlug = generateSlug(baseTitle) || 'untitled-post';
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const query: any = { slug, isDeleted: false };
      if (excludeId) query._id = { $ne: excludeId };

      const existing = await Post.findOne(query);
      if (!existing) break;

      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  static async getPosts(params: {
    page?: number | string;
    limit?: number | string;
    search?: string;
    status?: string;
    categoryId?: string;
    authorId?: string;
    userId?: string;
  }) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const conditions: any[] = [{ isDeleted: false }];

    if (params.search) {
      const searchRegex = new RegExp(params.search.trim(), 'i');
      conditions.push({
        $or: [{ title: searchRegex }, { excerpt: searchRegex }, { slug: searchRegex }],
      });
    }

    if (params.status && params.status !== 'all') {
      if (params.status === 'published') conditions.push({ isPublished: true });
      if (params.status === 'draft') conditions.push({ isPublished: false });
    }

    if (params.categoryId) {
      conditions.push({ category: params.categoryId });
    }

    const targetUserId = params.userId || params.authorId;
    if (targetUserId) {
      const validObjectId = mongoose.Types.ObjectId.isValid(targetUserId)
        ? new mongoose.Types.ObjectId(targetUserId)
        : null;
      conditions.push({
        $or: [
          { createdBy: targetUserId },
          { author: targetUserId },
          ...(validObjectId ? [{ createdBy: validObjectId }, { author: validObjectId }] : []),
        ],
      });
    }

    const query = conditions.length > 1 ? { $and: conditions } : conditions[0];

    const [items, total] = await Promise.all([
      Post.find(query)
        .populate('category', 'name slug')
        .populate('bannerImage', 'name url altText')
        .populate('tags', 'name slug')
        .sort({ displayOrder: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(query),
    ]);

    const userAndAuthorIds = [
      ...new Set(
        items
          .flatMap((p) => [
            p.createdBy ? p.createdBy.toString() : null,
            p.author ? p.author.toString() : null,
          ])
          .filter(Boolean)
      ),
    ];
    const postIds = items.map((p) => p._id);
    const [authorsList, usersList, commentCounts] = await Promise.all([
      Author.find({ _id: { $in: userAndAuthorIds } }).select('name bio designation imageId'),
      User.find({ _id: { $in: userAndAuthorIds } }).select('name email image role'),
      Comment.aggregate([
        { $match: { post: { $in: postIds }, isDeleted: false } },
        { $group: { _id: '$post', count: { $sum: 1 } } },
      ]),
    ]);
    const commentCountMap = new Map<string, number>();
    commentCounts.forEach((c: any) => {
      commentCountMap.set(c._id.toString(), c.count);
    });
    const authorMap = new Map<string, any>();
    authorsList.forEach((a) => {
      const aJson = a.toJSON ? a.toJSON() : a;
      authorMap.set(a._id.toString(), { ...aJson, id: a._id.toString() });
    });
    const userMap = new Map<string, any>();
    usersList.forEach((u) => {
      const uJson = u.toJSON ? u.toJSON() : u;
      userMap.set(u._id.toString(), { ...uJson, id: u._id.toString() });
      if (!authorMap.has(u._id.toString())) {
        authorMap.set(u._id.toString(), { ...uJson, id: u._id.toString() });
      }
    });

    const populatedItems = items.map((p) => {
      const pObj: any = p.toJSON ? p.toJSON() : p;
      const aId = p.author ? p.author.toString() : null;
      const cId = p.createdBy ? p.createdBy.toString() : aId;

      if (aId && authorMap.has(aId)) {
        pObj.author = authorMap.get(aId);
        pObj.authorId = aId;
      } else if (aId) {
        pObj.authorId = aId;
      }

      if (cId && userMap.has(cId)) {
        pObj.createdBy = userMap.get(cId);
        pObj.createdById = cId;
      } else if (cId && authorMap.has(cId)) {
        pObj.createdBy = authorMap.get(cId);
        pObj.createdById = cId;
      } else if (pObj.author) {
        pObj.createdBy = pObj.author;
        pObj.createdById = aId;
      }

      const views = p.views || 0;
      const likes = p.likes || 0;
      const realComments = commentCountMap.get(p._id.toString()) ?? (p.commentsCount || 0);
      pObj.totalComments = realComments;
      pObj.commentsCount = realComments;
      pObj.metrics = {
        views,
        likes,
        uniqueViews: p.metrics?.uniqueViews || Math.round(views * 0.75),
        googleViews: p.metrics?.googleViews || 0,
        twitterViews: p.metrics?.twitterViews || 0,
        linkedinViews: p.metrics?.linkedinViews || 0,
        directViews: p.metrics?.directViews || 0,
        otherViews: p.metrics?.otherViews || 0,
        mobileViews: p.metrics?.mobileViews || 0,
        tabletViews: p.metrics?.tabletViews || 0,
        desktopViews: p.metrics?.desktopViews || 0,
      };

      return pObj;
    });

    return { items: populatedItems, total, page, limit };
  }

  static async getPostById(id: string) {
    let post = await Post.findOne({ _id: id, isDeleted: false })
      .populate('category', 'name slug')
      .populate('bannerImage', 'name url altText')
      .populate('tags', 'name slug');

    if (!post) throw new Error('Blog post not found');

    const postObj: any = post.toJSON ? post.toJSON() : post;
    const rawAuthorId = post.author ? post.author.toString() : null;
    const rawCreatedById = post.createdBy ? post.createdBy.toString() : rawAuthorId;

    if (rawAuthorId) {
      const authorDoc = await Author.findById(rawAuthorId).select('name bio designation imageId')
        || await User.findById(rawAuthorId).select('name email image role');
      if (authorDoc) {
        const aJson = authorDoc.toJSON ? authorDoc.toJSON() : authorDoc;
        postObj.author = { ...aJson, id: authorDoc._id.toString() };
        postObj.authorId = authorDoc._id.toString();
      } else {
        postObj.authorId = rawAuthorId;
      }
    }

    if (rawCreatedById) {
      const creatorDoc = await User.findById(rawCreatedById).select('name email image role');
      if (creatorDoc) {
        const cJson = creatorDoc.toJSON ? creatorDoc.toJSON() : creatorDoc;
        postObj.createdBy = { ...cJson, id: creatorDoc._id.toString() };
        postObj.createdById = creatorDoc._id.toString();
      } else if (postObj.author) {
        postObj.createdBy = postObj.author;
        postObj.createdById = rawAuthorId;
      }
    }

    const commentCount = await Comment.countDocuments({ post: post._id, isDeleted: false });
    postObj.totalComments = commentCount;
    postObj.commentsCount = commentCount;

    return postObj;
  }

  static async getPostBySlug(slug: string) {
    let post = await Post.findOne({ slug, isDeleted: false })
      .populate('category', 'name slug')
      .populate('bannerImage', 'name url altText')
      .populate('tags', 'name slug');

    if (!post) throw new Error('Blog post not found');

    const postObj: any = post.toJSON ? post.toJSON() : post;
    postObj._id = postObj.id || post._id.toString();
    const rawAuthorId = post.author ? post.author.toString() : null;
    if (rawAuthorId) {
      const authorDoc = await Author.findById(rawAuthorId).select('name bio designation imageId')
        || await User.findById(rawAuthorId).select('name email image role');
      if (authorDoc) {
        const aJson = authorDoc.toJSON ? authorDoc.toJSON() : authorDoc;
        postObj.author = { ...aJson, id: authorDoc._id.toString() };
        postObj.authorId = authorDoc._id.toString();
      } else {
        postObj.authorId = rawAuthorId;
      }
    }

    const commentCount = await Comment.countDocuments({ post: post._id, isDeleted: false });
    postObj.totalComments = commentCount;
    postObj.commentsCount = commentCount;

    return postObj;
  }

  static async createPost(data: any, authorId?: string, createdById?: string) {
    const slug = data.slug ? generateSlug(data.slug) : await this.getUniqueSlug(data.title);
    const chosenAuthor = data.authorId || data.author || authorId || createdById;
    const finalCreatedBy = createdById || authorId || chosenAuthor;

    const compiledContent = data.content || (Array.isArray(data.sections)
      ? data.sections.map((s: any) => renderBlocksToHtml(s.content)).filter(Boolean).join('\n\n')
      : '');

    const post = new Post({
      title: data.title,
      slug,
      excerpt: data.excerpt || '',
      content: compiledContent,
      isPublished: data.isPublished ?? false,
      isFeatured: data.isFeatured ?? false,
      displayOrder: data.displayOrder ?? 0,
      author: chosenAuthor,
      createdBy: finalCreatedBy,
      category: data.categoryId || data.category || null,
      bannerImage: data.bannerImageId || (data.bannerImage?.id ? data.bannerImage.id : data.bannerImage) || null,
      sections: data.sections || [],
      seo: data.seo || {},
      tags: data.tagIds || data.tags || [],
      publishDate: data.publishDate || (data.isPublished ? new Date() : null),
    });

    await post.save();

    // Create initial revision snapshot
    await BlogRevision.create({
      blogId: post._id,
      title: post.title,
      excerpt: post.excerpt,
      sections_data: post.sections,
      revisionNumber: 1,
    });

    emitNotification('notification:new_post', {
      id: post._id,
      title: post.title,
      slug: post.slug,
      createdAt: post.createdAt,
    });

    return this.getPostById(post._id.toString());
  }

  static async updatePost(id: string, data: any) {
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) throw new Error('Blog post not found');

    if (data.title && data.title !== post.title && !data.slug) {
      post.slug = await this.getUniqueSlug(data.title, id);
      post.title = data.title;
    } else if (data.title) {
      post.title = data.title;
    }

    if (data.slug && data.slug !== post.slug) {
      post.slug = await this.getUniqueSlug(data.slug, id);
    }

    if (data.excerpt !== undefined) post.excerpt = data.excerpt;
    if (data.content !== undefined) post.content = data.content;
    if (data.isPublished !== undefined) {
      post.isPublished = data.isPublished;
      if (data.isPublished && !post.publishDate) {
        post.publishDate = new Date();
      }
    }
    if (data.isFeatured !== undefined) post.isFeatured = data.isFeatured;
    if (data.displayOrder !== undefined) post.displayOrder = data.displayOrder;
    if (data.categoryId !== undefined || data.category !== undefined) {
      post.category = data.categoryId || data.category || null;
    }
    if (data.authorId !== undefined || data.author !== undefined) {
      post.author = data.authorId || data.author || post.author;
    }
    if (data.bannerImageId !== undefined || data.bannerImage !== undefined) {
      post.bannerImage = data.bannerImageId || (data.bannerImage?.id ? data.bannerImage.id : data.bannerImage) || null;
    }
    if (data.sections !== undefined) {
      post.sections = data.sections;
      post.markModified('sections');
      if (!data.content && Array.isArray(data.sections)) {
        post.content = data.sections.map((s: any) => renderBlocksToHtml(s.content)).filter(Boolean).join('\n\n');
      }
    }
    if (data.seo !== undefined) {
      const currentSeo = (post.seo as any)?.toObject ? (post.seo as any).toObject() : (post.seo || {});
      post.seo = {
        ...currentSeo,
        ...data.seo,
      };
      post.markModified('seo');
    }
    if (data.tagIds !== undefined || data.tags !== undefined) {
      post.tags = data.tagIds || data.tags;
    }

    await post.save();

    // Save revision snapshot
    const lastRev = await BlogRevision.findOne({ blogId: post._id }).sort({ revisionNumber: -1 });
    const revisionNumber = (lastRev?.revisionNumber || 0) + 1;

    await BlogRevision.create({
      blogId: post._id,
      title: post.title,
      excerpt: post.excerpt,
      sections_data: post.sections,
      revisionNumber,
    });

    return this.getPostById(post._id.toString());
  }

  static async deletePost(id: string) {
    const post = await Post.findOne({ _id: id, isDeleted: false });
    if (!post) throw new Error('Blog post not found');

    post.isDeleted = true;
    post.deletedAt = new Date();
    await post.save();

    return true;
  }

  static async getRevisions(blogId: string) {
    return BlogRevision.find({ blogId }).sort({ revisionNumber: -1 });
  }

  static async restoreRevision(blogId: string, revisionId: string) {
    const revision = await BlogRevision.findOne({ _id: revisionId, blogId });
    if (!revision) throw new Error('Revision not found');

    const post = await Post.findOne({ _id: blogId, isDeleted: false });
    if (!post) throw new Error('Blog post not found');

    post.title = revision.title;
    post.excerpt = revision.excerpt || '';
    post.sections = (revision.sections_data as any) || [];
    await post.save();

    // Log revision restore
    const lastRev = await BlogRevision.findOne({ blogId: post._id }).sort({ revisionNumber: -1 });
    const revisionNumber = (lastRev?.revisionNumber || 0) + 1;

    await BlogRevision.create({
      blogId: post._id,
      title: post.title,
      excerpt: post.excerpt,
      sections_data: post.sections,
      revisionNumber,
    });

    return this.getPostById(post._id.toString());
  }

  static async incrementViews(
    id: string,
    reqDetails?: { referrer?: string; userAgent?: string }
  ) {
    const inc: Record<string, number> = { views: 1, 'metrics.views': 1, 'metrics.uniqueViews': 1 };

    const ref = (reqDetails?.referrer || '').toLowerCase();
    if (ref.includes('google')) {
      inc['metrics.googleViews'] = 1;
    } else if (ref.includes('twitter') || ref.includes('t.co') || ref.includes('x.com')) {
      inc['metrics.twitterViews'] = 1;
    } else if (ref.includes('linkedin')) {
      inc['metrics.linkedinViews'] = 1;
    } else if (ref.trim().length > 0) {
      inc['metrics.otherViews'] = 1;
    } else {
      inc['metrics.directViews'] = 1;
    }

    const ua = (reqDetails?.userAgent || '').toLowerCase();
    if (/tablet|ipad/i.test(ua)) {
      inc['metrics.tabletViews'] = 1;
    } else if (/mobile|iphone|android/i.test(ua)) {
      inc['metrics.mobileViews'] = 1;
    } else {
      inc['metrics.desktopViews'] = 1;
    }

    return Post.findByIdAndUpdate(id, { $inc: inc }, { new: true });
  }

  static async likePost(id: string) {
    return Post.findByIdAndUpdate(id, { $inc: { likes: 1, 'metrics.likes': 1 } }, { new: true });
  }

  // ===================== Categories =====================
  static async getAllCategories(params?: { search?: string }) {
    const query: any = { isDeleted: false };
    if (params?.search) {
      query.name = new RegExp(params.search.trim(), 'i');
    }
    return Category.find(query)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .sort({ name: 1 });
  }

  static async createCategory(data: { name: string; slug?: string; description?: string }, userId?: string) {
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    return Category.create({
      name: data.name,
      slug,
      description: data.description || '',
      isActive: true,
      createdBy: userId || null,
      updatedBy: userId || null,
    });
  }

  static async updateCategory(id: string, data: Partial<{ name: string; slug?: string; description?: string; isActive?: boolean }>, userId?: string) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) throw new Error('Category not found');

    if (data.name) category.name = data.name;
    if (data.slug) category.slug = generateSlug(data.slug);
    if (data.description !== undefined) category.description = data.description;
    if (data.isActive !== undefined) category.isActive = data.isActive;
    if (userId) category.updatedBy = userId as any;

    await category.save();
    return category;
  }

  static async deleteCategory(id: string) {
    const category = await Category.findOne({ _id: id, isDeleted: false });
    if (!category) throw new Error('Category not found');
    category.isDeleted = true;
    await category.save();
    return true;
  }

  // ===================== Authors =====================
  static async getAllAuthors(params?: { search?: string }) {
    const query: any = { isDeleted: false };
    if (params?.search) {
      query.name = new RegExp(params.search.trim(), 'i');
    }
    return Author.find(query)
      .populate('imageId', 'name url altText')
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .sort({ name: 1 });
  }

  static async createAuthor(data: { name: string; bio?: string; designation?: string; imageId?: string }, userId?: string) {
    return Author.create({
      name: data.name,
      bio: data.bio || '',
      designation: data.designation || '',
      imageId: data.imageId || null,
      createdBy: userId || null,
      updatedBy: userId || null,
    });
  }

  static async updateAuthor(id: string, data: Partial<{ name: string; bio?: string; designation?: string; imageId?: string }>, userId?: string) {
    const author = await Author.findOne({ _id: id, isDeleted: false });
    if (!author) throw new Error('Author not found');

    if (data.name) author.name = data.name;
    if (data.bio !== undefined) author.bio = data.bio;
    if (data.designation !== undefined) author.designation = data.designation;
    if (data.imageId !== undefined) author.imageId = (data.imageId && data.imageId !== '') ? (data.imageId as any) : null;
    if (userId) author.updatedBy = userId as any;

    await author.save();
    return author;
  }

  static async deleteAuthor(id: string) {
    const author = await Author.findOne({ _id: id, isDeleted: false });
    if (!author) throw new Error('Author not found');
    author.isDeleted = true;
    await author.save();
    return true;
  }

  // ===================== Tags =====================
  static async getAllTags(params?: { search?: string }) {
    const query: any = { isDeleted: false };
    if (params?.search) {
      query.name = new RegExp(params.search.trim(), 'i');
    }
    return Tag.find(query)
      .populate('createdBy', 'name email role')
      .populate('updatedBy', 'name email role')
      .sort({ name: 1 });
  }

  static async createTag(data: { name: string; slug?: string }, userId?: string) {
    const slug = data.slug ? generateSlug(data.slug) : generateSlug(data.name);
    return Tag.create({
      name: data.name,
      slug,
      createdBy: userId || null,
      updatedBy: userId || null,
    });
  }

  static async getTagById(id: string) {
    const tag = await Tag.findOne({ _id: id, isDeleted: false });
    if (!tag) throw new Error('Tag not found');
    return tag;
  }

  static async updateTag(id: string, data: Partial<{ name: string; slug?: string }>, userId?: string) {
    const tag = await Tag.findOne({ _id: id, isDeleted: false });
    if (!tag) throw new Error('Tag not found');

    if (data.name) tag.name = data.name;
    if (data.slug) tag.slug = generateSlug(data.slug);
    if (userId) tag.updatedBy = userId as any;

    await tag.save();
    return tag;
  }

  static async deleteTag(id: string) {
    const tag = await Tag.findOne({ _id: id, isDeleted: false });
    if (!tag) throw new Error('Tag not found');
    tag.isDeleted = true;
    await tag.save();
    return true;
  }

  // ===================== Redirects =====================
  static async getAllRedirects() {
    return BlogRedirect.find()
      .populate('blog', 'title slug')
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });
  }

  static async getRedirectMap(): Promise<Record<string, string>> {
    const redirects = await BlogRedirect.find().populate('blog', 'slug');
    const map: Record<string, string> = {};
    for (const r of redirects) {
      if (r.blog && (r.blog as any).slug) {
        map[r.oldSlug] = (r.blog as any).slug;
      }
    }
    return map;
  }

  static async getRedirectBySlug(oldSlug: string): Promise<string | null> {
    const redirect = await BlogRedirect.findOne({ oldSlug: oldSlug.trim().toLowerCase() }).populate('blog', 'slug');
    if (redirect && redirect.blog && (redirect.blog as any).slug) {
      return (redirect.blog as any).slug;
    }
    return null;
  }

  static async createRedirect(oldSlug: string, blogId: string, userId?: string) {
    const blog = await Post.findOne({ _id: blogId, isDeleted: false });
    if (!blog) throw new Error('Blog post not found');

    const normalizedOldSlug = oldSlug.trim().toLowerCase().replace(/\s+/g, '-');
    if (blog.slug === normalizedOldSlug) {
      throw new Error('Cannot redirect a slug to itself');
    }

    const activePostWithOldSlug = await Post.findOne({ slug: normalizedOldSlug, isDeleted: false });
    if (activePostWithOldSlug) {
      throw new Error('Cannot redirect an active blog slug');
    }

    // Upsert redirect
    await BlogRedirect.deleteOne({ oldSlug: normalizedOldSlug });
    return BlogRedirect.create({
      oldSlug: normalizedOldSlug,
      blog: blog._id,
      createdBy: userId || null,
    });
  }

  static async deleteRedirect(oldSlug: string) {
    const res = await BlogRedirect.deleteOne({ oldSlug: oldSlug.trim().toLowerCase() });
    return res.deletedCount > 0;
  }
}

