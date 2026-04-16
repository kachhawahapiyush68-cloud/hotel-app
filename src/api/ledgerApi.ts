// ============================================================
// src/api/ledgerApi.ts
// ============================================================
//
// Maps to backend routes:
//   GET    /api/ledgers                    → Ledger[]
//   GET    /api/ledgers/summaries          → LedgerSummaryRow[]
//   GET    /api/ledgers/:id                → Ledger
//   GET    /api/ledgers/:id/book           → LedgerSummaryResponse
//   POST   /api/ledgers                    → Ledger
//   PUT    /api/ledgers/:id                → Ledger
//   DELETE /api/ledgers/:id                → 204
//
// IMPORTANT:
//   Backend date filter query params: fromDate / toDate (NOT from / to)
//   Backend route for ledger book is /:id/book (NOT /:id/summary)
//   /summaries MUST be declared before /:id in the Express router
// ============================================================

import { httpClient } from "./httpClient";
import {
  Ledger,
  CreateLedgerPayload,
  UpdateLedgerPayload,
  LedgerSummaryResponse,
  LedgerSummaryRow,
} from "./types";

export const ledgerApi = {

  // ── GET /api/ledgers ──────────────────────────────────────
  async getAll(companyid?: number): Promise<Ledger[]> {
    const params = companyid ? { companyid } : undefined;
    const res = await httpClient.get<Ledger[]>("/ledgers", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── GET /api/ledgers/summaries ────────────────────────────
  // Returns all ledgers with opening_balance, total_dr, total_cr, closing_balance
  // Query params: fromDate=YYYY-MM-DD & toDate=YYYY-MM-DD  (NOT from/to)
  async getAllSummaries(params?: {
    fromDate?: string;
    toDate?: string;
    companyid?: number;
  }): Promise<LedgerSummaryRow[]> {
    const res = await httpClient.get<LedgerSummaryRow[]>("/ledgers/summaries", {
      params,
    });
    return Array.isArray(res.data) ? res.data : [];
  },

  // ── GET /api/ledgers/:id ──────────────────────────────────
  async getById(id: number): Promise<Ledger> {
    const res = await httpClient.get<Ledger>(`/ledgers/${id}`);
    return res.data;
  },

  // ── GET /api/ledgers/:id/book ─────────────────────────────
  // Returns ledger book: all voucher entries with running balance.
  // Query params: fromDate=YYYY-MM-DD & toDate=YYYY-MM-DD  (NOT from/to)
  // Response: { ledger, opening_balance, period_dr, period_cr, closing_balance, entries[] }
  async getLedgerBook(
    id: number,
    params?: { fromDate?: string; toDate?: string }
  ): Promise<LedgerSummaryResponse> {
    const res = await httpClient.get<LedgerSummaryResponse>(
      `/ledgers/${id}/book`,
      { params }
    );
    return res.data;
  },

  // Alias kept for backwards compat with screens that call getSummary()
  async getSummary(
    id: number,
    params?: { fromDate?: string; toDate?: string }
  ): Promise<LedgerSummaryResponse> {
    return ledgerApi.getLedgerBook(id, params);
  },

  // ── POST /api/ledgers ─────────────────────────────────────
  async create(payload: CreateLedgerPayload): Promise<Ledger> {
    const res = await httpClient.post<Ledger>("/ledgers", payload);
    return res.data;
  },

  // ── PUT /api/ledgers/:id ──────────────────────────────────
  async update(id: number, payload: UpdateLedgerPayload): Promise<Ledger> {
    const res = await httpClient.put<Ledger>(`/ledgers/${id}`, payload);
    return res.data;
  },

  // ── DELETE /api/ledgers/:id ───────────────────────────────
  // Will fail with 400 if ledger is a system ledger or has voucher entries
  async remove(id: number): Promise<void> {
    await httpClient.delete(`/ledgers/${id}`);
  },
};
