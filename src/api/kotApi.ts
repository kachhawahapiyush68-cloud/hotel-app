// src/api/kotApi.ts
import { httpClient } from './httpClient';

export type Kot = {
  kot_id: number;
  table_no: string;
  status: string;
};

export async function fetchKots(): Promise<Kot[]> {
  const res = await httpClient.get<Kot[]>('/kots');
  return res.data;
}
