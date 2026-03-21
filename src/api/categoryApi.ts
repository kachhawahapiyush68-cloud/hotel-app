// src/api/categoryApi.ts
import { httpClient } from './httpClient';

export type Category = {
  category_id: number;
  category_name: string;
};

export async function fetchCategories(): Promise<Category[]> {
  const res = await httpClient.get<Category[]>('/categories');
  return res.data;
}
