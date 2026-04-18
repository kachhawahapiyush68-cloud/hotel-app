export type BackendPaymentStatus = "Unpaid" | "Partial" | "Paid" | "Refund";
export type BillPaymentStatus = BackendPaymentStatus;
export type PaymentMode = "CASH" | "BANK" | "UPI" | "CARD";
export type DisplayCategory = "CHARGE" | "DISCOUNT" | "PAYMENT";

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
  payment_status?: BillPaymentStatus | string;
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
  source_type: "KOT" | "ROOM_POSTING" | "MANUAL" | "PAYMENT" | "REFUND" | string;
  source_ref_id?: number | null;
  product_id: number;
  description?: string | null;
  qty: number;
  rate: number;
  amount: number;
  tax_amount?: number;
  display_category?: DisplayCategory;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
  product_name?: string;
  product_code?: string | null;
  unit?: string | null;
  charge_type?: string | null;
  posting_date?: string | null;
}

export interface BillSummary {
  gross_amount: number;
  discount_amount: number;
  tax_amount: number;
  round_off: number;
  net_amount: number;
  total_paid: number;
  due_amount: number;
  refund_amount: number;
}

export interface BillDetailResponse {
  bill: Bill;
  items: BillItem[];
  summary: BillSummary;
}

export interface BillListParams {
  bill_type?: string;
  billtype?: string;
  company_id?: number;
  companyid?: number;
}

export interface CreateBillPayload {
  company_id?: number;
  bill_no?: string;
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
  payment_status?: BillPaymentStatus | string;
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
  notes?: string;
}

export interface CreateBillFromBookingPayload {
  company_id?: number;
  booking_id: number;
  bill_type: string;
  notes?: string;
  require_checkout?: boolean;
}

export interface UpdateBillPayload {
  discount_amount?: number;
  round_off?: number;
}

export interface MarkPaidPayload {
  amount: number;
  payment_mode: PaymentMode;
  company_id?: number;
}

export interface MarkPaidResponse {
  bill: Bill;
  items: BillItem[];
  summary: BillSummary;
  voucher?: {
    voucher_id: number;
    voucher_no: string;
    voucher_type: string;
  };
}

export interface MarkRefundPayload {
  refund_mode: PaymentMode;
  company_id?: number;
}

export interface MarkRefundResponse {
  bill: Bill;
  items: BillItem[];
  summary: BillSummary;
  voucher?: {
    voucher_id: number;
    voucher_no: string;
    voucher_type: string;
  };
}

export const PAYMENT_STATUS_LABEL: Record<BackendPaymentStatus, string> = {
  Unpaid: "Unpaid",
  Partial: "Partially Paid",
  Paid: "Paid",
  Refund: "Refund",
};

export const PAYMENT_STATUS_COLOR: Record<BackendPaymentStatus, string> = {
  Unpaid: "#D64545",
  Partial: "#D98E04",
  Paid: "#1E9E5A",
  Refund: "#7C3AED",
};

export function normalizePaymentStatus(
  status?: string | null
): BackendPaymentStatus {
  if (!status) return "Unpaid";

  const s = String(status).trim();
  if (s === "Unpaid" || s === "Partial" || s === "Paid" || s === "Refund") {
    return s as BackendPaymentStatus;
  }

  switch (s.toUpperCase().replace(/[\s_-]+/g, "")) {
    case "UNPAID":
      return "Unpaid";
    case "PARTIAL":
    case "PARTIALLYPAID":
      return "Partial";
    case "PAID":
      return "Paid";
    case "REFUND":
      return "Refund";
    default:
      return "Unpaid";
  }
}

export function normalizePaymentMode(mode?: string | null): PaymentMode {
  const v = String(mode || "").trim().toUpperCase();

  switch (v) {
    case "CASH":
      return "CASH";
    case "BANK":
      return "BANK";
    case "UPI":
      return "UPI";
    case "CARD":
      return "CARD";
    default:
      throw new Error("Invalid payment mode");
  }
}

export function getPaymentStatusLabel(status?: string | null): string {
  const s = normalizePaymentStatus(status);
  return PAYMENT_STATUS_LABEL[s] ?? s;
}

export function getPaymentStatusColor(status?: string | null): string {
  const s = normalizePaymentStatus(status);
  return PAYMENT_STATUS_COLOR[s] ?? "#D64545";
}

export const DISPLAY_CATEGORY_LABEL: Record<DisplayCategory, string> = {
  CHARGE: "Charge",
  DISCOUNT: "Discount",
  PAYMENT: "Payment",
};

export const DISPLAY_CATEGORY_COLOR: Record<DisplayCategory, string> = {
  CHARGE: "#1E9E5A",
  DISCOUNT: "#D98E04",
  PAYMENT: "#2563EB",
};

export function getChargeTypeLabel(chargeType?: string | null): string {
  if (!chargeType) return "—";

  const ct = String(chargeType).toUpperCase().trim();

  switch (ct) {
    case "ROOM_RENT":
    case "ROOM CHARGE":
    case "ROOM_CHARGE":
      return "Room Rent";
    case "LAUNDRY":
      return "Laundry";
    case "MINI BAR":
    case "MINIBAR":
      return "Mini Bar";
    case "TAXI":
      return "Taxi";
    case "EXTRA":
      return "Extra Charge";
    case "EXPENSE":
      return "Expense";
    case "KOT":
      return "KOT Food";
    case "TC":
      return "TC Discount";
    case "DISCOUNT":
      return "Discount";
    case "ADVANCE":
      return "Advance Payment";
    case "PAYMENT":
      return "Payment";
    case "REFUND":
      return "Refund";
    case "CASH":
      return "Cash Payment";
    case "BANK":
      return "Bank Transfer";
    case "UPI":
      return "UPI Payment";
    case "CARD":
      return "Card Payment";
    case "MANUAL":
      return "Manual Entry";
    default:
      return chargeType;
  }
}

export const PAYMENT_MODE_OPTIONS: { label: string; value: PaymentMode }[] = [
  { label: "Cash", value: "CASH" },
  { label: "Bank Transfer", value: "BANK" },
  { label: "UPI", value: "UPI" },
  { label: "Card", value: "CARD" },
];

export type BackendBillPaymentStatus = string;

export function toBackendBillPaymentStatus(status: string): string {
  return normalizePaymentStatus(status);
}

export function toUiBillPaymentStatus(status?: string | null): string {
  return normalizePaymentStatus(status);
}

export const BILL_PAYMENT_STATUS_MAP: Record<string, string> = {
  Unpaid: "Unpaid",
  Partial: "Partial",
  Paid: "Paid",
  Refund: "Refund",
  PartiallyPaid: "Partial",
};

export const BACKEND_TO_UI_BILL_PAYMENT_STATUS_MAP: Record<string, string> = {
  ...BILL_PAYMENT_STATUS_MAP,
};