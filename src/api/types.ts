// ───────── KOT TYPES ─────────

export type KotStatus = "Open" | "Billed" | "Cancelled";
export type KotItemStatus = "Normal" | "Cancelled";
export type KotServiceType = "TABLE" | "ROOM";

export interface Kot {
  kot_id?: number;
  company_id: number;
  kot_no?: string;
  kot_datetime?: string;
  service_type?: KotServiceType;
  guest_id?: number | null;
  booking_id?: number | null;
  folio_id?: number | null;
  room_id?: number | null;
  table_no?: string | null;
  status?: KotStatus;
  notes?: string | null;
  created_by?: number | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  company_name?: string;
  first_name?: string | null;
  last_name?: string | null;
  room_no?: string | null;
  reservation_no?: string | null;
  folio_no?: string | null;
  display_label?: string;
}

export interface KotItem {
  kot_item_id?: number;
  kot_id: number;
  product_id: number;
  qty: number;
  rate_at_time: number;
  amount?: number;
  status?: KotItemStatus;
  remarks?: string | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  product_name?: string;
  product_code?: string | null;
  unit?: string | null;
}

export interface KotDetailResponse {
  kot: Kot;
  items: KotItem[];
}

export interface CreateKotItemInput {
  product_id: number;
  qty: number;
  rate_at_time?: number;
  remarks?: string | null;
  status?: KotItemStatus;
}

export interface CreateKotPayload {
  company_id?: number;
  kot_datetime?: string;
  service_type: KotServiceType;
  table_no?: string | null;
  room_id?: number | null;
  booking_id?: number | null;
  status?: KotStatus; // usually omitted; backend defaults to Open
  notes?: string | null;
  items: CreateKotItemInput[];
}

export interface UpdateKotPayload {
  kot_datetime?: string;
  service_type?: KotServiceType;
  table_no?: string | null;
  room_id?: number | null;
  booking_id?: number | null;
  status?: KotStatus;
  notes?: string | null;
  items?: CreateKotItemInput[];
}

export interface InHouseRoomOption {
  booking_id: number;
  guest_id: number | null;
  room_id: number | null;
  room_no: string | null;
  guest_name: string | null;
  folio_id: number | null;
  folio_no: string | null;
  reservation_no: string | null;
  check_in_datetime?: string | null;
  display_label: string;
}

// ───────── LEDGER TYPES ─────────

export interface Ledger {
  ledger_id?: number;
  company_id: number;
  ledger_name: string;
  ledger_type: string;
  opening_balance: number;
  dr_cr_flag: "Dr" | "Cr";
  is_system_ledger: number;
  is_active: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLedgerPayload {
  company_id?: number;
  ledger_name: string;
  ledger_type: string;
  opening_balance?: number;
  dr_cr_flag: "Dr" | "Cr";
  is_system_ledger?: number;
  is_active?: number;
}

export interface UpdateLedgerPayload {
  ledger_name?: string;
  ledger_type?: string;
  opening_balance?: number;
  dr_cr_flag?: "Dr" | "Cr";
  is_system_ledger?: number;
  is_active?: number;
}

// ───────── VOUCHER TYPES ─────────

export type VoucherType =
  | "Receipt"
  | "Payment"
  | "Journal"
  | "Contra"
  | "Sales"
  | "Purchase";

export interface Voucher {
  voucher_id?: number;
  company_id: number;
  voucher_no?: string;
  voucher_date: string; // "YYYY-MM-DD" or ISO string
  voucher_type: VoucherType | string;
  narration?: string | null;
  reference_no?: string | null;
  created_by?: number | null;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
}

export interface VoucherDetail {
  voucher_detail_id?: number;
  voucher_id?: number;
  ledger_id: number;
  dr_amount: number;
  cr_amount: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;

  ledger_name?: string;
  ledger_type?: string;
}

export interface VoucherDetailResponse {
  voucher: Voucher;
  details: VoucherDetail[];
}

export interface CreateVoucherDetailInput {
  ledger_id: number;
  dr_amount: number;
  cr_amount: number;
}

export interface CreateVoucherPayload {
  company_id?: number;
  voucher_date: string;
  voucher_type: VoucherType | string;
  narration?: string;
  reference_no?: string;
  details: CreateVoucherDetailInput[];
}