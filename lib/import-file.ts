export type TipTapMark = { type: string };
export type TipTapNode = {
  type: string;
  attrs?: Record<string, unknown>;
  content?: TipTapNode[];
  text?: string;
  marks?: TipTapMark[];
};

export const emptyDoc: TipTapNode = {
  type: "doc",
  content: [{ type: "paragraph" }],
};

const MAX_IMPORT_BYTES = 1_000_000;
const ALLOWED_EXT = [".txt", ".md", ".markdown"];

export function assertImportFile(filename: string, byteLength: number): void {
  const lower = filename.toLowerCase();
  const ok = ALLOWED_EXT.some((ext) => lower.endsWith(ext));
  if (!ok) {
    throw new Error("Unsupported file type. Import .txt or .md only.");
  }
  if (byteLength > MAX_IMPORT_BYTES) {
    throw new Error("File is too large. Max size is 1 MB.");
  }
}

export function titleFromFilename(filename: string): string {
  return filename.replace(/\.(md|markdown|txt)$/i, "").trim() || "Imported document";
}

function textNode(text: string): TipTapNode[] {
  if (!text) return [];
  const nodes: TipTapNode[] = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|_[^_]+_)/g;
  let last = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text))) {
    if (match.index > last) {
      nodes.push({ type: "text", text: text.slice(last, match.index) });
    }
    const token = match[0];
    if (token.startsWith("**")) {
      nodes.push({
        type: "text",
        text: token.slice(2, -2),
        marks: [{ type: "bold" }],
      });
    } else {
      nodes.push({
        type: "text",
        text: token.slice(1, -1),
        marks: [{ type: "italic" }],
      });
    }
    last = match.index + token.length;
  }
  if (last < text.length) {
    nodes.push({ type: "text", text: text.slice(last) });
  }
  return nodes.length ? nodes : [{ type: "text", text }];
}

function paragraph(text: string): TipTapNode {
  return { type: "paragraph", content: textNode(text) };
}

function heading(level: 1 | 2 | 3, text: string): TipTapNode {
  return {
    type: "heading",
    attrs: { level },
    content: textNode(text),
  };
}

function bulletList(items: string[]): TipTapNode {
  return {
    type: "bulletList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

function orderedList(items: string[]): TipTapNode {
  return {
    type: "orderedList",
    content: items.map((item) => ({
      type: "listItem",
      content: [paragraph(item)],
    })),
  };
}

export function markdownToTiptap(markdown: string): TipTapNode {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const content: TipTapNode[] = [];
  let bullets: string[] = [];
  let numbers: string[] = [];

  const flushLists = () => {
    if (bullets.length) {
      content.push(bulletList(bullets));
      bullets = [];
    }
    if (numbers.length) {
      content.push(orderedList(numbers));
      numbers = [];
    }
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^[-*]\s+(.+)$/);
    const numbered = line.match(/^\d+\.\s+(.+)$/);
    if (bullet) {
      if (numbers.length) {
        content.push(orderedList(numbers));
        numbers = [];
      }
      bullets.push(bullet[1]);
      continue;
    }
    if (numbered) {
      if (bullets.length) {
        content.push(bulletList(bullets));
        bullets = [];
      }
      numbers.push(numbered[1]);
      continue;
    }
    flushLists();
    if (!line.trim()) continue;
    const h1 = line.match(/^#\s+(.+)$/);
    const h2 = line.match(/^##\s+(.+)$/);
    const h3 = line.match(/^###\s+(.+)$/);
    if (h1) content.push(heading(1, h1[1]));
    else if (h2) content.push(heading(2, h2[1]));
    else if (h3) content.push(heading(3, h3[1]));
    else content.push(paragraph(line.trim()));
  }
  flushLists();
  if (!content.length) content.push({ type: "paragraph" });
  return { type: "doc", content };
}

export function plainTextToTiptap(text: string): TipTapNode {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/);
  const content = blocks
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => paragraph(block.replace(/\n/g, " ")));
  return {
    type: "doc",
    content: content.length ? content : [{ type: "paragraph" }],
  };
}

export function fileToTiptapDoc(filename: string, text: string): {
  title: string;
  content: TipTapNode;
} {
  const title = titleFromFilename(filename);
  const lower = filename.toLowerCase();
  const content =
    lower.endsWith(".md") || lower.endsWith(".markdown")
      ? markdownToTiptap(text)
      : plainTextToTiptap(text);
  return { title, content };
}
