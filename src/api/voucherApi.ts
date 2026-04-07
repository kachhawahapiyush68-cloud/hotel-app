import { httpClient } from "./httpClient";
import {
  Voucher,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "./types";

export const voucherApi = {
  async getAll(params?: {
    type?: string;
    from?: string;
    to?: string;
    companyid?: number;
  }): Promise<Voucher[]> {
    const res = await httpClient.get<Voucher[]>("/vouchers", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: number): Promise<Voucher> {
    const res = await httpClient.get<Voucher>(`/vouchers/${id}`);
    return res.data;
  },

  async getNextNumber(payload: {
    voucher_type: string;
    voucher_date: string;
    companyid?: number;
  }): Promise<{ voucher_no: string }> {
    const res = await httpClient.get<{ voucher_no: string }>(
      "/vouchers/next-number",
      { params: payload }
    );
    return res.data;
  },

  async create(payload: CreateVoucherPayload): Promise<Voucher> {
    const res = await httpClient.post<Voucher>("/vouchers", payload);
    return res.data;
  },

  async update(id: number, payload: UpdateVoucherPayload): Promise<Voucher> {
    const res = await httpClient.put<Voucher>(`/vouchers/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/vouchers/${id}`);
  },
};