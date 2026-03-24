import { httpClient } from "./httpClient";

export type BookingStatus =
  | "Provisional"
  | "Confirmed"
  | "CheckedIn"
  | "CheckedOut"
  | "Cancelled";

export interface Booking {
  booking_id: number;
  company_id: number;
  reservation_no: string | null;
  guest_id: number;
  room_id: number;
  check_in_datetime: string;   // "YYYY-MM-DD HH:mm:ss"
  check_out_datetime: string;  // "YYYY-MM-DD HH:mm:ss"
  actual_check_in_datetime: string | null;
  actual_check_out_datetime: string | null;
  nights: number;
  num_adult: number;
  num_child: number;
  status: BookingStatus;
  created_by: number | null;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface BookingCreateInput {
  company_id?: number;
  reservation_no?: string | null;
  guest_id: number;
  room_id: number;
  check_in_datetime: string;
  check_out_datetime: string;
  nights?: number;
  num_adult?: number;
  num_child?: number;
  status?: BookingStatus;
}

export interface BookingUpdateInput {
  reservation_no?: string | null;
  guest_id?: number;
  room_id?: number;
  check_in_datetime?: string;
  check_out_datetime?: string;
  actual_check_in_datetime?: string | null;
  actual_check_out_datetime?: string | null;
  nights?: number;
  num_adult?: number;
  num_child?: number;
  status?: BookingStatus;
}

export interface CheckInResponse {
  booking_id: number;
  folio_id: number;
  folio_no: string;
}

export const bookingApi = {
  async list(companyid?: number): Promise<Booking[]> {
    const params = companyid ? { companyid } : undefined;
    const res = await httpClient.get<Booking[]>("/bookings", { params });
    return res.data;
  },

  async get(id: number): Promise<Booking> {
    const res = await httpClient.get<Booking>(`/bookings/${id}`);
    return res.data;
  },

  async create(input: BookingCreateInput): Promise<Booking> {
    const res = await httpClient.post<Booking>("/bookings", input);
    return res.data;
  },

  async update(id: number, input: BookingUpdateInput): Promise<Booking> {
    const res = await httpClient.put<Booking>(`/bookings/${id}`, input);
    return res.data;
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/bookings/${id}`);
  },

  async checkIn(id: number, room_id: number): Promise<CheckInResponse> {
    const res = await httpClient.post<CheckInResponse>(
      `/bookings/${id}/checkin`,
      { room_id }
    );
    return res.data;
  },
};
