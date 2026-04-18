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
  normalizePaymentMode,
} from "../modules/bill/types";

function normalizeBillTypeForBackend(raw?: string | null): string {
  const v = String(raw || "").trim().toUpperCase();
  if (v === "RESTAURANT") return "Restaurant";
  if (v === "ROOM") return "Room";
  return String(raw || "").trim();
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error("Invalid numeric value");
  }

  return n;
}

function toOptionalPositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const n = Number(value);
  if (!Number.isInteger(n) || n <= 0) {
    throw new Error("Invalid positive integer value");
  }

  return n;
}

function buildBillListParams(params?: BillListParams) {
  if (!params) return undefined;

  const billType = params.bill_type ?? params.billtype ?? undefined;
  const companyId = params.company_id ?? params.companyid ?? undefined;

  const query: Record<string, string | number> = {};

  if (billType) {
    query.bill_type = normalizeBillTypeForBackend(billType);
  }

  if (companyId !== undefined && companyId !== null && String(companyId).trim() !== "") {
    query.company_id = Number(companyId);
  }

  return Object.keys(query).length ? query : undefined;
}

export const billApi = {
  async getBills(params?: BillListParams): Promise<Bill[]> {
    const res = await httpClient.get<Bill[]>("/bills", {
      params: buildBillListParams(params),
    });

    return Array.isArray(res.data) ? res.data : [];
  },

  async getBillById(id: number): Promise<BillDetailResponse> {
    const res = await httpClient.get<BillDetailResponse>(`/bills/${Number(id)}`);
    return res.data;
  },

  async createBill(payload: CreateBillPayload): Promise<Bill> {
    const body: CreateBillPayload = {
      ...payload,
      bill_type: normalizeBillTypeForBackend(payload.bill_type),
      payment_status: payload.payment_status
        ? normalizePaymentStatus(payload.payment_status)
        : payload.payment_status,
      company_id: toOptionalPositiveInt(payload.company_id),
      guest_id: payload.guest_id ?? undefined,
      booking_id: payload.booking_id ?? undefined,
      folio_id: payload.folio_id ?? undefined,
      room_id: payload.room_id ?? undefined,
      gross_amount: toOptionalNumber(payload.gross_amount),
      discount_amount: toOptionalNumber(payload.discount_amount),
      tax_amount: toOptionalNumber(payload.tax_amount),
      round_off: toOptionalNumber(payload.round_off),
      net_amount: toOptionalNumber(payload.net_amount),
    };

    const res = await httpClient.post<Bill>("/bills", body);
    return res.data;
  },

  async createBillFromKot(
    payload: CreateBillFromKotPayload
  ): Promise<BillDetailResponse> {
    const body: CreateBillFromKotPayload = {
      ...payload,
      company_id: toOptionalPositiveInt(payload.company_id),
      kot_ids: Array.isArray(payload.kot_ids)
        ? payload.kot_ids.map((x) => Number(x)).filter((x) => Number.isInteger(x) && x > 0)
        : [],
      bill_type: "Restaurant",
      guest_id: toOptionalPositiveInt(payload.guest_id),
      booking_id: toOptionalPositiveInt(payload.booking_id),
      folio_id: toOptionalPositiveInt(payload.folio_id),
      room_id: toOptionalPositiveInt(payload.room_id),
      discount_amount: toOptionalNumber(payload.discount_amount),
      round_off: toOptionalNumber(payload.round_off),
      notes: payload.notes?.trim() || undefined,
    };

    const res = await httpClient.post<BillDetailResponse>("/bills/from-kot", body);
    return res.data;
  },

  async createBillFromBooking(
    payload: CreateBillFromBookingPayload
  ): Promise<BillDetailResponse> {
    const body: CreateBillFromBookingPayload = {
      ...payload,
      company_id: toOptionalPositiveInt(payload.company_id),
      booking_id: Number(payload.booking_id),
      bill_type: "Room",
      notes: payload.notes?.trim() || undefined,
      require_checkout:
        payload.require_checkout === undefined ? undefined : Boolean(payload.require_checkout),
    };

    const res = await httpClient.post<BillDetailResponse>("/bills/from-booking", body);
    return res.data;
  },

  async updateBill(
    id: number,
    payload: UpdateBillPayload
  ): Promise<BillDetailResponse> {
    const body: UpdateBillPayload = {
      discount_amount: toOptionalNumber(payload.discount_amount),
      round_off: toOptionalNumber(payload.round_off),
    };

    const res = await httpClient.put<BillDetailResponse>(`/bills/${Number(id)}`, body);
    return res.data;
  },

  async updatePaymentStatus(id: number, paymentStatus: string): Promise<Bill> {
    const normalized = normalizePaymentStatus(paymentStatus);

    const res = await httpClient.patch<Bill>(`/bills/${Number(id)}/payment-status`, {
      payment_status: normalized,
    });

    return res.data;
  },

  async markPaid(
    id: number,
    payload: MarkPaidPayload
  ): Promise<MarkPaidResponse> {
    const body: MarkPaidPayload = {
      ...payload,
      amount: Number(payload.amount),
      payment_mode: normalizePaymentMode(payload.payment_mode),
      company_id: toOptionalPositiveInt(payload.company_id),
    };

    const res = await httpClient.post<MarkPaidResponse>(
      `/bills/${Number(id)}/mark-paid`,
      body
    );

    return res.data;
  },

  async markRefund(
    id: number,
    payload: MarkRefundPayload
  ): Promise<MarkRefundResponse> {
    const body: MarkRefundPayload = {
      ...payload,
      refund_mode: normalizePaymentMode(payload.refund_mode),
      company_id: toOptionalPositiveInt(payload.company_id),
    };

    const res = await httpClient.post<MarkRefundResponse>(
      `/bills/${Number(id)}/mark-refund`,
      body
    );

    return res.data;
  },

  async deleteBill(id: number): Promise<void> {
    await httpClient.delete(`/bills/${Number(id)}`);
  },
};