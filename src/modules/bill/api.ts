import { billApi } from "../../api/billApi";
import {
  Bill,
  BillDetailResponse,
  CreateBillPayload,
  CreateBillFromKotPayload,
  CreateBillFromBookingPayload,
  BillPaymentStatus,
  MarkPaidPayload,
  MarkPaidResponse,
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

export async function createBillFromBooking(
  payload: CreateBillFromBookingPayload
): Promise<BillDetailResponse> {
  return billApi.createBillFromBooking(payload);
}

export async function updateBillPaymentStatus(
  id: number,
  paymentStatus: BillPaymentStatus
): Promise<Bill> {
  return billApi.updatePaymentStatus(id, paymentStatus);
}

export async function markBillPaid(
  id: number,
  payload: MarkPaidPayload
): Promise<MarkPaidResponse> {
  return billApi.markPaid(id, payload);
}

export async function deleteBill(id: number): Promise<void> {
  return billApi.deleteBill(id);
}