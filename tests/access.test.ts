import { describe, expect, it } from "vitest";
import { canAccessDocument, canManageSharing, isOwnedBy } from "../lib/permissions";
import { listBucket } from "../lib/document-rules";

const alice = "alice";
const bob = "bob";
const carol = "carol";

describe("1/7/8 login-adjacent access + sharing rules", () => {
  it("owner can access without a share row", () => {
    expect(
      canAccessDocument({ userId: alice, ownerId: alice, shareUserIds: [] }),
    ).toBe(true);
    expect(isOwnedBy(alice, alice)).toBe(true);
    expect(listBucket(alice, alice)).toBe("owned");
  });

  it("shared user B can access after grant", () => {
    expect(
      canAccessDocument({
        userId: bob,
        ownerId: alice,
        shareUserIds: [bob],
      }),
    ).toBe(true);
    expect(listBucket(bob, alice)).toBe("shared");
  });

  it("unrelated user C cannot access", () => {
    expect(
      canAccessDocument({
        userId: carol,
        ownerId: alice,
        shareUserIds: [bob],
      }),
    ).toBe(false);
  });

  it("only the owner can manage sharing", () => {
    expect(canManageSharing(alice, alice)).toBe(true);
    expect(canManageSharing(bob, alice)).toBe(false);
    expect(canManageSharing(carol, alice)).toBe(false);
  });
});
