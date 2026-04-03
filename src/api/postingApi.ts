import { httpClient } from "./httpClient";

export interface RoomPosting {
  posting_id: number;
  company_id: number;
  booking_id: number;
  folio_id: number;
  room_id: number;
  posting_date: string;
  charge_type: string;
  amount: string;
  tax_amount: string;
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
}

export const postingApi = {
  async postRoomRent(payload: PostRoomRentPayload): Promise<RoomPosting> {
    const res = await httpClient.post<RoomPosting>(
      "/postings/room-rent",
      payload
    );
    return res.data;
  },

  async createExtraCharge(
    payload: CreateExtraChargePayload
  ): Promise<RoomPosting> {
    const res = await httpClient.post<RoomPosting>(
      "/postings/extra-charge",
      payload
    );
    return res.data;
  },

  async listByFolio(folioId: number): Promise<RoomPosting[]> {
    const res = await httpClient.get<RoomPosting[]>(
      `/postings/folio/${folioId}`
    );
    return res.data;
  },
};