// src/api/roomApi.ts
import { httpClient } from './httpClient';

export type Room = {
  room_id: number;
  room_no: string;
  room_type: string;
  status: string;
};

export async function fetchRooms(): Promise<Room[]> {
  const res = await httpClient.get<Room[]>('/rooms');
  return res.data;
}
