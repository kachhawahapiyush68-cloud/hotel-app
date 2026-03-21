// src/api/productApi.ts
import { httpClient } from './httpClient';

export type Product = {
  product_id: number;
  company_id: number;
  category_id: number;
  product_code: string | null;
  product_name: string;
  unit: string;
  rate: number;
  tax_group_id: number | null;
  is_service: number;
  is_active: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
};

export type ProductPayload = {
  company_id?: number;
  category_id: number;
  product_code?: string | null;
  product_name: string;
  unit: string;
  rate: number;
  tax_group_id?: number | null;
  is_service?: number;
  is_active?: number;
};

export type ProductUpdatePayload = Partial<ProductPayload>;

export const productApi = {
  async list(params?: { companyid?: number }) {
    const res = await httpClient.get<Product[]>('/products', { params });
    return res.data;
  },

  async getById(id: number) {
    const res = await httpClient.get<Product>(`/products/${id}`);
    return res.data;
  },

  async create(payload: ProductPayload) {
    const res = await httpClient.post<Product>('/products', payload);
    return res.data;
  },

  async update(id: number, payload: ProductUpdatePayload) {
    const res = await httpClient.put<Product>(`/products/${id}`, payload);
    return res.data;
  },

  async deactivate(id: number) {
    await httpClient.delete<void>(`/products/${id}`);
  },
};
