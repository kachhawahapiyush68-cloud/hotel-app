import { kotApi } from "../../api/kotApi";
import {
  Kot,
  KotDetailResponse,
  CreateKotPayload,
  UpdateKotPayload,
  KotStatus,
  InHouseRoomOption,
} from "../../api/types";

export async function fetchKotList(status?: KotStatus): Promise<Kot[]> {
  return kotApi.getKots(status ? { status } : undefined);
}

export async function fetchBillableTableKotList(): Promise<Kot[]> {
  return kotApi.getBillableTableKots();
}

export async function fetchBillableRoomKotList(): Promise<Kot[]> {
  return kotApi.getBillableRoomKots();
}

export async function fetchKotDetail(id: number): Promise<KotDetailResponse> {
  return kotApi.getKotById(id);
}

export async function fetchInHouseRooms(
  companyid?: number
): Promise<InHouseRoomOption[]> {
  return kotApi.getInHouseRooms(companyid);
}

export async function createKot(
  payload: CreateKotPayload
): Promise<KotDetailResponse> {
  return kotApi.createKot(payload);
}

export async function updateKot(
  id: number,
  payload: UpdateKotPayload
): Promise<KotDetailResponse> {
  return kotApi.updateKot(id, payload);
}

export async function updateKotStatus(
  id: number,
  status: KotStatus
): Promise<KotDetailResponse> {
  return kotApi.updateKotStatus(id, status);
}

export async function markKotBilled(
  id: number
): Promise<KotDetailResponse> {
  return kotApi.markKotBilled(id);
}

export async function deleteKot(id: number): Promise<void> {
  await kotApi.deleteKot(id);
}