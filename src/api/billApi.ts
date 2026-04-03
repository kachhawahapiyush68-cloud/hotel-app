import { httpClient } from "./httpClient";
import {
  Bill,
  BillDetailResponse,
  BillListParams,
  CreateBillPayload,
  CreateBillFromKotPayload,
  BillPaymentStatus,
} from "../modules/bill/types";

export const billApi = {
  async getBills(params?: BillListParams): Promise<Bill[]> {
    const res = await httpClient.get<Bill[]>("/bills", { params });
    return res.data;
  },

  async getBillById(id: number): Promise<BillDetailResponse> {
    const res = await httpClient.get<BillDetailResponse>(`/bills/${id}`);
    return res.data;
  },

  async createBill(payload: CreateBillPayload): Promise<Bill> {
    const res = await httpClient.post<Bill>("/bills", payload);
    return res.data;
  },

  async createBillFromKot(payload: CreateBillFromKotPayload): Promise<BillDetailResponse> {
    const res = await httpClient.post<BillDetailResponse>("/bills/from-kot", payload);
    return res.data;
  },

  async updatePaymentStatus(
    id: number,
    payment_status: BillPaymentStatus
  ): Promise<Bill> {
    const res = await httpClient.patch<Bill>(`/bills/${id}/payment-status`, {
      payment_status,
    });
    return res.data;
  },

  async deleteBill(id: number): Promise<void> {
    await httpClient.delete(`/bills/${id}`);
  },
};