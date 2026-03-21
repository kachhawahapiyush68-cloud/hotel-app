// src/api/roomApi.ts
import { httpClient } from './httpClient';

export type RoomStatus = 'Available' | 'Occupied' | 'OutOfOrder' | 'Dirty' | 'Blocked';

export interface Room {
  room_id: number;
  company_id: number;
  room_no: string;
  category_id: number;
  floor_no?: string | null;
  max_adult: number;
  max_child: number;
  base_rate: number;
  status: RoomStatus;
  is_dormitory: number; // 0 / 1
  is_active: number;    // 0 / 1
  is_deleted: number;   // 0 / 1
  created_at?: string;
  updated_at?: string;
}

export interface RoomPayload {
  company_id?: number;
  room_no: string;
  category_id: number;
  floor_no?: string | null;
  max_adult?: number;
  max_child?: number;
  base_rate?: number;
  status?: RoomStatus;
  is_dormitory?: number;
  is_active?: number;
}

export interface RoomQueryParams {
  companyid?: number; // for SUPER_ADMIN: /api/rooms?companyid=1
}

const basePath = '/rooms';

export const roomApi = {
  async list(params?: RoomQueryParams): Promise<Room[]> {
    const res = await httpClient.get<Room[]>(basePath, { params });
    return res.data;
  },

  async getById(id: number): Promise<Room> {
    const res = await httpClient.get<Room>(`${basePath}/${id}`);
    return res.data;
  },

  async create(payload: RoomPayload): Promise<Room> {
    const res = await httpClient.post<Room>(basePath, payload);
    return res.data;
  },

  async update(id: number, payload: Partial<RoomPayload>): Promise<Room> {
    const res = await httpClient.put<Room>(`${basePath}/${id}`, payload);
    return res.data;
  },

  async delete(id: number): Promise<void> {
    await httpClient.delete(`${basePath}/${id}`);
  },
};
