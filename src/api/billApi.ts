// src/api/billApi.ts
import { httpClient } from './httpClient';

export type Bill = {
  bill_id: number;
  bill_no: string;
  amount: number;
  status: string;
};

export async function fetchBills(): Promise<Bill[]> {
  const res = await httpClient.get<Bill[]>('/bills');
  return res.data;
}
