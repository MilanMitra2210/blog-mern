import mongoose, { Document, Model, Schema } from 'mongoose';
import { IBlogSection, ISEOData } from '../types/index.js';

export interface IPost extends Document {
  _id: mongoose.Types.ObjectId;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  readTime: number;
  isPublished: boolean;
  isFeatured: boolean;
  displayOrder: number;
  avgRating: number;
  totalRatings: number;
  views: number;
  likes: number;
  commentsCount?: number;
  totalComments?: number;
  metrics?: {
    views?: number;
    uniqueViews?: number;
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
  author: mongoose.Types.ObjectId | any;
  authorId?: string;
  createdBy?: mongoose.Types.ObjectId | any;
  createdById?: string;
  category?: mongoose.Types.ObjectId | any;
  categoryId?: string;
  bannerImage?: mongoose.Types.ObjectId | any;
  bannerImageId?: string;
  sections: IBlogSection[];
  seo: ISEOData;
  tags: (mongoose.Types.ObjectId | any)[];
  tagIds?: string[];
  isDeleted: boolean;
  deletedAt?: Date | null;
  publishDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const subSectionSchema = new Schema(
  {
    id: { type: String },
    title: { type: String, default: '' },
    content: { type: Schema.Types.Mixed, default: '' },
    displayOrder: { type: Number, default: 0 },
    mediaId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    media: { type: Schema.Types.Mixed, default: null },
    codeBlock: { type: String, default: '' },
    codeLanguage: { type: String, default: '' },
  },
  { _id: false }
);

const sectionSchema = new Schema(
  {
    id: { type: String },
    title: { type: String, default: '' },
    content: { type: Schema.Types.Mixed, default: '' },
    sectionType: { type: String, default: 'content' },
    displayOrder: { type: Number, default: 0 },
    mediaId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    media: { type: Schema.Types.Mixed, default: null },
    ctaButtonText: { type: String, default: '' },
    ctaButtonUrl: { type: String, default: '' },
    embedUrl: { type: String, default: '' },
    embedProvider: { type: String, default: '' },
    codeBlock: { type: String, default: '' },
    codeLanguage: { type: String, default: '' },
    subSections: { type: [subSectionSchema], default: [] },
  },
  { _id: false }
);

const jsonLdItemSchema = new Schema(
  {
    id: { type: String, default: '' },
    schema: { type: Schema.Types.Mixed, default: () => ({}) },
  },
  { _id: false }
);

const seoSchema = new Schema(
  {
    metaTitle: { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    focusKeyword: { type: String, default: '' },
    canonicalUrl: { type: String, default: '' },
    keywords: [{ type: String }],
    metaKeywords: { type: String, default: '' },
    metaRobots: { type: String, default: 'index, follow' },
    metaImageId: { type: Schema.Types.ObjectId, ref: 'Media', default: null },
    metaImage: { type: Schema.Types.Mixed, default: null },
    jsonLd: { type: [jsonLdItemSchema], default: [] },
    ogImage: { type: String, default: '' },
  },
  { _id: false }
);

const postSchema = new Schema<IPost>(
  {
    title: {
      type: String,
      required: [true, 'Post title is required'],
      trim: true,
      maxlength: 500,
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      maxlength: 500,
    },
    excerpt: {
      type: String,
      default: '',
    },
    content: {
      type: String,
      default: '',
    },
    readTime: {
      type: Number,
      default: 3,
    },
    isPublished: {
      type: Boolean,
      default: false,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
    displayOrder: {
      type: Number,
      default: 0,
    },
    avgRating: {
      type: Number,
      default: 0,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    views: {
      type: Number,
      default: 0,
    },
    likes: {
      type: Number,
      default: 0,
    },
    commentsCount: {
      type: Number,
      default: 0,
    },
    metrics: {
      views: { type: Number, default: 0 },
      uniqueViews: { type: Number, default: 0 },
      likes: { type: Number, default: 0 },
      googleViews: { type: Number, default: 0 },
      twitterViews: { type: Number, default: 0 },
      linkedinViews: { type: Number, default: 0 },
      directViews: { type: Number, default: 0 },
      otherViews: { type: Number, default: 0 },
      mobileViews: { type: Number, default: 0 },
      tabletViews: { type: Number, default: 0 },
      desktopViews: { type: Number, default: 0 },
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    bannerImage: {
      type: Schema.Types.ObjectId,
      ref: 'Media',
      default: null,
    },
    sections: {
      type: [sectionSchema],
      default: [],
    },
    seo: {
      type: seoSchema,
      default: () => ({}),
    },
    tags: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Tag',
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    publishDate: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret: any) => {
        ret.id = ret._id ? ret._id.toString() : doc.id;
        delete ret._id;
        delete ret.__v;
        const isPopulatedDoc = (val: any) =>
          val && typeof val === 'object' && !(val instanceof mongoose.Types.ObjectId) && val._bsontype !== 'ObjectID';

        if (isPopulatedDoc(ret.author)) {
          ret.author.id = ret.author._id ? ret.author._id.toString() : (ret.author.id ? ret.author.id.toString() : '');
          ret.authorId = ret.author.id;
          delete ret.author._id;
        } else if (ret.author) {
          ret.authorId = ret.author.toString();
        }

        if (isPopulatedDoc(ret.category)) {
          ret.category.id = ret.category._id ? ret.category._id.toString() : (ret.category.id ? ret.category.id.toString() : '');
          ret.categoryId = ret.category.id;
          delete ret.category._id;
        } else if (ret.category) {
          ret.categoryId = ret.category.toString();
        }

        if (isPopulatedDoc(ret.bannerImage)) {
          ret.bannerImage.id = ret.bannerImage._id ? ret.bannerImage._id.toString() : (ret.bannerImage.id ? ret.bannerImage.id.toString() : '');
          ret.bannerImageId = ret.bannerImage.id;
          delete ret.bannerImage._id;
        } else if (ret.bannerImage) {
          ret.bannerImageId = ret.bannerImage.toString();
        }
        return ret;
      },
    },
  }
);

postSchema.index({ isDeleted: 1, isPublished: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, author: 1, createdAt: -1 });
postSchema.index({ isDeleted: 1, createdBy: 1, createdAt: -1 });

// Pre-save calculation of read time based on word count
postSchema.pre('save', function (next) {
  let text = `${this.title || ''} ${this.excerpt || ''} ${this.content || ''}`;

  if (Array.isArray(this.sections)) {
    for (const sec of this.sections) {
      if (sec.title) text += ` ${sec.title}`;
      if (typeof sec.content === 'string') text += ` ${sec.content}`;
      if (Array.isArray(sec.subSections)) {
        for (const sub of sec.subSections) {
          if (sub.title) text += ` ${sub.title}`;
          if (typeof sub.content === 'string') text += ` ${sub.content}`;
        }
      }
    }
  }

  const plainText = text.replace(/<[^>]*>/g, ' ').trim();
  const words = plainText ? plainText.split(/\s+/).length : 0;
  this.readTime = Math.max(1, Math.ceil(words / 200));
  next();
});

export const Post: Model<IPost> = mongoose.model<IPost>('Post', postSchema);
