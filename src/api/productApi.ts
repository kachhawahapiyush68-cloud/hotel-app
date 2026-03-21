// src/api/productApi.ts
import { httpClient } from './httpClient';

export type Product = {
  product_id: number;
  name: string;
  rate: number;
  category_id: number;
};

export async function fetchProducts(): Promise<Product[]> {
  const res = await httpClient.get<Product[]>('/products');
  return res.data;
}
