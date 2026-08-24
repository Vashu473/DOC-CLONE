import { describe, expect, it } from "vitest";
import {
  assertImportFile,
  emptyDoc,
  fileToTiptapDoc,
  markdownToTiptap,
  plainTextToTiptap,
  titleFromFilename,
} from "../lib/import-file";
import { emptyUploadMessage } from "../lib/document-rules";

describe("4 rich text import mapping + 6 file upload", () => {
  it("maps heading, bullets, and numbered lists", () => {
    const doc = markdownToTiptap(
      "# Title\n\n- item\n- two\n\n1. first\n2. second",
    );
    expect(doc.content?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 1 },
    });
    expect(doc.content?.[1]?.type).toBe("bulletList");
    expect(doc.content?.[1]?.content).toHaveLength(2);
    expect(doc.content?.[2]?.type).toBe("orderedList");
    expect(doc.content?.[2]?.content).toHaveLength(2);
  });

  it("maps mixed bold/italic in a paragraph", () => {
    const doc = markdownToTiptap("Hello **bold** and *italic* text");
    const marks = JSON.stringify(doc);
    expect(marks).toContain('"type":"bold"');
    expect(marks).toContain('"type":"italic"');
  });

  it("maps H2", () => {
    const doc = markdownToTiptap("## Section");
    expect(doc.content?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 2 },
    });
  });

  it("imports .txt into paragraphs without crashing", () => {
    const result = fileToTiptapDoc("notes.txt", "Hello world\n\nSecond block");
    expect(result.title).toBe("notes");
    expect(result.content.type).toBe("doc");
    expect(result.content.content?.length).toBeGreaterThan(0);
  });

  it("imports .md with filename as title", () => {
    const result = fileToTiptapDoc("sprint-notes.md", "## Goals\n\n1. Ship");
    expect(result.title).toBe("sprint-notes");
  });

  it("empty markdown still returns a valid doc (no crash)", () => {
    const doc = markdownToTiptap("");
    expect(doc).toEqual(emptyDoc);
    const txt = plainTextToTiptap("");
    expect(txt.type).toBe("doc");
  });

  it("empty file size is rejected with a message", () => {
    expect(emptyUploadMessage(0)).toMatch(/Choose a \.txt or \.md/);
    expect(emptyUploadMessage(12)).toBeNull();
  });

  it("rejects unsupported types including pdf and jpg", () => {
    expect(() => assertImportFile("brief.docx", 100)).toThrow(/Unsupported/);
    expect(() => assertImportFile("scan.pdf", 100)).toThrow(/Unsupported/);
    expect(() => assertImportFile("pic.jpg", 100)).toThrow(/Unsupported/);
  });

  it("rejects oversized files", () => {
    expect(() => assertImportFile("big.md", 2_000_000)).toThrow(/too large/);
  });

  it("title from filename is sensible", () => {
    expect(titleFromFilename("hello.txt")).toBe("hello");
    expect(titleFromFilename(".md")).toBe("Imported document");
  });
});
