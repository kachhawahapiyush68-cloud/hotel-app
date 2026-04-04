// src/api/ledgerApi.ts

import { httpClient } from "./httpClient";
import {
  Ledger,
  CreateLedgerPayload,
  UpdateLedgerPayload,
} from "./types";

export const ledgerApi = {
  getAll: async () => {
    const res = await httpClient.get<Ledger[]>("/ledgers");
    return res.data;
  },

  getById: async (id: number) => {
    const res = await httpClient.get<Ledger>(`/ledgers/${id}`);
    return res.data;
  },

  create: async (payload: CreateLedgerPayload) => {
    const res = await httpClient.post<Ledger>("/ledgers", payload);
    return res.data;
  },

  update: async (id: number, payload: UpdateLedgerPayload) => {
    const res = await httpClient.put<Ledger>(`/ledgers/${id}`, payload);
    return res.data;
  },

  remove: async (id: number) => {
    const res = await httpClient.delete(`/ledgers/${id}`);
    return res.data;
  },

  getStatement: async (id: number, from?: string, to?: string) => {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    const res = await httpClient.get(`/ledgers/${id}/statement`, { params });
    return res.data;
  },
};