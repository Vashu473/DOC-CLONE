export function canAccessDocument(input: {
  userId: string;
  ownerId: string;
  shareUserIds: string[];
}): boolean {
  if (input.userId === input.ownerId) return true;
  return input.shareUserIds.includes(input.userId);
}

export function canManageSharing(userId: string, ownerId: string): boolean {
  return userId === ownerId;
}

export function isOwnedBy(userId: string, ownerId: string): boolean {
  return userId === ownerId;
}
