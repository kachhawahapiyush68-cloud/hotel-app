// src/api/companyApi.ts
import { httpClient } from './httpClient';

export interface Company {
  company_id?: number;
  company_code: string;
  company_name: string;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  pincode?: string | null;
  phone?: string | null;
  mobile?: string | null;
  email?: string | null;
  gst_no?: string | null;
  currency_code?: string | null;
  check_in_time?: string | null;
  check_out_time?: string | null;
  is_active?: number;
  is_deleted?: number;
  created_at?: Date | string;
  updated_at?: Date | string;
}

const base = '/companies';

export const companyApi = {
  async getAll(): Promise<Company[]> {
    const res = await httpClient.get<Company[]>(base);
    return res.data;
  },

  async getById(id: number): Promise<Company> {
    const res = await httpClient.get<Company>(`${base}/${id}`);
    return res.data;
  },

  async create(payload: Company): Promise<Company> {
    const res = await httpClient.post<Company>(base, payload);
    return res.data;
  },

  async update(id: number, payload: Partial<Company>): Promise<Company> {
    const res = await httpClient.put<Company>(`${base}/${id}`, payload);
    return res.data;
  },

  async deactivate(id: number): Promise<void> {
    await httpClient.patch(`${base}/${id}/deactivate`);
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`${base}/${id}`);
  },
};
