// src/api/bookingApi.ts
import { httpClient } from './httpClient';

export type Booking = {
  booking_id: number;
  room_id: number;
  guest_id: number;
  arrival_date: string;
  departure_date: string;
  status: string;
};

export async function fetchBookings(): Promise<Booking[]> {
  const res = await httpClient.get<Booking[]>('/bookings');
  return res.data;
}
