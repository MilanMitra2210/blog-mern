// @ts-ignore
import mammoth from 'mammoth';
import fs from 'fs';
import { PostService } from './post.service.js';
import { generateSlug } from '../utils/slugify.js';

export class BlogImportService {
  static async importBlog(file: Express.Multer.File, authorId: string) {
    if (!file) {
      throw new Error('No file provided for import');
    }

    const buffer = file.buffer || (file.path && fs.existsSync(file.path) ? fs.readFileSync(file.path) : null);
    if (!buffer) {
      throw new Error('Unable to read uploaded file buffer');
    }

    const filename = file.originalname.toLowerCase();
    let title = file.originalname.replace(/\.[^/.]+$/, '');
    let excerpt = '';
    let sections: any[] = [];
    let slug = '';
    let metaTitle = '';
    let metaDescription = '';
    let focusKeyword = '';

    if (filename.endsWith('.json')) {
      const parsed = JSON.parse(buffer.toString('utf-8'));
      title = parsed.title || title;
      excerpt = parsed.excerpt || '';
      sections = parsed.sections || [
        {
          title: 'Main Content',
          content: parsed.content || '',
          sectionType: 'content',
          displayOrder: 1,
          subSections: [],
        },
      ];
      slug = parsed.slug || generateSlug(title);
      if (parsed.seo) {
        metaTitle = parsed.seo.metaTitle || '';
        metaDescription = parsed.seo.metaDescription || '';
        focusKeyword = parsed.seo.focusKeyword || '';
      }
    } else if (filename.endsWith('.docx')) {
      const textResult = await mammoth.extractRawText({ buffer });
      const rawText = textResult.value || '';
      const lines = rawText.split('\n').map((l: string) => l.trim()).filter(Boolean);

      let currentSectionTitle = 'Introduction';
      let currentSectionContent: string[] = [];

      for (const line of lines) {
        const lower = line.toLowerCase();
        if (lower.startsWith('meta title:')) {
          metaTitle = line.substring(11).trim();
        } else if (lower.startsWith('meta description:')) {
          metaDescription = line.substring(17).trim();
        } else if (lower.startsWith('url:') || lower.startsWith('slug:')) {
          slug = generateSlug(line.split(':')[1].trim());
        } else if (lower.startsWith('excerpt:')) {
          excerpt = line.substring(8).trim();
        } else if (lower.startsWith('focus keyword:')) {
          focusKeyword = line.substring(14).trim();
        } else if (lower.startsWith('title:') || (!title && line.length < 100 && !line.includes(':'))) {
          title = lower.startsWith('title:') ? line.substring(6).trim() : line;
        } else if (lower.startsWith('section:') || lower.startsWith('heading:')) {
          if (currentSectionContent.length > 0) {
            sections.push({
              title: currentSectionTitle,
              content: currentSectionContent.join('\n\n'),
              sectionType: 'content',
              displayOrder: sections.length + 1,
              subSections: [],
            });
            currentSectionContent = [];
          }
          currentSectionTitle = line.split(':')[1]?.trim() || 'Section';
        } else {
          currentSectionContent.push(line);
        }
      }

      if (currentSectionContent.length > 0) {
        sections.push({
          title: currentSectionTitle,
          content: currentSectionContent.join('\n\n'),
          sectionType: 'content',
          displayOrder: sections.length + 1,
          subSections: [],
        });
      }
    } else {
      // Plain text or Markdown
      const rawText = buffer.toString('utf-8');
      const lines = rawText.split('\n');

      let currentSectionTitle = 'Main Section';
      let currentSectionContent: string[] = [];

      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed.startsWith('# ')) {
          title = trimmed.replace(/^#\s+/, '');
        } else if (trimmed.startsWith('## ')) {
          if (currentSectionContent.length > 0) {
            sections.push({
              title: currentSectionTitle,
              content: currentSectionContent.join('\n\n'),
              sectionType: 'content',
              displayOrder: sections.length + 1,
              subSections: [],
            });
            currentSectionContent = [];
          }
          currentSectionTitle = trimmed.replace(/^##\s+/, '');
        } else {
          if (trimmed) currentSectionContent.push(trimmed);
        }
      }

      if (currentSectionContent.length > 0) {
        sections.push({
          title: currentSectionTitle,
          content: currentSectionContent.join('\n\n'),
          sectionType: 'content',
          displayOrder: sections.length + 1,
          subSections: [],
        });
      }
    }

    if (!excerpt && sections.length > 0 && sections[0].content) {
      excerpt = sections[0].content.substring(0, 160) + '...';
    }

    if (sections.length === 0) {
      sections.push({
        title: 'Overview',
        content: 'Content imported successfully.',
        sectionType: 'content',
        displayOrder: 1,
        subSections: [],
      });
    }

    const postData = {
      title: title || 'Imported Post',
      slug: slug || generateSlug(title || 'imported-post'),
      excerpt: excerpt || 'Imported post content',
      isPublished: false,
      sections,
      seo: {
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt,
        focusKeyword: focusKeyword || title,
      },
    };

    return PostService.createPost(postData, authorId);
  }

  static getWritingGuideTemplate() {
    return `Meta Title: Comprehensive Guide to Blog Imports
Meta Description: Learn how to author structured blog articles for QuillForge.
URL: guide-to-word-blog-imports
Excerpt: A step-by-step tutorial on structuring headings, media blocks, and sections directly in Word or Markdown.
Focus Keyword: blog import guide

Section: Introduction
Writing blog articles directly in MS Word or Markdown is simple and fast. This guide walks you through formatting sections, titles, and SEO metadata.

Section: Formatting Guidelines
Always ensure the top of your document contains the metadata keys delimited with a colon. Next, use the 'Section:' keyword prefix to divide your publication areas.

Section: Summary
By following these formatting rules, your documents will compile seamlessly into QuillForge with full SEO audit scores.
`;
  }
}
