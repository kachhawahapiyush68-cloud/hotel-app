export type BillPaymentStatus = "Unpaid" | "Paid" | "PartiallyPaid";

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
  source_type: string;
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
}