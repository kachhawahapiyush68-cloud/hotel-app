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
  check_in_datetime: string;
  check_out_datetime: string;
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

  folio_id?: number | null;
  folio_no?: string | null;
  room_no?: string | null;
  first_name?: string | null;
  last_name?: string | null;
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

export interface BookingBillingSummary {
  folios: any[];
  bills: any[];
}

export interface BookingBillResponse {
  bill: any;
  items: any[];
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

  async reservations(params?: { from?: string; to?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/reservations", {
      params,
    });
    return res.data;
  },

  async arrivals(params?: { date?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/arrivals", {
      params,
    });
    return res.data;
  },

  async stayovers(params?: { date?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/stayovers", {
      params,
    });
    return res.data;
  },

  async departures(params?: { date?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/departures", {
      params,
    });
    return res.data;
  },

  async checkOut(id: number): Promise<{ booking_id: number }> {
    const res = await httpClient.post<{ booking_id: number }>(
      `/bookings/${id}/checkout`,
      {}
    );
    return res.data;
  },

  async billing(bookingId: number): Promise<BookingBillingSummary> {
    const res = await httpClient.get<BookingBillingSummary>(
      `/bookings/${bookingId}/billing`
    );
    return res.data;
  },

  async createBillFromBooking(bookingId: number): Promise<BookingBillResponse> {
    const res = await httpClient.post<BookingBillResponse>("/bills/from-booking", {
      booking_id: bookingId,
      bill_type: "Room",
    });
    return res.data;
  },
};