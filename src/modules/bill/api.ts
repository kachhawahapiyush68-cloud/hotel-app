import { billApi } from "../../api/billApi";
import {
  Bill,
  BillDetailResponse,
  BillListParams,
  CreateBillPayload,
  CreateBillFromKotPayload,
  CreateBillFromBookingPayload,
  UpdateBillPayload,
  MarkPaidPayload,
  MarkPaidResponse,
  MarkRefundPayload,
  MarkRefundResponse,
} from "./types";

export async function fetchBillList(
  billtype?: string,
  companyid?: number
): Promise<Bill[]> {
  const hasBillType = !!billtype;
  const hasCompanyId = companyid !== undefined && companyid !== null;

  const params: BillListParams | undefined =
    hasBillType || hasCompanyId
      ? {
          ...(hasBillType ? { bill_type: billtype, billtype } : {}),
          ...(hasCompanyId ? { company_id: companyid, companyid } : {}),
        }
      : undefined;

  return billApi.getBills(params);
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

export async function updateBill(
  id: number,
  payload: UpdateBillPayload
): Promise<BillDetailResponse> {
  return billApi.updateBill(id, payload);
}

export async function updateBillPaymentStatus(
  id: number,
  paymentStatus: string
): Promise<Bill> {
  return billApi.updatePaymentStatus(id, paymentStatus);
}

export async function markBillPaid(
  id: number,
  payload: MarkPaidPayload
): Promise<MarkPaidResponse> {
  return billApi.markPaid(id, payload);
}

export async function markBillRefund(
  id: number,
  payload: MarkRefundPayload
): Promise<MarkRefundResponse> {
  return billApi.markRefund(id, payload);
}

export async function deleteBill(id: number): Promise<void> {
  return billApi.deleteBill(id);
}