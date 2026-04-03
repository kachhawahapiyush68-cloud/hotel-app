// src/api/billApi.ts
import { httpClient } from "./httpClient";

export type BillType = "Restaurant" | "Room" | "Other";
export type BillPaymentStatus = "Unpaid" | "Paid" | "PartiallyPaid";

export interface Bill {
  bill_id: number;
  company_id: number;
  bill_no: string;
  bill_datetime: string;
  bill_type: BillType | string;
  guest_id: number | null;
  booking_id: number | null;
  folio_id: number | null;
  room_id: number | null;
  gross_amount: number;
  discount_amount: number;
  tax_amount: number;
  round_off: number;
  net_amount: number;
  payment_status: BillPaymentStatus | string;
  created_by: number | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BillItem {
  bill_item_id: number;
  bill_id: number;
  source_type: string;
  source_ref_id: number | null;
  product_id: number;
  qty: number;
  rate: number;
  amount: number;
  tax_amount: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BillCreateInput {
  company_id?: number;
  bill_no: string;
  bill_datetime?: string;
  bill_type: BillType | string;
  guest_id?: number | null;
  booking_id?: number | null;
  folio_id?: number | null;
  room_id?: number | null;
  gross_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  round_off?: number;
  net_amount?: number;
  payment_status?: BillPaymentStatus | string;
}

export interface BillFromKotInput {
  company_id?: number;
  kot_ids?: number[];
  bill_type: BillType | string;
  guest_id?: number;
  booking_id?: number;
  folio_id?: number;
  room_id?: number;
  gross_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  round_off?: number;
  net_amount?: number;
}

export const billApi = {
  async list(params?: {
    companyid?: number;
    billtype?: string;
  }): Promise<Bill[]> {
    const res = await httpClient.get<Bill[]>("/bills", { params });
    return res.data;
  },

  async get(id: number): Promise<{ bill: Bill; items: BillItem[] }> {
    const res = await httpClient.get<{ bill: Bill; items: BillItem[] }>(
      `/bills/${id}`
    );
    return res.data;
  },

  async create(input: BillCreateInput): Promise<Bill> {
    const res = await httpClient.post<Bill>("/bills", input);
    return res.data;
  },

  async createFromKot(input: BillFromKotInput): Promise<{
    bill: Bill;
    items: BillItem[];
  }> {
    const manualPayload: BillCreateInput = {
      company_id: input.company_id,
      bill_no: `BILL-${Date.now()}`,
      bill_type: input.bill_type,
      guest_id: input.guest_id ?? null,
      booking_id: input.booking_id ?? null,
      folio_id: input.folio_id ?? null,
      room_id: input.room_id ?? null,
      gross_amount: input.gross_amount ?? 0,
      discount_amount: input.discount_amount ?? 0,
      tax_amount: input.tax_amount ?? 0,
      round_off: input.round_off ?? 0,
      net_amount: input.net_amount ?? 0,
      payment_status: "Unpaid",
    };

    const bill = await this.create(manualPayload);
    return { bill, items: [] };
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/bills/${id}`);
  },

  async updatePaymentStatus(
    id: number,
    payment_status: BillPaymentStatus | string
  ): Promise<Bill> {
    const res = await httpClient.patch<Bill>(`/bills/${id}/payment-status`, {
      payment_status,
    });
    return res.data;
  },
};