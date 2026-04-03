// src/api/guestApi.ts
import { httpClient } from './httpClient';

export type Guest = {
  guest_id: number;
  company_id: number;
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  document_type?: string | null;
  document_no?: string | null;
  gst_no?: string | null;
  remarks?: string | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
};

export type GuestPayload = {
  title?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  mobile?: string | null;
  email?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
  document_type?: string | null;
  document_no?: string | null;
  gst_no?: string | null;
  remarks?: string | null;
};

export type GuestUpdatePayload = Partial<GuestPayload>;

export const guestApi = {
  async list() {
    const res = await httpClient.get<Guest[]>('/guests');
    return res.data;
  },

  async getById(id: number) {
    const res = await httpClient.get<Guest>(`/guests/${id}`);
    return res.data;
  },

  async create(payload: GuestPayload) {
    // company_id comes from backend via token (req.user.companyid)
    const res = await httpClient.post<Guest>('/guests', payload);
    return res.data;
  },

  async update(id: number, payload: GuestUpdatePayload) {
    const res = await httpClient.put<Guest>(`/guests/${id}`, payload);
    return res.data;
  },

  async remove(id: number) {
    await httpClient.delete<void>(`/guests/${id}`);
  },
};