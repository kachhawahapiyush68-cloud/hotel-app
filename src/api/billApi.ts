// ============================================================
// src/api/billApi.ts
// ============================================================

import { httpClient } from "./httpClient";
import {
  Bill,
  BillDetailResponse,
  BillListParams,
  CreateBillPayload,
  CreateBillFromKotPayload,
  CreateBillFromBookingPayload,
  UpdateBillPayload,
  MarkPaidPayload,
  MarkPaidResponse,
  MarkRefundPayload,
  MarkRefundResponse,
  normalizePaymentStatus,
} from "../modules/bill/types";

function normalizeBillTypeForBackend(raw?: string | null): string {
  const v = String(raw || "").trim().toUpperCase();
  if (v === "RESTAURANT") return "Restaurant";
  if (v === "ROOM") return "Room";
  return String(raw || "").trim();
}

export const billApi = {
  async getBills(params?: BillListParams): Promise<Bill[]> {
    const res = await httpClient.get<Bill[]>("/bills", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBillById(id: number): Promise<BillDetailResponse> {
    const res = await httpClient.get<BillDetailResponse>(`/bills/${id}`);
    return res.data;
  },

  async createBill(payload: CreateBillPayload): Promise<Bill> {
    const body: CreateBillPayload = {
      ...payload,
      bill_type: normalizeBillTypeForBackend(payload.bill_type),
    };
    const res = await httpClient.post<Bill>("/bills", body);
    return res.data;
  },

  async createBillFromKot(
    payload: CreateBillFromKotPayload
  ): Promise<BillDetailResponse> {
    const body: CreateBillFromKotPayload = {
      ...payload,
      bill_type: "Restaurant",
    };
    const res = await httpClient.post<BillDetailResponse>(
      "/bills/from-kot",
      body
    );
    return res.data;
  },

  async createBillFromBooking(
    payload: CreateBillFromBookingPayload
  ): Promise<BillDetailResponse> {
    const body: CreateBillFromBookingPayload = {
      ...payload,
      bill_type: "Room",
    };
    const res = await httpClient.post<BillDetailResponse>(
      "/bills/from-booking",
      body
    );
    return res.data;
  },

  async updateBill(
    id: number,
    payload: UpdateBillPayload
  ): Promise<BillDetailResponse> {
    const res = await httpClient.put<BillDetailResponse>(
      `/bills/${id}`,
      payload
    );
    return res.data;
  },

  async updatePaymentStatus(id: number, paymentStatus: string): Promise<Bill> {
    const normalized = normalizePaymentStatus(paymentStatus);
    const res = await httpClient.patch<Bill>(`/bills/${id}/payment-status`, {
      payment_status: normalized,
    });
    return res.data;
  },

  async markPaid(
    id: number,
    payload: MarkPaidPayload
  ): Promise<MarkPaidResponse> {
    const res = await httpClient.post<MarkPaidResponse>(
      `/bills/${id}/mark-paid`,
      payload
    );
    return res.data;
  },

  async markRefund(
    id: number,
    payload: MarkRefundPayload
  ): Promise<MarkRefundResponse> {
    const res = await httpClient.post<MarkRefundResponse>(
      `/bills/${id}/mark-refund`,
      payload
    );
    return res.data;
  },

  async deleteBill(id: number): Promise<void> {
    await httpClient.delete(`/bills/${id}`);
  },
};