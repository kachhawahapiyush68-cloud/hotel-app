// src/api/companyApi.ts
import { httpClient } from './httpClient';

export type Company = {
  company_id: number;
  company_code: string;
  company_name: string;
};

export async function fetchCompanies(): Promise<Company[]> {
  const res = await httpClient.get<Company[]>('/companies');
  return res.data;
}
