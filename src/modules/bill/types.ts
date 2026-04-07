export type BillPaymentStatus = "Unpaid" | "Paid" | "PartiallyPaid";

export type BackendBillPaymentStatus = "UNPAID" | "PAID" | "PARTIAL";

export interface Bill {
  bill_id?: number;
  company_id: number;
  bill_no: string;
  bill_datetime?: string;
  bill_type: string;
  guest_id?: number | null;
  booking_id?: number | null;
  folio_id?: number | null;
  room_id?: number | null;
  gross_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  round_off?: number;
  net_amount?: number;
  payment_status?: BillPaymentStatus | BackendBillPaymentStatus | string;
  created_by?: number | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  first_name?: string | null;
  last_name?: string | null;
  room_no?: string | null;
  reservation_no?: string | null;
  folio_no?: string | null;
}

export interface BillItem {
  bill_item_id?: number;
  bill_id: number;
  source_type: "KOT" | "ROOM_POSTING" | "MANUAL" | string;
  source_ref_id?: number | null;
  product_id: number;
  qty: number;
  rate: number;
  amount: number;
  tax_amount?: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  product_name?: string;
  product_code?: string | null;
  unit?: string | null;
  charge_type?: string | null;
  posting_date?: string | null;
}

export interface BillDetailResponse {
  bill: Bill;
  items: BillItem[];
}

export interface BillListParams {
  billtype?: string;
  companyid?: number;
}

export interface CreateBillPayload {
  company_id?: number;
  bill_no: string;
  bill_datetime?: string;
  bill_type: string;
  guest_id?: number | null;
  booking_id?: number | null;
  folio_id?: number | null;
  room_id?: number | null;
  gross_amount?: number;
  discount_amount?: number;
  tax_amount?: number;
  round_off?: number;
  net_amount?: number;
  payment_status?: BillPaymentStatus | BackendBillPaymentStatus | string;
}

export interface CreateBillFromKotPayload {
  company_id?: number;
  kot_ids: number[];
  bill_type: string;
  guest_id?: number;
  booking_id?: number;
  folio_id?: number;
  room_id?: number;
  discount_amount?: number;
  round_off?: number;
}

export interface CreateBillFromBookingPayload {
  company_id?: number;
  booking_id: number;
  bill_type: string;
  require_checkout?: boolean;
}

export interface MarkPaidPayload {
  amount: number;
  payment_mode: string;
  ledger_cash_bank_id: number;
  ledger_receivable_id: number;
  ledger_revenue_id?: number;
  ledger_tax_id?: number;
}

export interface MarkPaidResponse {
  bill: Bill | null;
  vouchers: {
    voucher_id: number;
    voucher_no: string;
    voucher_type: string;
  }[];
}

export const BILL_PAYMENT_STATUS_MAP = {
  Unpaid: "UNPAID",
  Paid: "PAID",
  PartiallyPaid: "PARTIAL",
} as const;

export const BACKEND_TO_UI_BILL_PAYMENT_STATUS_MAP: Record<string, BillPaymentStatus> = {
  UNPAID: "Unpaid",
  PAID: "Paid",
  PARTIAL: "PartiallyPaid",
  Unpaid: "Unpaid",
  Paid: "Paid",
  PartiallyPaid: "PartiallyPaid",
};

export function toBackendBillPaymentStatus(
  status: BillPaymentStatus
): BackendBillPaymentStatus {
  return BILL_PAYMENT_STATUS_MAP[status];
}

export function toUiBillPaymentStatus(
  status?: string | null
): BillPaymentStatus {
  if (!status) return "Unpaid";
  return BACKEND_TO_UI_BILL_PAYMENT_STATUS_MAP[status] || "Unpaid";
}