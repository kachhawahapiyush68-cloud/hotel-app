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
  status?: KotStatus;
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
  reservation_no?: string | null;
  check_in_datetime?: string | null;
  display_label: string;
}




// ============================================================
// src/api/types.ts
// ============================================================

// ── Ledger types ─────────────────────────────────────────────

export type LedgerType =
  | "CASH"
  | "BANK"
  | "RECEIVABLE"
  | "LIABILITY"
  | "REVENUE"
  | "EXPENSE";

export type DrCrFlag = "Dr" | "Cr";

export interface Ledger {
  ledger_id: number;
  company_id: number;
  ledger_name: string;
  ledger_type: LedgerType;
  opening_balance: number;
  dr_cr_flag: DrCrFlag;
  is_system_ledger: number;
  is_active: number;
  is_deleted: number;
  created_at?: string;
  updated_at?: string;
}

export interface CreateLedgerPayload {
  ledger_name: string;
  ledger_type: LedgerType;
  opening_balance?: number;
  dr_cr_flag?: DrCrFlag;
  is_active?: number;
}

export interface UpdateLedgerPayload {
  ledger_name?: string;
  ledger_type?: LedgerType;
  opening_balance?: number;
  dr_cr_flag?: DrCrFlag;
  is_active?: number;
}

// ── Ledger book entry ────────────────────────────────────────

export interface LedgerBookEntry {
  voucher_date: string;
  voucher_no: string;
  voucher_type: string;
  narration?: string | null;
  reference_no?: string | null;
  dr_amount: number;
  cr_amount: number;
  balance: number;
}

export type LedgerSummaryEntry = LedgerBookEntry;

export interface LedgerSummaryResponse {
  ledger: Ledger;
  opening_balance: number;
  period_dr: number;
  period_cr: number;
  closing_balance: number;
  entries: LedgerBookEntry[];
}

export interface LedgerSummaryRow {
  ledger_id: number;
  ledger_name: string;
  ledger_type: LedgerType;
  dr_cr_flag: DrCrFlag;
  opening_balance: number;
  total_dr: number;
  total_cr: number;
  closing_balance: number;
  is_system_ledger?: number;
  is_active?: number;
}

// ── Voucher types ────────────────────────────────────────────

export type VoucherType = "Receipt" | "Payment" | "Journal";

export interface VoucherDetail {
  voucher_detail_id?: number;
  voucher_id?: number;
  ledger_id: number;
  ledger_name?: string;
  ledger_type?: LedgerType | string;
  dr_amount: number;
  cr_amount: number;
  is_deleted?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Voucher {
  voucher_id: number;
  company_id: number;
  voucher_no: string;
  voucher_date: string;
  voucher_type: VoucherType;
  narration?: string | null;
  reference_no?: string | null;
  created_by?: number | null;
  is_deleted: number;
  created_at?: string;
  updated_at?: string;

  total_dr?: number;
  total_cr?: number;
  bill_no?: string | null;
  details?: VoucherDetail[];
  created_by_name?: string | null;
}

export interface VoucherDetailResponse {
  voucher: Voucher;
  details: VoucherDetail[];
}

export interface CreateVoucherPayload {
  voucher_date: string;
  voucher_type: VoucherType;
  narration?: string;
  reference_no?: string;
  details: {
    ledger_id: number;
    dr_amount: number;
    cr_amount: number;
  }[];
}

export interface UpdateVoucherPayload {
  voucher_date?: string;
  narration?: string;
  reference_no?: string;
  details?: {
    ledger_id: number;
    dr_amount: number;
    cr_amount: number;
  }[];
}

// ── Daily expense rows ───────────────────────────────────────

export interface DailyExpenseRow {
  voucher_id: number;
  voucher_no: string;
  narration: string;
  amount: number;
  ledger_name: string;
}