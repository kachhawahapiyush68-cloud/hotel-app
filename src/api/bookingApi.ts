import { httpClient } from "./httpClient";

export type BookingStatus =
  | "Provisional"
  | "Confirmed"
  | "CheckedIn"
  | "CheckedOut"
  | "Cancelled";

export type AdvanceStatus =
  | "NONE"
  | "RECEIVED"
  | "ADJUSTED"
  | "REFUNDED"
  | "FORFEITED";

export type CancellationRefundMode =
  | "NONE"
  | "FULL"
  | "PARTIAL"
  | "FORFEIT";

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

  advance_amount?: number;
  advance_payment_type?: string | null;
  advance_ref_no?: string | null;
  advance_status?: AdvanceStatus | null;
  advance_received_at?: string | null;
  refunded_amount?: number;
  refund_payment_type?: string | null;
  refund_ref_no?: string | null;
  refund_reason?: string | null;
  refunded_at?: string | null;
  advance_posted_to_folio?: number;
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

  advance_amount?: number;
  advance_payment_type?: string | null;
  advance_ref_no?: string | null;
}

export interface BookingUpdateInput {
  reservation_no?: string | null;
  guest_id?: number;
  room_id?: number;
  check_in_datetime?: string;
  check_out_datetime?: string;
  nights?: number;
  num_adult?: number;
  num_child?: number;
  status?: BookingStatus;

  advance_amount?: number;
  advance_payment_type?: string | null;
  advance_ref_no?: string | null;
}

export interface CheckInResponse {
  booking_id: number;
  folio_id: number;
  folio_no: string;
}

export interface BookingBillingSummary {
  folios: any[];
  bills: any[];
  postings?: any[];
}

export interface BookingBillResponse {
  bill: any;
  items: any[];
}

/**
 * Payload to unified cancel endpoint.
 * All fields are optional; backend enforces what is required per mode.
 */
export interface CancelBookingInput {
  refund_mode?: CancellationRefundMode;
  refunded_amount?: number;
  refund_payment_type?: string;
  refund_ref_no?: string;
  refund_reason?: string;
  cancellation_reason?: string;
}

export function getBookingGuestName(row?: Partial<Booking> | null): string {
  if (!row) return "Guest";
  const name = `${row.first_name ?? ""} ${row.last_name ?? ""}`.trim();
  return name || "Guest";
}

export function getBookingRoomLabel(row?: Partial<Booking> | null): string {
  if (!row) return "Unassigned";
  if (row.room_no) return `Room ${row.room_no}`;
  if (row.room_id) return `Room #${row.room_id}`;
  return "Unassigned";
}

export function getBookingMetaLine(row?: Partial<Booking> | null): string {
  if (!row) return "";

  const room = getBookingRoomLabel(row);
  const nights =
    Number(row.nights || 0) > 0
      ? `${Number(row.nights)} night${Number(row.nights) > 1 ? "s" : ""}`
      : null;
  const adults =
    Number(row.num_adult || 0) > 0
      ? `${Number(row.num_adult)} Adult${Number(row.num_adult) > 1 ? "s" : ""}`
      : null;
  const children =
    Number(row.num_child || 0) > 0
      ? `${Number(row.num_child)} Child${Number(row.num_child) > 1 ? "ren" : ""}`
      : null;

  return [room, nights, adults, children].filter(Boolean).join(" • ");
}

function normalizeBooking(row: any): Booking {
  return {
    ...row,
    booking_id: Number(row?.booking_id || 0),
    company_id: Number(row?.company_id || 0),
    guest_id: Number(row?.guest_id || 0),
    room_id: Number(row?.room_id || 0),
    nights: Number(row?.nights || 0),
    num_adult: Number(row?.num_adult || 0),
    num_child: Number(row?.num_child || 0),
    created_by:
      row?.created_by === null || row?.created_by === undefined
        ? null
        : Number(row.created_by),
    is_deleted: Number(row?.is_deleted || 0),
    folio_id:
      row?.folio_id === null || row?.folio_id === undefined
        ? null
        : Number(row.folio_id),
    folio_no: row?.folio_no ?? null,
    room_no: row?.room_no ?? null,
    first_name: row?.first_name ?? null,
    last_name: row?.last_name ?? null,
    reservation_no: row?.reservation_no ?? null,
    advance_amount:
      row?.advance_amount === null || row?.advance_amount === undefined
        ? 0
        : Number(row.advance_amount),
    advance_payment_type: row?.advance_payment_type ?? null,
    advance_ref_no: row?.advance_ref_no ?? null,
    advance_status: row?.advance_status ?? null,
    advance_received_at: row?.advance_received_at ?? null,
    refunded_amount:
      row?.refunded_amount === null || row?.refunded_amount === undefined
        ? 0
        : Number(row.refunded_amount),
    refund_payment_type: row?.refund_payment_type ?? null,
    refund_ref_no: row?.refund_ref_no ?? null,
    refund_reason: row?.refund_reason ?? null,
    refunded_at: row?.refunded_at ?? null,
    advance_posted_to_folio:
      row?.advance_posted_to_folio === null ||
      row?.advance_posted_to_folio === undefined
        ? 0
        : Number(row.advance_posted_to_folio),
  };
}

function normalizeBookingList(rows: any[]): Booking[] {
  return Array.isArray(rows) ? rows.map(normalizeBooking) : [];
}

export const bookingApi = {
  async list(companyid?: number): Promise<Booking[]> {
    const params = companyid ? { companyid } : undefined;
    const res = await httpClient.get<Booking[]>("/bookings", { params });
    return normalizeBookingList(res.data as any[]);
  },

  async get(id: number): Promise<Booking> {
    const res = await httpClient.get<Booking>(`/bookings/${id}`);
    return normalizeBooking(res.data);
  },

  async getById(id: number): Promise<Booking> {
    const res = await httpClient.get<Booking>(`/bookings/${id}`);
    return normalizeBooking(res.data);
  },

  async create(input: BookingCreateInput): Promise<Booking> {
    const res = await httpClient.post<Booking>("/bookings", input);
    return normalizeBooking(res.data);
  },

  async update(id: number, input: BookingUpdateInput): Promise<Booking> {
    const res = await httpClient.put<Booking>(`/bookings/${id}`, input);
    return normalizeBooking(res.data);
  },

  async remove(id: number): Promise<void> {
    await httpClient.delete(`/bookings/${id}`);
  },

  /**
   * Unified cancel + refund call.
   * Pass appropriate refund_mode and fields.
   */
  async cancel(
    id: number,
    input: CancelBookingInput
  ): Promise<Booking> {
    const res = await httpClient.post<Booking>(
      `/bookings/${id}/cancel`,
      input
    );
    return normalizeBooking(res.data);
  },

  // Old refundAdvance endpoint REMOVED – use cancel() with appropriate mode.
  // async refundAdvance(...) { ... }

  async checkIn(id: number, room_id: number): Promise<CheckInResponse> {
    const res = await httpClient.post<CheckInResponse>(
      `/bookings/${id}/checkin`,
      { room_id }
    );
    return {
      ...res.data,
      booking_id: Number(res.data.booking_id || 0),
      folio_id: Number(res.data.folio_id || 0),
      folio_no: String(res.data.folio_no || ""),
    };
  },

  async reservations(params?: {
    from?: string;
    to?: string;
  }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/reservations", {
      params,
    });
    return normalizeBookingList(res.data as any[]);
  },

  async arrivals(params?: { date?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/arrivals", {
      params,
    });
    return normalizeBookingList(res.data as any[]);
  },

  async stayovers(params?: { date?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/stayovers", {
      params,
    });
    return normalizeBookingList(res.data as any[]);
  },

  async departures(params?: { date?: string }): Promise<Booking[]> {
    const res = await httpClient.get<Booking[]>("/bookings/departures", {
      params,
    });
    return normalizeBookingList(res.data as any[]);
  },

  async checkOut(
    id: number
  ): Promise<{ booking_id: number; status?: BookingStatus }> {
    const res = await httpClient.post<{
      booking_id: number;
      status?: BookingStatus;
    }>(`/bookings/${id}/checkout`, {});
    return {
      booking_id: Number(res.data.booking_id || 0),
      status: res.data.status,
    };
  },

  async billing(bookingId: number): Promise<BookingBillingSummary> {
    const res = await httpClient.get<BookingBillingSummary>(
      `/bookings/${bookingId}/billing`
    );
    return res.data;
  },

  async createBillFromBooking(
    bookingId: number,
    requireCheckout: boolean = true
  ): Promise<BookingBillResponse> {
    const res = await httpClient.post<BookingBillResponse>(
      "/bills/from-booking",
      {
        booking_id: Number(bookingId),
        bill_type: "Room",
        require_checkout: requireCheckout,
      }
    );
    return res.data;
  },
};