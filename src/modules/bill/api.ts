import { billApi } from "../../api/billApi";
import {
  Bill,
  BillDetailResponse,
  CreateBillPayload,
  CreateBillFromKotPayload,
  BillPaymentStatus,
} from "./types";

export async function fetchBillList(billtype?: string): Promise<Bill[]> {
  return billApi.getBills(billtype ? { billtype } : undefined);
}

export async function fetchBillDetail(id: number): Promise<BillDetailResponse> {
  return billApi.getBillById(id);
}

export async function createBill(payload: CreateBillPayload): Promise<Bill> {
  return billApi.createBill(payload);
}

export async function createBillFromKot(
  payload: CreateBillFromKotPayload
): Promise<BillDetailResponse> {
  return billApi.createBillFromKot(payload);
}

export async function updateBillPaymentStatus(
  id: number,
  paymentStatus: BillPaymentStatus
): Promise<Bill> {
  return billApi.updatePaymentStatus(id, paymentStatus);
}

export async function deleteBill(id: number): Promise<void> {
  return billApi.deleteBill(id);
}