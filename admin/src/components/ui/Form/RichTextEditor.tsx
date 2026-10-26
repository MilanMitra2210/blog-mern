import React from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  ClassicEditor,
  Essentials,
  Paragraph,
  Heading,
  Bold,
  Italic,
  Underline,
  Link,
  List,
  BlockQuote,
  Table,
  Alignment,
  FontColor,
  FontBackgroundColor,
} from "ckeditor5";
import { useController } from "react-hook-form";
import "ckeditor5/ckeditor5.css";

interface RichTextEditorProps {
  name?: string;
  control?: any;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  value?: any;
  onChange?: (val: any) => void;
}

// Helper to parse HTML nodes into rich structured child block format
export const parseInlineNodes = (parent: Node): any[] => {
  const result: any[] = [];
  parent.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      if (node.nodeValue) {
        result.push({
          type: "text",
          text: node.nodeValue,
        });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const tagName = el.tagName.toLowerCase();

      if (tagName === "a") {
        const url = el.getAttribute("href") || "";
        result.push({
          type: "link",
          url: url,
          children: parseInlineNodes(el),
        });
      } else if (tagName === "strong" || tagName === "b") {
        const children = parseInlineNodes(el);
        children.forEach((c) => {
          if (c.type === "text") c.bold = true;
        });
        result.push(...children);
      } else if (tagName === "em" || tagName === "i") {
        const children = parseInlineNodes(el);
        children.forEach((c) => {
          if (c.type === "text") c.italic = true;
        });
        result.push(...children);
      } else if (tagName === "u") {
        const children = parseInlineNodes(el);
        children.forEach((c) => {
          if (c.type === "text") c.underline = true;
        });
        result.push(...children);
      } else {
        result.push(...parseInlineNodes(el));
      }
    }
  });
  return result;
};

// Convert HTML string to structured ContentBlock[] JSON structure
export const htmlToBlocks = (html: string): any[] => {
  if (!html) return [];

  const blocks: any[] = [];
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    const children = Array.from(doc.body.children);

    children.forEach((el) => {
      const tagName = el.tagName.toLowerCase();

      if (tagName === "p") {
        blocks.push({
          type: "paragraph",
          children: parseInlineNodes(el),
        });
      } else if (tagName.match(/^h[1-6]$/)) {
        const headingLevel = parseInt(tagName.charAt(1)) || 2;
        blocks.push({
          type: "heading",
          level: headingLevel,
          children: parseInlineNodes(el),
        });
      } else if (tagName === "ul" || tagName === "ol") {
        const items = Array.from(el.children)
          .filter((child) => child.tagName.toLowerCase() === "li")
          .map((li) => ({
            type: "list-item",
            children: parseInlineNodes(li),
          }));
        blocks.push({
          type: "list",
          format: tagName === "ol" ? "ordered" : "unordered",
          children: items,
        });
      } else if (tagName === "blockquote") {
        blocks.push({
          type: "blockquote",
          text: el.textContent || "",
        });
      } else {
        blocks.push({
          type: "paragraph",
          children: parseInlineNodes(el),
        });
      }
    });
  } catch (err) {
    console.error("Error parsing HTML to blocks:", err);
    blocks.push({
      type: "paragraph",
      children: [{ type: "text", text: html.replace(/<[^>]*>/g, "") }],
    });
  }

  return blocks;
};

// Helper to convert rich structured children back to HTML format
export const renderInline = (children: any[]): string => {
  if (!Array.isArray(children)) return "";
  return children
    .map((c) => {
      if (c.type === "link") {
        const url = c.url || "#";
        const inner = renderInline(c.children || []);
        return `<a href="${url}">${inner}</a>`;
      }
      let text = c.text || "";
      if (c.bold) text = `<strong>${text}</strong>`;
      if (c.italic) text = `<em>${text}</em>`;
      if (c.underline) text = `<u>${text}</u>`;
      return text;
    })
    .join("");
};

// Convert structured ContentBlock[] back to rich HTML string for CKEditor
export const blocksToHtml = (blocks: any[]): string => {
  if (!Array.isArray(blocks) || blocks.length === 0) return "";

  return blocks
    .map((block) => {
      switch (block.type) {
        case "heading": {
          const level = block.level || 2;
          const tag = `h${level}`;
          if (block.children) {
            const inline = renderInline(block.children);
            return `<${tag}>${inline}</${tag}>`;
          }
          return `<${tag}>${block.text || ""}</${tag}>`;
        }
        case "paragraph": {
          if (block.children) {
            const inline = renderInline(block.children);
            return `<p>${inline}</p>`;
          }
          return `<p>${block.text || ""}</p>`;
        }
        case "list": {
          if (block.children) {
            const tag = block.format === "ordered" ? "ol" : "ul";
            const items = block.children
              .map((item: any) => {
                const text = renderInline(item.children || []);
                return `<li>${text}</li>`;
              })
              .join("");
            return `<${tag}>${items}</${tag}>`;
          }
          const itemsHtml = (block.items || [])
            .map((item: string) => `<li>${item}</li>`)
            .join("");
          return `<ul>${itemsHtml}</ul>`;
        }
        case "blockquote":
          return `<blockquote>${block.text || ""}</blockquote>`;
        default:
          if (block.children) {
            const inline = renderInline(block.children);
            return `<p>${inline}</p>`;
          }
          return `<p>${block.text || ""}</p>`;
      }
    })
    .join("");
};

/** Unwrap a special-section content object to a renderable block array. */
const unwrapBlocks = (value: any): any[] | null => {
  if (Array.isArray(value)) return value;
  // Handles: { type: "summary", blocks: [...], buttonText, ... }
  if (value && typeof value === "object" && Array.isArray(value.blocks)) {
    return value.blocks;
  }
  return null;
};

/** Safely convert any value stored in RHF (array, JSON string, plain string) to an HTML string. */
export const valueToHtml = (value: any): string => {
  if (!value) return "";
  const unwrapped = unwrapBlocks(value);
  if (unwrapped) return blocksToHtml(unwrapped);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      const unwrappedParsed = unwrapBlocks(parsed);
      if (unwrappedParsed) return blocksToHtml(unwrappedParsed);
      return value;
    } catch {
      return value;
    }
  }
  return "";
};

interface BaseRichTextEditorProps {
  value: any;
  onChange: (val: any) => void;
  error?: any;
  disabled?: boolean;
  label?: string;
  placeholder?: string;
}

export const BaseRichTextEditor: React.FC<BaseRichTextEditorProps> = ({
  value,
  onChange,
  error,
  disabled = false,
  label,
  placeholder,
}) => {
  const editorRef = React.useRef<any>(null);

  // Stable initial HTML — only computed once on mount.
  const initialHtml = React.useRef(valueToHtml(value));

  // Stringify value so we can detect meaningful changes without deep equality
  const stringifiedValue = React.useMemo(
    () => (value ? JSON.stringify(value) : ""),
    [value]
  );

  // Sync external value changes into the editor
  React.useEffect(() => {
    const editor = editorRef.current;
    if (!editor || editor.state === "destroyed") return;
    if (editor.ui?.focusTracker?.isFocused) return;
    try {
      const expectedHtml = valueToHtml(value);
      const currentData = editor.getData();
      if (currentData !== expectedHtml) {
        editor.setData(expectedHtml);
      }
    } catch {
      // Swallow
    }
  }, [value, stringifiedValue]);

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-xs font-black text-dark-blue/50 uppercase tracking-widest">
          {label}
        </label>
      )}
      <div
        className={`ck-wrapper rounded-2xl overflow-hidden border-2 bg-white/50 dark:bg-white/5 backdrop-blur-sm transition-all ${
          error
            ? "border-red-400 focus-within:ring-4 focus-within:ring-red-400/10"
            : "border-gray dark:border-white/10 hover:border-primary/30 dark:hover:border-primary/30 focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10"
        } ${disabled ? "pointer-events-none opacity-80" : ""}`}
      >
        <CKEditor
          editor={ClassicEditor}
          data={initialHtml.current}
          disabled={disabled}
          onReady={(editor) => {
            editorRef.current = editor;
            const currentHtml = valueToHtml(value);
            if (currentHtml && editor.getData() !== currentHtml) {
              editor.setData(currentHtml);
            }
          }}
          onError={(error, { willEditorRestart }) => {
            if (willEditorRestart) {
              editorRef.current = null;
            }
            console.warn("CKEditor error:", error);
          }}
          onChange={(_event, editor) => {
            const html = editor.getData();
            const blocks = htmlToBlocks(html);
            onChange(blocks);
          }}
          config={{
            licenseKey: import.meta.env.VITE_CKEDITOR_LICENSE_KEY || "GPL",
            plugins: [
              Essentials,
              Paragraph,
              Heading,
              Bold,
              Italic,
              Underline,
              Link,
              List,
              BlockQuote,
              Table,
              Alignment,
              FontColor,
              FontBackgroundColor,
            ],
            toolbar: disabled
              ? []
              : {
                  items: [
                    "heading",
                    "|",
                    "bold",
                    "italic",
                    "underline",
                    "|",
                    "alignment",
                    "fontColor",
                    "fontBackgroundColor",
                    "|",
                    "link",
                    "bulletedList",
                    "numberedList",
                    "blockQuote",
                    "insertTable",
                    "|",
                    "undo",
                    "redo",
                  ],
                  shouldNotGroupWhenFull: true,
                },
            heading: {
              options: [
                { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
                { model: "heading1", view: "h2", title: "Heading 1 (H2)", class: "ck-heading_heading1" },
                { model: "heading2", view: "h3", title: "Heading 2 (H3)", class: "ck-heading_heading2" },
                { model: "heading3", view: "h4", title: "Heading 3 (H4)", class: "ck-heading_heading3" },
              ],
            },
            placeholder: placeholder || "Start writing...",
          }}
        />
      </div>
      {error?.message && (
        <p className="text-xs text-red-500 font-medium mt-1">{error.message}</p>
      )}
    </div>
  );
};

const ControlledRichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  control,
  label,
  placeholder,
  disabled,
}) => {
  const {
    field: { value, onChange },
    fieldState: { error },
  } = useController({ name: name!, control });

  return (
    <BaseRichTextEditor
      value={value}
      onChange={onChange}
      error={error}
      disabled={disabled}
      label={label}
      placeholder={placeholder}
    />
  );
};

const RichTextEditor: React.FC<RichTextEditorProps> = ({
  name,
  control,
  label,
  placeholder,
  disabled = false,
  value,
  onChange,
}) => {
  if (control && name) {
    return (
      <ControlledRichTextEditor
        name={name}
        control={control}
        label={label}
        placeholder={placeholder}
        disabled={disabled}
      />
    );
  }

  return (
    <BaseRichTextEditor
      value={value}
      onChange={onChange || (() => {})}
      disabled={disabled}
      label={label}
      placeholder={placeholder}
    />
  );
};

export default RichTextEditor;
