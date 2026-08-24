export const DEFAULT_TITLE = "Untitled document";

export function normalizeDocumentTitle(title: string): string {
  return title.trim().slice(0, 200) || DEFAULT_TITLE;
}

export function isValidTiptapDoc(content: unknown): boolean {
  return (
    Boolean(content) &&
    typeof content === "object" &&
    !Array.isArray(content) &&
    (content as { type?: string }).type === "doc"
  );
}

export function listBucket(
  viewerId: string,
  ownerId: string,
): "owned" | "shared" {
  return viewerId === ownerId ? "owned" : "shared";
}

export function emptyUploadMessage(byteLength: number): string | null {
  if (byteLength === 0) {
    return "Choose a .txt or .md file to import.";
  }
  return null;
}

export function resolveShareTargetError(input: {
  email: string;
  ownerId: string;
  target: { id: string } | null;
}): string | null {
  const normalized = input.email.trim().toLowerCase();
  if (!normalized) return "Enter an email address.";
  if (!input.target) {
    return "User not found. Use a seeded account such as bob@ajaia.dev or alice@ajaia.dev.";
  }
  if (input.target.id === input.ownerId) {
    return "The owner already has full access.";
  }
  return null;
}
