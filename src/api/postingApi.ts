import { httpClient } from "./httpClient";

export interface RoomPosting {
  posting_id: number;
  company_id: number;
  booking_id: number;
  folio_id: number;
  room_id: number;
  posting_date: string;
  charge_type: string;
  amount: number;
  tax_amount: number;
  payment_type?: string | null;
  is_auto_posted: number;
  is_deleted: number;
  created_at: string;
  updated_at: string;
}

export interface PostRoomRentPayload {
  booking_id: number;
  posting_date?: string;
  amount?: number;
  tax_amount?: number;
  company_id?: number;
}

export interface CreateExtraChargePayload {
  booking_id: number;
  charge_type: string;
  amount: number;
  tax_amount?: number;
  posting_date?: string;
  company_id?: number;
  payment_type?: string; // still allowed, but AddChargeScreen will not send it
}

export interface UpdatePostingPayload {
  amount?: number;
  tax_amount?: number;
  payment_type?: string | null;
}

function normalizePosting(row: any): RoomPosting {
  return {
    posting_id: Number(row?.posting_id || 0),
    company_id: Number(row?.company_id || 0),
    booking_id: Number(row?.booking_id || 0),
    folio_id: Number(row?.folio_id || 0),
    room_id: Number(row?.room_id || 0),
    posting_date: String(row?.posting_date || ""),
    charge_type: String(row?.charge_type || ""),
    amount: Number(row?.amount || 0),
    tax_amount: Number(row?.tax_amount || 0),
    is_auto_posted: Number(row?.is_auto_posted || 0),
    is_deleted: Number(row?.is_deleted || 0),
    created_at: String(row?.created_at || ""),
    updated_at: String(row?.updated_at || ""),
    payment_type: row?.payment_type ?? null,
  };
}

export const postingApi = {
  async postRoomRent(payload: PostRoomRentPayload): Promise<RoomPosting> {
    const res = await httpClient.post<RoomPosting>(
      "/postings/room-rent",
      payload
    );
    return normalizePosting(res.data);
  },

  async createExtraCharge(
    payload: CreateExtraChargePayload
  ): Promise<RoomPosting> {
    const res = await httpClient.post<RoomPosting>(
      "/postings/extra-charge",
      payload
    );
    return normalizePosting(res.data);
  },

  async listByFolio(folioId: number): Promise<RoomPosting[]> {
    const res = await httpClient.get<RoomPosting[]>(
      `/postings/folio/${folioId}`
    );
    return Array.isArray(res.data) ? res.data.map(normalizePosting) : [];
  },

  async updatePosting(
    postingId: number,
    payload: UpdatePostingPayload
  ): Promise<RoomPosting> {
    const res = await httpClient.patch<RoomPosting>(
      `/postings/${postingId}`,
      payload
    );
    return normalizePosting(res.data);
  },

  async deletePosting(postingId: number): Promise<void> {
    await httpClient.delete(`/postings/${postingId}`);
  },
};