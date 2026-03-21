// src/api/userApi.ts
import { httpClient } from './httpClient';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | 'USER' | string;

export type AppUser = {
  user_id: number;
  company_id: number;
  user_name: string;
  full_name: string | null;
  role: UserRole;
  email: string | null;
  phone: string | null;
  is_active: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
};

export type UpdateUserPayload = {
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  role?: UserRole | null;
  is_active?: number | null;
};

export const userApi = {
  async list() {
    const res = await httpClient.get<AppUser[]>('/users');
    return res.data;
  },

  async getById(id: number) {
    const res = await httpClient.get<AppUser>(`/users/${id}`);
    return res.data;
  },

  async update(id: number, payload: UpdateUserPayload) {
    const res = await httpClient.put<{ message: string }>(
      `/users/${id}`,
      payload,
    );
    return res.data;
  },

  async deactivate(id: number) {
    const res = await httpClient.patch<{ message: string }>(
      `/users/${id}/deactivate`,
    );
    return res.data;
  },
};
