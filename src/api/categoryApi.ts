// src/api/categoryApi.ts
import { httpClient } from './httpClient';
import { useAuthStore } from '../store/authStore';

export type Category = {
  category_id: number;
  company_id: number;
  category_type: string;
  category_name: string;
  description?: string | null;
  is_active: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
};

export type CategoryPayload = {
  company_id?: number;           // backend fills for non SUPER_ADMIN
  category_type: string;
  category_name: string;
  description?: string | null;
  is_active?: number;
};

export type CategoryQueryParams = {
  category_type?: string;
  companyid?: number;            // only for SUPER_ADMIN
};

export const categoryApi = {
  async list(params: CategoryQueryParams = {}): Promise<Category[]> {
    const { user, selectedCompanyId } = useAuthStore.getState();
    const role = (user?.role || '').toUpperCase();

    // For SUPER_ADMIN, if companyid not passed explicitly, use selectedCompanyId if available
    if (role === 'SUPER_ADMIN' && !params.companyid) {
      if (selectedCompanyId) {
        params.companyid = selectedCompanyId;
      }
    }

    const res = await httpClient.get('/categories', { params });
    return res.data as Category[];
  },

  async create(payload: CategoryPayload): Promise<Category> {
    const res = await httpClient.post('/categories', payload);
    return res.data as Category;
  },

  async update(id: number, payload: Partial<CategoryPayload>): Promise<Category> {
    const res = await httpClient.put(`/categories/${id}`, payload);
    return res.data as Category;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/categories/${id}`);
  },
};
