// ============================================================
// src/modules/voucher/api.ts
// ============================================================

import { voucherApi } from "../../api/voucherApi";
import { ledgerApi } from "../../api/ledgerApi";

import type {
  Voucher,
  VoucherDetail,
  VoucherDetailResponse,
  VoucherType,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  Ledger,
  LedgerType,
  LedgerSummaryRow,
  DailyExpenseRow,
} from "../../api/types";

export type {
  Voucher,
  VoucherDetail,
  VoucherDetailResponse,
  VoucherType,
  CreateVoucherPayload,
  UpdateVoucherPayload,
  Ledger,
  LedgerType,
  LedgerSummaryRow,
  DailyExpenseRow,
} from "../../api/types";

// ── Voucher CRUD ─────────────────────────────────────────────

export async function fetchVoucherList(params?: {
  type?: VoucherType;
  fromDate?: string;
  toDate?: string;
}): Promise<Voucher[]> {
  return voucherApi.getAll(params);
}

export async function fetchVoucherById(
  id: number
): Promise<VoucherDetailResponse> {
  return voucherApi.getById(id);
}

export async function fetchNextVoucherNo(payload: {
  voucher_type: VoucherType;
  voucher_date: string;
}): Promise<{ voucher_no: string }> {
  return voucherApi.getNextNumber(payload);
}

export async function fetchDailyVouchers(params: {
  date: string;
}): Promise<Voucher[]> {
  return voucherApi.getDaily(params);
}

export async function fetchDailyExpenses(params: {
  date: string;
}): Promise<DailyExpenseRow[]> {
  return voucherApi.getExpenses(params);
}

export async function createVoucher(
  payload: CreateVoucherPayload
): Promise<VoucherDetailResponse> {
  return voucherApi.create(payload);
}

export async function updateVoucher(
  id: number,
  payload: UpdateVoucherPayload
): Promise<VoucherDetailResponse> {
  return voucherApi.update(id, payload);
}

export async function deleteVoucher(id: number): Promise<void> {
  return voucherApi.remove(id);
}

// ── Ledger helpers ───────────────────────────────────────────

export async function fetchLedgerList(companyid?: number): Promise<Ledger[]> {
  return ledgerApi.getAll(companyid);
}

export async function fetchLedgerSummaries(params?: {
  fromDate?: string;
  toDate?: string;
  companyid?: number;
}): Promise<LedgerSummaryRow[]> {
  return ledgerApi.getAllSummaries(params);
}