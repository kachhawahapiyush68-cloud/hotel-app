import { httpClient } from "./httpClient";
import {
  Kot,
  KotDetailResponse,
  CreateKotPayload,
  UpdateKotPayload,
  KotStatus,
  KotItemStatus,
  KotServiceType,
  InHouseRoomOption,
  CreateKotItemInput,
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

const cleanParams = <T extends Record<string, any>>(
  params?: T
): Partial<T> | undefined => {
  if (!params) return undefined;

  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== null && value !== ""
  );

  return entries.length ? (Object.fromEntries(entries) as Partial<T>) : undefined;
};

function toOptionalPositiveInt(value: unknown): number | undefined {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const n = Number(value);
  return Number.isInteger(n) && n > 0 ? n : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
  if (value === undefined || value === null || String(value).trim() === "") {
    return undefined;
  }

  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function normalizeKotStatus(value?: string | KotStatus | null): KotStatus | undefined {
  if (!value) return undefined;

  const v = String(value).trim().toUpperCase();
  if (v === "OPEN") return "Open";
  if (v === "BILLED") return "Billed";
  if (v === "CANCELLED" || v === "CANCELED") return "Cancelled";
  return undefined;
}

function normalizeKotItemStatus(
  value?: string | KotItemStatus | null
): KotItemStatus | undefined {
  if (!value) return undefined;

  const v = String(value).trim().toUpperCase();
  if (v === "NORMAL") return "Normal";
  if (v === "CANCELLED" || v === "CANCELED") return "Cancelled";
  return undefined;
}

function normalizeKotServiceType(
  value?: string | KotServiceType | null
): KotServiceType | undefined {
  if (!value) return undefined;

  const v = String(value).trim().toUpperCase();
  if (v === "TABLE") return "TABLE";
  if (v === "ROOM") return "ROOM";
  return undefined;
}

function normalizeKotItemInput(item: CreateKotItemInput): CreateKotItemInput {
  return {
    product_id: Number(item.product_id),
    qty: Number(item.qty),
    rate_at_time: toOptionalNumber(item.rate_at_time),
    remarks: item.remarks?.trim() || undefined,
    status: normalizeKotItemStatus(item.status),
  };
}

function normalizeCreateKotPayload(payload: CreateKotPayload): CreateKotPayload {
  return {
    service_type: normalizeKotServiceType(payload.service_type) || "TABLE",
    kot_datetime: payload.kot_datetime?.trim() || undefined,
    table_no: payload.table_no?.trim() || undefined,
    room_id: toOptionalPositiveInt(payload.room_id),
    booking_id: toOptionalPositiveInt(payload.booking_id),
    status: normalizeKotStatus(payload.status) || "Open",
    notes: payload.notes?.trim() || undefined,
    items: Array.isArray(payload.items)
      ? payload.items.map(normalizeKotItemInput)
      : [],
  };
}

function normalizeUpdateKotPayload(payload: UpdateKotPayload): UpdateKotPayload {
  return {
    kot_datetime: payload.kot_datetime?.trim() || undefined,
    service_type: normalizeKotServiceType(payload.service_type),
    table_no: payload.table_no?.trim() || undefined,
    room_id: toOptionalPositiveInt(payload.room_id),
    booking_id: toOptionalPositiveInt(payload.booking_id),
    status: normalizeKotStatus(payload.status),
    notes: payload.notes?.trim() || undefined,
    items: Array.isArray(payload.items)
      ? payload.items.map(normalizeKotItemInput)
      : undefined,
  };
}

export const kotApi = {
  async getKots(params?: KotListParams): Promise<Kot[]> {
    const query = cleanParams({
      status: normalizeKotStatus(params?.status),
      companyid: toOptionalPositiveInt(params?.companyid),
      from: params?.from?.trim() || undefined,
      to: params?.to?.trim() || undefined,
    });

    const res = await httpClient.get<Kot[]>("/kots", { params: query });
    return Array.isArray(res.data) ? res.data : [];
  },

  async getBillableTableKots(
    params?: BillableKotListParams
  ): Promise<Kot[]> {
    const query = cleanParams({
      companyid: toOptionalPositiveInt(params?.companyid),
      from: params?.from?.trim() || undefined,
      to: params?.to?.trim() || undefined,
    });

    const res = await httpClient.get<Kot[]>("/kots/billable/table", {
      params: query,
    });

    return Array.isArray(res.data) ? res.data : [];
  },

  async getBillableRoomKots(
    params?: BillableKotListParams
  ): Promise<Kot[]> {
    const query = cleanParams({
      companyid: toOptionalPositiveInt(params?.companyid),
      from: params?.from?.trim() || undefined,
      to: params?.to?.trim() || undefined,
    });

    const res = await httpClient.get<Kot[]>("/kots/billable/room", {
      params: query,
    });

    return Array.isArray(res.data) ? res.data : [];
  },

  async getKotById(id: number): Promise<KotDetailResponse> {
    const res = await httpClient.get<KotDetailResponse>(`/kots/${Number(id)}`);
    return res.data;
  },

  async getInHouseRooms(companyid?: number): Promise<InHouseRoomOption[]> {
    const res = await httpClient.get<InHouseRoomOption[]>(
      "/kots/in-house-rooms",
      {
        params: cleanParams({
          companyid: toOptionalPositiveInt(companyid),
        }),
      }
    );

    return Array.isArray(res.data) ? res.data : [];
  },

  async createKot(payload: CreateKotPayload): Promise<KotDetailResponse> {
    const body = normalizeCreateKotPayload(payload);
    const res = await httpClient.post<KotDetailResponse>("/kots", body);
    return res.data;
  },

  async updateKot(
    id: number,
    payload: UpdateKotPayload
  ): Promise<KotDetailResponse> {
    const body = normalizeUpdateKotPayload(payload);
    const res = await httpClient.put<KotDetailResponse>(
      `/kots/${Number(id)}`,
      body
    );
    return res.data;
  },

  async updateKotStatus(
    id: number,
    status: KotStatus
  ): Promise<KotDetailResponse> {
    const res = await httpClient.patch<KotDetailResponse>(
      `/kots/${Number(id)}/status`,
      {
        status: normalizeKotStatus(status) || "Open",
      }
    );

    return res.data;
  },

  async markKotBilled(id: number): Promise<KotDetailResponse> {
    const res = await httpClient.patch<KotDetailResponse>(
      `/kots/${Number(id)}/mark-billed`
    );
    return res.data;
  },

  async deleteKot(id: number): Promise<void> {
    await httpClient.delete(`/kots/${Number(id)}`);
  },
};