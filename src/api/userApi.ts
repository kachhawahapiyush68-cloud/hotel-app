// src/api/userApi.ts
import { httpClient } from './httpClient';

export type AppUser = {
  user_id: number;
  company_id: number;
  user_name: string;
  full_name?: string;
  role: string;
  is_active: number;
};

export async function fetchUsers(): Promise<AppUser[]> {
  const res = await httpClient.get<AppUser[]>('/users');
  return res.data;
}

export async function updateUserStatus(userId: number, isActive: boolean) {
  const res = await httpClient.patch(`/users/${userId}/status`, {
    is_active: isActive ? 1 : 0,
  });
  return res.data;
}
