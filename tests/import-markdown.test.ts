import { describe, expect, it } from "vitest";
import {
  assertImportFile,
  fileToTiptapDoc,
  markdownToTiptap,
} from "../lib/import-file";

describe("markdown import", () => {
  it("turns a heading and bullets into TipTap JSON", () => {
    const doc = markdownToTiptap("# Title\n\n- item\n- two");
    expect(doc.type).toBe("doc");
    expect(doc.content?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 1 },
    });
    expect(doc.content?.[1]?.type).toBe("bulletList");
    expect(doc.content?.[1]?.content).toHaveLength(2);
  });

  it("imports md files with a title from the filename", () => {
    const result = fileToTiptapDoc("sprint-notes.md", "## Goals\n\n1. Ship");
    expect(result.title).toBe("sprint-notes");
    expect(result.content.content?.[0]).toMatchObject({
      type: "heading",
      attrs: { level: 2 },
    });
    expect(result.content.content?.[1]?.type).toBe("orderedList");
  });

  it("rejects unsupported types", () => {
    expect(() => assertImportFile("brief.docx", 100)).toThrow(
      /Unsupported file type/,
    );
  });
});
