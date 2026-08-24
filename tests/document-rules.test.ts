import { describe, expect, it } from "vitest";
import {
  DEFAULT_TITLE,
  isValidTiptapDoc,
  normalizeDocumentTitle,
  resolveShareTargetError,
} from "../lib/document-rules";
import { emptyDoc } from "../lib/import-file";

describe("2/3/5/9 title, save validation, share errors", () => {
  it("new documents use a sensible default title", () => {
    expect(DEFAULT_TITLE).toBe("Untitled document");
  });

  it("empty or whitespace title falls back instead of crashing", () => {
    expect(normalizeDocumentTitle("")).toBe(DEFAULT_TITLE);
    expect(normalizeDocumentTitle("   ")).toBe(DEFAULT_TITLE);
  });

  it("keeps a renamed title", () => {
    expect(normalizeDocumentTitle("Q3 plan")).toBe("Q3 plan");
  });

  it("truncates very long titles", () => {
    expect(normalizeDocumentTitle("x".repeat(250)).length).toBe(200);
  });

  it("accepts empty TipTap doc JSON for blank save", () => {
    expect(isValidTiptapDoc(emptyDoc)).toBe(true);
  });

  it("rejects invalid content payloads", () => {
    expect(isValidTiptapDoc(null)).toBe(false);
    expect(isValidTiptapDoc("html")).toBe(false);
    expect(isValidTiptapDoc({ type: "paragraph" })).toBe(false);
  });

  it("share to unknown user returns a clear error", () => {
    expect(
      resolveShareTargetError({
        email: "nobody@ajaia.dev",
        ownerId: "alice",
        target: null,
      }),
    ).toMatch(/User not found/);
  });

  it("empty share email is rejected", () => {
    expect(
      resolveShareTargetError({
        email: "  ",
        ownerId: "alice",
        target: null,
      }),
    ).toMatch(/Enter an email/);
  });

  it("cannot share to the owner", () => {
    expect(
      resolveShareTargetError({
        email: "alice@ajaia.dev",
        ownerId: "alice",
        target: { id: "alice" },
      }),
    ).toMatch(/already has full access/);
  });
});
