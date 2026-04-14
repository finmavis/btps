export type HasNameAndOptionalInitials = {
  name: string;
  initials?: string;
};

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (
      parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)
    ).toUpperCase();
  }
  if (parts.length === 1 && parts[0]!.length >= 2) {
    return parts[0]!.slice(0, 2).toUpperCase();
  }
  return (parts[0]?.charAt(0) ?? '?').toUpperCase();
}

export function resolveInitials(account: HasNameAndOptionalInitials): string {
  const raw = (account.initials ?? initialsFromName(account.name)).trim();
  return raw.slice(0, 2).toUpperCase();
}
