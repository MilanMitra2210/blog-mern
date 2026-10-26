/**
 * Utility functions for rendering diverse block formats (HTML strings, Slate/Lexical JSON AST)
 * and generating rich SEO JSON-LD schemas (FAQPage, BlogPosting, Custom Schemas).
 */

export interface SlateLeaf {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  code?: boolean;
  [key: string]: any;
}

export interface SlateNode {
  type?: string;
  level?: number;
  url?: string;
  children?: (SlateNode | SlateLeaf)[];
  text?: string;
  [key: string]: any;
}

/**
 * Converts a Slate leaf / node to formatted HTML string.
 */
function renderInlineLeaf(leaf: SlateLeaf): string {
  let text = leaf.text || '';
  if (!text) return '';
  // Basic HTML escape for plain text content
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (leaf.bold) text = `<strong>${text}</strong>`;
  if (leaf.italic) text = `<em>${text}</em>`;
  if (leaf.underline) text = `<u>${text}</u>`;
  if (leaf.code) text = `<code class="px-1.5 py-0.5 rounded bg-gray-800 text-sky-300 font-mono text-sm">${text}</code>`;
  return text;
}

function renderSlateNode(node: SlateNode): string {
  if (node.text !== undefined) {
    return renderInlineLeaf(node as SlateLeaf);
  }

  const childrenHtml = Array.isArray(node.children)
    ? node.children.map((child) => (child.text !== undefined ? renderInlineLeaf(child) : renderSlateNode(child))).join('')
    : '';

  switch (node.type) {
    case 'heading': {
      const level = node.level || 2;
      return `<h${level} class="font-bold text-white mt-4 mb-2 text-xl sm:text-2xl">${childrenHtml}</h${level}>`;
    }
    case 'heading-one':
    case 'h1':
      return `<h1 class="font-black text-white mt-6 mb-3 text-2xl sm:text-3xl">${childrenHtml}</h1>`;
    case 'heading-two':
    case 'h2':
      return `<h2 class="font-bold text-white mt-5 mb-2 text-xl sm:text-2xl">${childrenHtml}</h2>`;
    case 'heading-three':
    case 'h3':
      return `<h3 class="font-semibold text-white mt-4 mb-2 text-lg sm:text-xl">${childrenHtml}</h3>`;
    case 'blockquote':
      return `<blockquote class="border-l-4 border-sky-500 pl-4 py-1 italic my-4 text-gray-300 bg-sky-950/20 rounded-r">${childrenHtml}</blockquote>`;
    case 'bulleted-list':
    case 'ul':
      return `<ul class="list-disc list-inside space-y-1.5 my-3 text-gray-300">${childrenHtml}</ul>`;
    case 'numbered-list':
    case 'ol':
      return `<ol class="list-decimal list-inside space-y-1.5 my-3 text-gray-300">${childrenHtml}</ol>`;
    case 'list-item':
    case 'li':
      return `<li class="leading-relaxed">${childrenHtml}</li>`;
    case 'link':
      return `<a href="${node.url || '#'}" target="_blank" rel="noopener noreferrer" class="text-sky-400 hover:text-sky-300 underline font-medium">${childrenHtml}</a>`;
    case 'paragraph':
    default:
      if (!childrenHtml.trim()) return '';
      return `<p class="leading-relaxed mb-3">${childrenHtml}</p>`;
  }
}

/**
 * Universal content to HTML converter:
 * Handles HTML string, Slate JSON array, Quote object, or raw text.
 */
export function renderContentToHtml(content: any): string {
  if (!content) return '';
  if (typeof content === 'string') return content;

  if (Array.isArray(content)) {
    return content.map(renderSlateNode).filter(Boolean).join('\n');
  }

  if (typeof content === 'object') {
    if (content.text) {
      let quoteHtml = `<blockquote class="border-l-4 border-sky-500 pl-4 py-2 italic text-gray-200 text-lg">&ldquo;${content.text}&rdquo;</blockquote>`;
      if (content.author) {
        quoteHtml += `<p class="text-sm font-semibold text-sky-400 mt-2">— ${content.author}${content.designation ? `, <span class="text-gray-400 font-normal">${content.designation}</span>` : ''}</p>`;
      }
      return quoteHtml;
    }
  }

  return '';
}

/**
 * Strips HTML tags and extracts pure plain text for search engines and JSON-LD schema.
 */
export function extractPlainText(content: any): string {
  if (!content) return '';

  if (typeof content === 'string') {
    return content
      .replace(/<[^>]*>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (Array.isArray(content)) {
    const extractLeaves = (nodes: any[]): string => {
      return nodes
        .map((n) => {
          if (n.text !== undefined) return n.text;
          if (Array.isArray(n.children)) return extractLeaves(n.children);
          return '';
        })
        .join(' ');
    };
    return extractLeaves(content).replace(/\s+/g, ' ').trim();
  }

  if (typeof content === 'object') {
    if (content.text) {
      return `${content.text}${content.author ? ` — ${content.author}` : ''}`;
    }
  }

  return '';
}

/**
 * Automatically builds Schema.org FAQPage JSON-LD from blog sections.
 */
export function buildFaqJsonLd(sections: any[] | undefined): Record<string, any> | null {
  if (!Array.isArray(sections) || sections.length === 0) return null;

  const faqItems: Array<{ question: string; answer: string }> = [];

  for (const section of sections) {
    if (section.sectionType === 'faq') {
      if (Array.isArray(section.subSections) && section.subSections.length > 0) {
        for (const sub of section.subSections) {
          const q = (sub.title || '').trim();
          const a = extractPlainText(sub.content);
          if (q && a) {
            faqItems.push({ question: q, answer: a });
          }
        }
      } else if (section.title && section.content) {
        const q = section.title.trim();
        const a = extractPlainText(section.content);
        if (q && a) {
          faqItems.push({ question: q, answer: a });
        }
      }
    }
  }

  if (faqItems.length === 0) return null;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqItems.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/**
 * Builds Schema.org BlogPosting / Article JSON-LD
 */
export function buildArticleJsonLd(post: any, siteUrl: string = 'http://localhost:3003'): Record<string, any> {
  const permalink = `${siteUrl}/blog/${post.slug}`;
  const banner = post.bannerImage?.url || post.featuredImage || post.seo?.ogImage || '';
  const authorName = typeof post.author === 'object' && post.author !== null 
    ? post.author.name 
    : (typeof post.author === 'string' ? post.author : 'QuillForge Author');

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': permalink,
    },
    headline: post.seo?.metaTitle || post.title,
    description: post.seo?.metaDescription || post.excerpt || '',
    image: banner ? [banner] : [],
    datePublished: post.publishDate || post.createdAt,
    dateModified: post.updatedAt || post.publishDate || post.createdAt,
    author: {
      '@type': 'Person',
      name: authorName,
      jobTitle: post.author?.designation || 'Staff Engineer',
    },
    publisher: {
      '@type': 'Organization',
      name: 'QuillForge',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/favicon.ico`,
      },
    },
  };
}

/**
 * Extracts custom JSON-LD schemas from post.seo.jsonLd
 */
export function extractCustomJsonLd(jsonLd: any): any[] {
  if (!jsonLd) return [];

  const results: any[] = [];

  const parseItem = (item: any) => {
    if (!item) return;
    if (typeof item === 'string') {
      try {
        const parsed = JSON.parse(item);
        if (parsed) results.push(parsed);
      } catch (e) {
        // invalid json string, ignore
      }
    } else if (typeof item === 'object') {
      if (item.schema) {
        // { id: '...', schema: '...' or {...} }
        parseItem(item.schema);
      } else if (item['@context'] || item['@type']) {
        results.push(item);
      }
    }
  };

  if (Array.isArray(jsonLd)) {
    for (const item of jsonLd) {
      parseItem(item);
    }
  } else {
    parseItem(jsonLd);
  }

  return results;
}
