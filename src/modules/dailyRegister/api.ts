// ============================================================
// src/modules/dailyRegister/api.ts
// ============================================================

import { httpClient } from "../../api/httpClient";

// ── Types ─────────────────────────────────────────────────────

export interface DailyRegisterRow {
  sr_no: number;
  booking_id: number;
  room_id: number;
  room_no: string;
  guest_name: string;
  mobile: string | null;
  pax: number;
  room_charge: number;
  extra_charge: number;
  tc_discount: number;
  bank_received: number;
  cash_received: number;
  due: number;
  refund: number;
  booking_status: string;
  check_in_datetime: string | null;
  check_out_datetime: string | null;
}

export interface DailyExpenseRow {
  description: string;
  amount: number;
}

export interface DailyRegisterTotals {
  room_charge: number;
  extra_charge: number;
  tc_discount: number;
  bank_received: number;
  cash_received: number;
  due: number;
  refund: number;
}

export interface DailyRegisterSummary {
  op_bal: number;
  t_coll: number;
  other: number;
  net_amt: number;
  exp: number;
  bank: number;
  due: number;
  refund: number;
  cash_bal: number;
}

export interface DailyRegisterResponse {
  date: string;
  company_id: number;
  rows: DailyRegisterRow[];
  expenses: DailyExpenseRow[];
  totals: DailyRegisterTotals;
  summary: DailyRegisterSummary;
}

// ── Empty defaults ────────────────────────────────────────────

export const EMPTY_TOTALS: DailyRegisterTotals = {
  room_charge: 0, extra_charge: 0, tc_discount: 0,
  bank_received: 0, cash_received: 0, due: 0, refund: 0,
};

export const EMPTY_SUMMARY: DailyRegisterSummary = {
  op_bal: 0, t_coll: 0, other: 0, net_amt: 0,
  exp: 0, bank: 0, due: 0, refund: 0, cash_bal: 0,
};

export const EMPTY_RESPONSE: DailyRegisterResponse = {
  date: "", company_id: 0,
  rows: [], expenses: [],
  totals: EMPTY_TOTALS,
  summary: EMPTY_SUMMARY,
};

// ── API call ──────────────────────────────────────────────────

export const dailyRegisterApi = {
  get: async (date?: string): Promise<DailyRegisterResponse> => {
    const query    = date ? `?date=${date}` : "";
    const response = await httpClient.get(`/daily-register${query}`);
    const data     = response?.data ?? response;
    return data as DailyRegisterResponse;
  },
};

// ── Helpers ───────────────────────────────────────────────────

/** Today's date in IST as YYYY-MM-DD */
export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year:  "numeric",
    month: "2-digit",
    day:   "2-digit",
  }).format(new Date());
}

/** "2026-04-13" → "13-Apr-26" */
export function displayDate(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["","Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  return `${day}-${months[Number(m)]}-${y.slice(2)}`;
}

/** Safe number formatter — returns "" for 0 values */
export function fmt(n: number | null | undefined): string {
  const val = Number(n ?? 0);
  if (!isFinite(val) || val === 0) return "";
  return val.toLocaleString("en-IN");
}

/** Safe number formatter — always shows value even if 0 */
export function fmtAlways(n: number | null | undefined): string {
  const val = Number(n ?? 0);
  return isFinite(val) ? val.toLocaleString("en-IN", { minimumFractionDigits: 0 }) : "0";
}

/** Normalize API response — fill missing fields with safe defaults */
export function normalizeResponse(res: any): DailyRegisterResponse {
  const safeRows = Array.isArray(res?.rows)
    ? res.rows.map((r: any) => ({
        ...r,
        room_charge:   Number(r.room_charge   ?? 0),
        extra_charge:  Number(r.extra_charge  ?? 0),
        tc_discount:   Number(r.tc_discount   ?? 0),
        bank_received: Number(r.bank_received ?? 0),
        cash_received: Number(r.cash_received ?? 0),
        due:           Number(r.due           ?? 0),
        refund:        Number(r.refund        ?? 0),
      }))
    : [];

  return {
    ...EMPTY_RESPONSE,
    ...res,
    rows:     safeRows,
    expenses: Array.isArray(res?.expenses) ? res.expenses : [],
    totals:   { ...EMPTY_TOTALS,   ...(res?.totals  ?? {}), refund: Number(res?.totals?.refund  ?? 0) },
    summary:  { ...EMPTY_SUMMARY,  ...(res?.summary ?? {}), refund: Number(res?.summary?.refund ?? 0) },
  };
}
