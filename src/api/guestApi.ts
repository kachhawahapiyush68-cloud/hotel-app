// src/api/guestApi.ts
import { httpClient } from './httpClient';

export type Guest = {
  guest_id: number;
  full_name: string;
  phone?: string;
};

export async function fetchGuests(): Promise<Guest[]> {
  const res = await httpClient.get<Guest[]>('/guests');
  return res.data;
}
