// src/shared/utils/role.ts

export type UserRole = 'ADMIN' | 'SUPER_ADMIN' | 'USER' | string;

export function normalizeRole(role?: string | null): UserRole {
  if (!role) return '' as UserRole;
  return role.toUpperCase() as UserRole;
}

export function isAdmin(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === 'ADMIN' || r === 'SUPER_ADMIN';
}

export function isSuperAdmin(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === 'SUPER_ADMIN';
}

export function isBasicUser(role?: string | null): boolean {
  const r = normalizeRole(role);
  return r === 'USER';
}
