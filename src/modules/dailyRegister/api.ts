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
  taxi_amount: number;
  advance_amount: number;
  bank_received: number;
  cash_received: number;
  due: number;
  refund: number;
  booking_status: string;
  check_in_datetime: string | null;
  check_out_datetime: string | null;
  bill_paid?: boolean;
  folio_status?: string | null;
}

export interface DailyExpenseRow {
  description: string;
  amount: number;
}

export interface DailyRegisterTotals {
  room_charge: number;
  extra_charge: number;
  tc_discount: number;
  taxi_amount: number;
  advance_amount: number;
  bank_received: number;
  cash_received: number;
  due: number;
  refund: number;
}

export interface DailyRegisterSummary {
  op_bal: number;
  bank_op_bal?: number;
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
  room_charge: 0,
  extra_charge: 0,
  tc_discount: 0,
  taxi_amount: 0,
  advance_amount: 0,
  bank_received: 0,
  cash_received: 0,
  due: 0,
  refund: 0,
};

export const EMPTY_SUMMARY: DailyRegisterSummary = {
  op_bal: 0,
  bank_op_bal: 0,
  t_coll: 0,
  other: 0,
  net_amt: 0,
  exp: 0,
  bank: 0,
  due: 0,
  refund: 0,
  cash_bal: 0,
};

export const EMPTY_RESPONSE: DailyRegisterResponse = {
  date: "",
  company_id: 0,
  rows: [],
  expenses: [],
  totals: EMPTY_TOTALS,
  summary: EMPTY_SUMMARY,
};

// ── API call ──────────────────────────────────────────────────

export const dailyRegisterApi = {
  get: async (date?: string): Promise<DailyRegisterResponse> => {
    const query = date ? `?date=${date}` : "";
    const response = await httpClient.get(`/daily-register${query}`);
    const data = response?.data ?? response;
    return normalizeResponse(data);
  },
};

// ── Helpers ───────────────────────────────────────────────────

export function todayIST(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export function displayDate(d: string): string {
  if (!d) return "";
  const [y, m, day] = d.split("-");
  const months = ["", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${day}-${months[Number(m)]}-${y.slice(2)}`;
}

export function fmt(n: number | null | undefined): string {
  const val = Number(n ?? 0);
  if (!isFinite(val) || val === 0) return "";
  return val.toLocaleString("en-IN");
}

export function fmtAlways(n: number | null | undefined): string {
  const val = Number(n ?? 0);
  return isFinite(val)
    ? val.toLocaleString("en-IN", { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : "0";
}

export function normalizeResponse(res: any): DailyRegisterResponse {
  const safeRows: DailyRegisterRow[] = Array.isArray(res?.rows)
    ? res.rows.map((r: any) => ({
        sr_no: Number(r?.sr_no ?? 0),
        booking_id: Number(r?.booking_id ?? 0),
        room_id: Number(r?.room_id ?? 0),
        room_no: String(r?.room_no ?? ""),
        guest_name: String(r?.guest_name ?? ""),
        mobile: r?.mobile ? String(r.mobile) : null,
        pax: Number(r?.pax ?? 0),
        room_charge: Number(r?.room_charge ?? 0),
        extra_charge: Number(r?.extra_charge ?? 0),
        tc_discount: Number(r?.tc_discount ?? 0),
        taxi_amount: Number(r?.taxi_amount ?? 0),
        advance_amount: Number(r?.advance_amount ?? 0),
        bank_received: Number(r?.bank_received ?? 0),
        cash_received: Number(r?.cash_received ?? 0),
        due: Number(r?.due ?? 0),
        refund: Number(r?.refund ?? 0),
        booking_status: String(r?.booking_status ?? ""),
        check_in_datetime: r?.check_in_datetime ?? null,
        check_out_datetime: r?.check_out_datetime ?? null,
        bill_paid: Boolean(r?.bill_paid ?? false),
        folio_status: r?.folio_status ?? null,
      }))
    : [];

  const safeExpenses: DailyExpenseRow[] = Array.isArray(res?.expenses)
    ? res.expenses.map((e: any) => ({
        description: String(e?.description ?? "EXPENSE"),
        amount: Number(e?.amount ?? 0),
      }))
    : [];

  return {
    date: String(res?.date ?? ""),
    company_id: Number(res?.company_id ?? 0),
    rows: safeRows,
    expenses: safeExpenses,
    totals: {
      ...EMPTY_TOTALS,
      ...(res?.totals ?? {}),
      room_charge: Number(res?.totals?.room_charge ?? 0),
      extra_charge: Number(res?.totals?.extra_charge ?? 0),
      tc_discount: Number(res?.totals?.tc_discount ?? 0),
      taxi_amount: Number(res?.totals?.taxi_amount ?? 0),
      advance_amount: Number(res?.totals?.advance_amount ?? 0),
      bank_received: Number(res?.totals?.bank_received ?? 0),
      cash_received: Number(res?.totals?.cash_received ?? 0),
      due: Number(res?.totals?.due ?? 0),
      refund: Number(res?.totals?.refund ?? 0),
    },
    summary: {
      ...EMPTY_SUMMARY,
      ...(res?.summary ?? {}),
      op_bal: Number(res?.summary?.op_bal ?? 0),
      bank_op_bal: Number(res?.summary?.bank_op_bal ?? 0),
      t_coll: Number(res?.summary?.t_coll ?? 0),
      other: Number(res?.summary?.other ?? 0),
      net_amt: Number(res?.summary?.net_amt ?? 0),
      exp: Number(res?.summary?.exp ?? 0),
      bank: Number(res?.summary?.bank ?? 0),
      due: Number(res?.summary?.due ?? 0),
      refund: Number(res?.summary?.refund ?? 0),
      cash_bal: Number(res?.summary?.cash_bal ?? 0),
    },
  };
}