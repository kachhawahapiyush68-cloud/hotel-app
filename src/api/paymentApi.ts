import httpClient from "./httpClient";

export interface Payment {
  payment_id: number;
  company_id: number;
  bill_id?: number | null;
  booking_id?: number | null;
  folio_id?: number | null;
  guest_id?: number | null;
  payment_date: string;
  amount: number;
  payment_mode: string;
  reference_no?: string | null;
  remarks?: string | null;
  created_by?: number | null;
  created_at?: string;
  updated_at?: string;
  bill_no?: string | null;
  folio_no?: string | null;
  guest_name?: string | null;
}

export async function getPayments(params?: {
  companyid?: number;
  from?: string;
  to?: string;
  payment_mode?: string;
  bill_id?: number;
}) {
  const { data } = await httpClient.get("/payments", { params });
  return data as Payment[];
}

export async function getPaymentById(id: number) {
  const { data } = await httpClient.get(`/payments/${id}`);
  return data as Payment;
}