import httpClient from "./httpClient";

export interface CashsheetModeTotal {
  payment_mode: string;
  total_amount: number;
  count: number;
}

export interface CashsheetResponse {
  date: string;
  company_id: number;
  totals: {
    total_collection: number;
    total_cash: number;
    total_card: number;
    total_upi: number;
    total_bank: number;
    total_cheque: number;
  };
  rows: CashsheetModeTotal[];
}

export async function getCashsheet(params?: {
  companyid?: number;
  date?: string;
  from?: string;
  to?: string;
}) {
  const { data } = await httpClient.get("/cashsheet", { params });
  return data as CashsheetResponse;
}