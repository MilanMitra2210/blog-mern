import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Post } from '../models/Post.js';
import { Comment } from '../models/Comment.js';
import { IUserPayload } from '../types/index.js';

export class DashboardService {
  static async getStats(user?: IUserPayload) {
    const isRegularUser = user && user.role !== 'ADMIN';

    let postFilter: any = { isDeleted: false };
    if (isRegularUser && user?.id) {
      const validObjectId = mongoose.Types.ObjectId.isValid(user.id)
        ? new mongoose.Types.ObjectId(user.id)
        : null;
      postFilter = {
        $or: [
          { createdBy: user.id },
          { author: user.id },
          ...(validObjectId ? [{ createdBy: validObjectId }, { author: validObjectId }] : []),
        ],
        isDeleted: false,
      };
    }

    const [totalUsers, posts, totalCommentsCount] = await Promise.all([
      User.countDocuments({ isDeleted: false }),
      Post.find(postFilter).select('views likes title slug createdAt').sort({ createdAt: -1 }),
      isRegularUser
        ? null
        : Comment.countDocuments({ isDeleted: false }),
    ]);

    const totalBlogs = posts.length;
    const postIds = posts.map((p) => p._id);

    const totalComments = isRegularUser
      ? await Comment.countDocuments({ post: { $in: postIds }, isDeleted: false })
      : (totalCommentsCount ?? 0);

    const totalViews = posts.reduce((acc, p) => acc + (p.views || 0), 0);
    const totalLikes = posts.reduce((acc, p) => acc + (p.likes || 0), 0);
    const overallReach = Math.round(totalViews * 1.4) + totalLikes + totalComments;

    // Generate timeline (last 7 days)
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const now = new Date();
    const timeline = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dayName = days[d.getDay()];
      const dayFactor = (7 - i) * 5;

      timeline.push({
        date: d.toISOString().split('T')[0],
        day: dayName,
        views: Math.max(0, Math.round(totalViews / 7 + dayFactor)),
        likes: Math.max(0, Math.round(totalLikes / 7 + dayFactor / 4)),
        comments: Math.max(0, Math.round(totalComments / 7 + dayFactor / 10)),
        reach: Math.max(0, Math.round(overallReach / 7 + dayFactor * 1.5)),
      });
    }

    // Top posts
    const topPosts = posts.slice(0, 5).map((p) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      views: p.views || 0,
      likes: p.likes || 0,
      comments: 0,
      completions: Math.round((p.views || 0) * 0.7),
      completionRate: 70,
    }));

    // Recent blogs
    const recentBlogs = await Post.find(postFilter)
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(5)
      .then((items) =>
        items.map((b) => ({
          id: b._id.toString(),
          title: b.title,
          slug: b.slug,
          categoryName: b.category?.name || 'General',
          status: b.isPublished ? 'published' : 'draft',
          createdAt: b.createdAt.toISOString(),
        }))
      );

    return {
      totalUsers,
      totalBlogs,
      totalComments,
      totalViews,
      totalLikes,
      recentBlogs,
      recentEnquiries: [],
      pendingEnquiries: 0,
      totalEnquiries: 0,
      analytics: {
        totalViews,
        totalLikes,
        totalComments,
        overallReach,
        totalUniqueViews: Math.round(totalViews * 0.75),
        trends: {
          viewsTrend: '+12% this week',
          likesTrend: '+8% this week',
          commentsTrend: '+15% this week',
          reachTrend: '+18% this week',
        },
        timeline,
        topPosts,
      },
    };
  }

  static async getAnalyticsPosts(
    params: {
      page?: number | string;
      limit?: number | string;
      search?: string;
      sortBy?: string;
    },
    user?: IUserPayload
  ) {
    const page = Math.max(1, Number(params.page) || 1);
    const limit = Math.max(1, Number(params.limit) || 10);
    const skip = (page - 1) * limit;

    const query: any = { isDeleted: false };
    if (params.search) {
      query.title = new RegExp(params.search.trim(), 'i');
    }

    if (user && user.role !== 'ADMIN' && user.id) {
      const validObjectId = mongoose.Types.ObjectId.isValid(user.id)
        ? new mongoose.Types.ObjectId(user.id)
        : null;
      query.$or = [
        { createdBy: user.id },
        { author: user.id },
        ...(validObjectId ? [{ createdBy: validObjectId }, { author: validObjectId }] : []),
      ];
    }

    const sortOption: any = {};
    if (params.sortBy === 'likes') sortOption.likes = -1;
    else if (params.sortBy === 'createdAt') sortOption.createdAt = -1;
    else sortOption.views = -1;

    const [posts, total] = await Promise.all([
      Post.find(query).sort(sortOption).skip(skip).limit(limit),
      Post.countDocuments(query),
    ]);

    const items = posts.map((p) => ({
      id: p._id.toString(),
      title: p.title,
      slug: p.slug,
      views: p.views || 0,
      likes: p.likes || 0,
      comments: 0,
      completions: Math.round((p.views || 0) * 0.72),
      completionRate: 72,
      uniqueViews: Math.round((p.views || 0) * 0.75),
      googleViews: Math.round((p.views || 0) * 0.5),
      twitterViews: Math.round((p.views || 0) * 0.2),
      directViews: Math.round((p.views || 0) * 0.3),
    }));

    return { items, total, page, limit };
  }
}
