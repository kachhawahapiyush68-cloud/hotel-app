import { httpClient } from "./httpClient";
import {
  Kot,
  KotDetailResponse,
  CreateKotPayload,
  UpdateKotPayload,
  KotStatus,
  InHouseRoomOption,
} from "./types";

export interface KotListParams {
  status?: KotStatus;
  companyid?: number;
  from?: string;
  to?: string;
}

export interface BillableKotListParams {
  companyid?: number;
  from?: string;
  to?: string;
}

export const kotApi = {
  async getKots(params?: KotListParams): Promise<Kot[]> {
    const res = await httpClient.get<Kot[]>("/kots", { params });
    return res.data;
  },

  async getBillableTableKots(
    params?: BillableKotListParams
  ): Promise<Kot[]> {
    const res = await httpClient.get<Kot[]>("/kots/billable/table", {
      params,
    });
    return res.data;
  },

  async getKotById(id: number): Promise<KotDetailResponse> {
    const res = await httpClient.get<KotDetailResponse>(`/kots/${id}`);
    return res.data;
  },

  async getInHouseRooms(companyid?: number): Promise<InHouseRoomOption[]> {
    const res = await httpClient.get<InHouseRoomOption[]>(
      "/kots/in-house-rooms",
      { params: companyid ? { companyid } : undefined }
    );
    return res.data;
  },

  async createKot(payload: CreateKotPayload): Promise<KotDetailResponse> {
    const res = await httpClient.post<KotDetailResponse>("/kots", payload);
    return res.data;
  },

  async updateKot(
    id: number,
    payload: UpdateKotPayload
  ): Promise<KotDetailResponse> {
    const res = await httpClient.put<KotDetailResponse>(`/kots/${id}`, payload);
    return res.data;
  },

  async updateKotStatus(
    id: number,
    status: KotStatus
  ): Promise<KotDetailResponse> {
    const res = await httpClient.patch<KotDetailResponse>(
      `/kots/${id}/status`,
      { status }
    );
    return res.data;
  },

  async deleteKot(id: number): Promise<void> {
    await httpClient.delete(`/kots/${id}`);
  },
};