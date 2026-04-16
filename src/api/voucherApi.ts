// ============================================================
// src/api/voucherApi.ts
// ============================================================

import { httpClient } from "./httpClient";
import {
  Voucher,
  VoucherDetailResponse,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  VoucherType,
  DailyExpenseRow,
} from "./types";

export const voucherApi = {
  // ── GET /api/vouchers ─────────────────────────────────────
  async getAll(params?: {
    type?: VoucherType;
    fromDate?: string;
    toDate?: string;
  }): Promise<Voucher[]> {
    const res = await httpClient.get<Voucher[]>("/vouchers", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── GET /api/vouchers/next-number ─────────────────────────
  async getNextNumber(payload: {
    voucher_type: VoucherType;
    voucher_date: string;
  }): Promise<{ voucher_no: string }> {
    const res = await httpClient.get<{ voucher_no: string }>(
      "/vouchers/next-number",
      { params: payload }
    );
    return res.data;
  },

  // ── GET /api/vouchers/daily?date=YYYY-MM-DD ───────────────
  async getDaily(params: { date: string }): Promise<Voucher[]> {
    const res = await httpClient.get<Voucher[]>("/vouchers/daily", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── GET /api/vouchers/expenses?date=YYYY-MM-DD ────────────
  async getExpenses(params: { date: string }): Promise<DailyExpenseRow[]> {
    const res = await httpClient.get<DailyExpenseRow[]>("/vouchers/expenses", {
      params,
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── GET /api/vouchers/:id ─────────────────────────────────
  async getById(id: number): Promise<VoucherDetailResponse> {
    const res = await httpClient.get<VoucherDetailResponse>(`/vouchers/${id}`);
    return res.data;
  },

  // ── POST /api/vouchers ────────────────────────────────────
  async create(payload: CreateVoucherPayload): Promise<VoucherDetailResponse> {
    const res = await httpClient.post<VoucherDetailResponse>("/vouchers", payload);
    return res.data;
  },

  // ── PUT /api/vouchers/:id ─────────────────────────────────
  async update(
    id: number,
    payload: UpdateVoucherPayload
  ): Promise<VoucherDetailResponse> {
    const res = await httpClient.put<VoucherDetailResponse>(
      `/vouchers/${id}`,
      payload
    );
    return res.data;
  },

  // ── DELETE /api/vouchers/:id ──────────────────────────────
  async remove(id: number): Promise<void> {
    await httpClient.delete(`/vouchers/${id}`);
  },
};