// ============================================================
// src/modules/masters/api.ts  (COMPLETE — replace existing file)
// ============================================================
//
// Module-level API layer for all masters screens.
// Thin wrappers over src/api/* — import from here in screens.
//
// Sections:
//   1. Company
//   2. Rooms
//   3. Guests
//   4. Categories
//   5. Products
//   6. Users
//   7. Ledgers         ← NEW
//   8. Vouchers        ← NEW
//
// CRITICAL query param names:
//   Ledger/Voucher date filters use fromDate / toDate (NOT from / to)
//   Single day: pass date=YYYY-MM-DD (or fromDate=toDate=YYYY-MM-DD)
//   voucherApi.getById returns { voucher, details } — destructure in callers
// ============================================================

import { companyApi }   from "../../api/companyApi";
import { roomApi }      from "../../api/roomApi";
import { guestApi }     from "../../api/guestApi";
import { categoryApi }  from "../../api/categoryApi";
import { productApi }   from "../../api/productApi";
import { userApi }      from "../../api/userApi";
import { ledgerApi }    from "../../api/ledgerApi";
import { voucherApi }   from "../../api/voucherApi";

import {
  Ledger,
  CreateLedgerPayload,
  UpdateLedgerPayload,
  LedgerSummaryResponse,
  LedgerSummaryRow,
  Voucher,
  VoucherDetailResponse,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "../../api/types";

// ── Re-export types for convenience ──────────────────────────
export type {
  Ledger,
  CreateLedgerPayload,
  UpdateLedgerPayload,
  LedgerSummaryResponse,
  LedgerSummaryRow,
  LedgerBookEntry,
  LedgerSummaryEntry,
  LedgerType,
  DrCrFlag,
  Voucher,
  VoucherDetail,
  VoucherDetailResponse,
  VoucherType,
  CreateVoucherPayload,
  UpdateVoucherPayload,
} from "../../api/types";

// ─────────────────────────────────────────────────────────────
// 1. Company
// ─────────────────────────────────────────────────────────────

export async function fetchCompanyList() {
  return companyApi.getAll();
}

export async function fetchCompanyById(id: number) {
  return companyApi.getById(id);
}

export async function createCompany(payload: any) {
  return companyApi.create(payload);
}

export async function updateCompany(id: number, payload: any) {
  return companyApi.update(id, payload);
}

export async function deleteCompany(id: number) {
  return companyApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 2. Rooms
// ─────────────────────────────────────────────────────────────

export async function fetchRoomList() {
  return roomApi.getAll();
}

export async function fetchRoomById(id: number) {
  return roomApi.getById(id);
}

export async function createRoom(payload: any) {
  return roomApi.create(payload);
}

export async function updateRoom(id: number, payload: any) {
  return roomApi.update(id, payload);
}

export async function deleteRoom(id: number) {
  return roomApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 3. Guests
// ─────────────────────────────────────────────────────────────

export async function fetchGuestList() {
  return guestApi.getAll();
}

export async function fetchGuestById(id: number) {
  return guestApi.getById(id);
}

export async function createGuest(payload: any) {
  return guestApi.create(payload);
}

export async function updateGuest(id: number, payload: any) {
  return guestApi.update(id, payload);
}

export async function deleteGuest(id: number) {
  return guestApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 4. Categories
// ─────────────────────────────────────────────────────────────

export async function fetchCategoryList() {
  return categoryApi.getAll();
}

export async function createCategory(payload: any) {
  return categoryApi.create(payload);
}

export async function updateCategory(id: number, payload: any) {
  return categoryApi.update(id, payload);
}

export async function deleteCategory(id: number) {
  return categoryApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 5. Products
// ─────────────────────────────────────────────────────────────

export async function fetchProductList() {
  return productApi.getAll();
}

export async function createProduct(payload: any) {
  return productApi.create(payload);
}

export async function updateProduct(id: number, payload: any) {
  return productApi.update(id, payload);
}

export async function deleteProduct(id: number) {
  return productApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 6. Users
// ─────────────────────────────────────────────────────────────

export async function fetchUserList() {
  return userApi.getAll();
}

export async function fetchUserById(id: number) {
  return userApi.getById(id);
}

export async function updateUser(id: number, payload: any) {
  return userApi.update(id, payload);
}

export async function deleteUser(id: number) {
  return userApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 7. Ledgers
// ─────────────────────────────────────────────────────────────

export async function fetchLedgerList(companyid?: number): Promise<Ledger[]> {
  return ledgerApi.getAll(companyid);
}

// Date params: fromDate / toDate (NOT from / to)
export async function fetchLedgerSummaries(params?: {
  fromDate?: string;
  toDate?: string;
  companyid?: number;
}): Promise<LedgerSummaryRow[]> {
  return ledgerApi.getAllSummaries(params);
}

export async function fetchLedgerById(id: number): Promise<Ledger> {
  return ledgerApi.getById(id);
}

// Fetches ledger book: GET /api/ledgers/:id/book
// Date params: fromDate / toDate (NOT from / to)
export async function fetchLedgerSummary(
  id: number,
  params?: { fromDate?: string; toDate?: string }
): Promise<LedgerSummaryResponse> {
  return ledgerApi.getLedgerBook(id, params);
}

export async function createLedger(
  payload: CreateLedgerPayload
): Promise<Ledger> {
  return ledgerApi.create(payload);
}

export async function updateLedger(
  id: number,
  payload: UpdateLedgerPayload
): Promise<Ledger> {
  return ledgerApi.update(id, payload);
}

export async function deleteLedger(id: number): Promise<void> {
  return ledgerApi.remove(id);
}

// ─────────────────────────────────────────────────────────────
// 8. Vouchers
// ─────────────────────────────────────────────────────────────

// Date params: fromDate / toDate (NOT from / to)
export async function fetchVoucherList(params?: {
  type?: string;
  fromDate?: string;
  toDate?: string;
  companyid?: number;
}): Promise<Voucher[]> {
  return voucherApi.getAll(params);
}

// Returns { voucher, details } — callers must destructure
export async function fetchVoucherById(
  id: number
): Promise<VoucherDetailResponse> {
  return voucherApi.getById(id);
}

export async function fetchNextVoucherNumber(payload: {
  voucher_type: string;
  voucher_date: string;
  companyid?: number;
}): Promise<{ voucher_no: string }> {
  return voucherApi.getNextNumber(payload);
}

// Returns { voucher, details }
export async function createVoucher(
  payload: CreateVoucherPayload
): Promise<VoucherDetailResponse> {
  return voucherApi.create(payload);
}

// Returns { voucher, details }
export async function updateVoucher(
  id: number,
  payload: UpdateVoucherPayload
): Promise<VoucherDetailResponse> {
  return voucherApi.update(id, payload);
}

export async function deleteVoucher(id: number): Promise<void> {
  return voucherApi.remove(id);
}
