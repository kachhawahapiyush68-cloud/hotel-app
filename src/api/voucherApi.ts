// src/api/voucherApi.ts

import { httpClient } from "./httpClient";
import {
  Voucher,
  CreateVoucherPayload,
  VoucherDetailResponse,
} from "./types";

export const voucherApi = {
  getAll: async () => {
    const res = await httpClient.get<Voucher[]>("/vouchers");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await httpClient.get<VoucherDetailResponse>(`/vouchers/${id}`);
    return res.data;
  },

  create: async (payload: CreateVoucherPayload) => {
    const res = await httpClient.post<VoucherDetailResponse>("/vouchers", payload);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await httpClient.delete(`/vouchers/${id}`);
    return res.data;
  },

  getByLedger: async (ledgerId: number) => {
    const res = await httpClient.get(`/vouchers/ledger/${ledgerId}`);
    return res.data;
  },
};