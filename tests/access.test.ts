import { describe, expect, it } from "vitest";
import { canAccessDocument, canManageSharing } from "../lib/permissions";

describe("document access", () => {
  it("allows the owner even with no shares", () => {
    expect(
      canAccessDocument({
        userId: "alice",
        ownerId: "alice",
        shareUserIds: [],
      }),
    ).toBe(true);
  });

  it("denies a user who was not granted access", () => {
    expect(
      canAccessDocument({
        userId: "bob",
        ownerId: "alice",
        shareUserIds: [],
      }),
    ).toBe(false);
  });

  it("allows a user after share", () => {
    expect(
      canAccessDocument({
        userId: "bob",
        ownerId: "alice",
        shareUserIds: ["bob"],
      }),
    ).toBe(true);
  });

  it("only lets the owner manage sharing", () => {
    expect(canManageSharing("alice", "alice")).toBe(true);
    expect(canManageSharing("bob", "alice")).toBe(false);
  });
});
