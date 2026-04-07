import { httpClient } from "./httpClient";
import {
  Ledger,
  CreateLedgerPayload,
  UpdateLedgerPayload,
  LedgerSummaryResponse,
} from "./types";

export const ledgerApi = {
  async getAll(companyid?: number): Promise<Ledger[]> {
    const params = companyid ? { companyid } : undefined;
    const res = await httpClient.get<Ledger[]>("/ledgers", { params });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getById(id: number): Promise<Ledger> {
    const res = await httpClient.get<Ledger>(`/ledgers/${id}`);
    return res.data;
  },

  async create(payload: CreateLedgerPayload): Promise<Ledger> {
    const res = await httpClient.post<Ledger>("/ledgers", payload);
    return res.data;
  },

  async update(id: number, payload: UpdateLedgerPayload): Promise<Ledger> {
    const res = await httpClient.put<Ledger>(`/ledgers/${id}`, payload);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/ledgers/${id}`);
  },

  async getSummary(id: number): Promise<LedgerSummaryResponse> {
    const res = await httpClient.get<LedgerSummaryResponse>(
      `/ledgers/${id}/summary`
    );
    return res.data;
  },
};