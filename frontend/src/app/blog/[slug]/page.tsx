import React from 'react';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchPostBySlugServer } from '@/lib/api';
import { buildArticleJsonLd, buildFaqJsonLd, extractCustomJsonLd } from '@/lib/contentRenderer';
import BlogPostClient from './BlogPostClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await fetchPostBySlugServer(slug);

  if (!post) {
    return {
      title: 'Article Not Found — QuillForge',
      description: 'The requested article could not be located on QuillForge.',
    };
  }

  const title = post.seo?.metaTitle || `${post.title} — QuillForge`;
  const description = post.seo?.metaDescription || post.excerpt || 'Read this article on QuillForge.';
  const featuredImg = post.seo?.ogImage || post.bannerImage?.url || post.featuredImage || '';

  // Extract keywords
  let keywordsList: string[] = [];
  if (Array.isArray(post.seo?.keywords) && post.seo.keywords.length > 0) {
    keywordsList = post.seo.keywords;
  } else if (post.seo?.metaKeywords) {
    keywordsList = post.seo.metaKeywords.split(',').map((k) => k.trim()).filter(Boolean);
  } else if (Array.isArray(post.tags)) {
    keywordsList = post.tags.map((t) => (typeof t === 'object' ? t.name : String(t)));
  }

  const authorName = typeof post.author === 'object' && post.author !== null 
    ? post.author.name 
    : (typeof post.author === 'string' ? post.author : 'QuillForge Author');

  const canonicalUrl = post.seo?.canonicalUrl || `http://localhost:3003/blog/${post.slug}`;

  // Parse robots string
  const robotsDirective = post.seo?.metaRobots || 'index, follow';
  const isNoIndex = robotsDirective.toLowerCase().includes('noindex');
  const isNoFollow = robotsDirective.toLowerCase().includes('nofollow');

  return {
    title,
    description,
    keywords: keywordsList.length > 0 ? keywordsList : undefined,
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: !isNoIndex,
      follow: !isNoFollow,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'QuillForge',
      type: 'article',
      publishedTime: post.publishDate || post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [authorName],
      images: featuredImg ? [{ url: featuredImg, alt: post.bannerImage?.altText || post.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: featuredImg ? [featuredImg] : [],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await fetchPostBySlugServer(slug);

  if (!post) {
    notFound();
  }

  // Generate Structured Data (JSON-LD)
  const articleJsonLd = buildArticleJsonLd(post);
  const faqJsonLd = buildFaqJsonLd(post.sections);
  const customJsonLdList = extractCustomJsonLd(post.seo?.jsonLd);

  return (
    <>
      {/* 1. Article / BlogPosting Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

      {/* 2. FAQ Schema for Google Rich Snippets */}
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {/* 3. Custom Admin Defined Schemas */}
      {customJsonLdList.map((customSchema, idx) => (
        <script
          key={idx}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(customSchema) }}
        />
      ))}

      {/* Client Interaction & Section Rendering */}
      <BlogPostClient post={post} />
    </>
  );
}
