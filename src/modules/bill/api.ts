// src/modules/bill/api.ts
import {
  billApi,
  Bill,
  BillItem,
  BillCreateInput,
  BillFromKotInput,
  BillPaymentStatus,
} from "../../api/billApi";

export type {
  Bill,
  BillItem,
  BillCreateInput,
  BillFromKotInput,
  BillPaymentStatus,
};

export const billModuleApi = {
  list: billApi.list,
  get: billApi.get,
  create: billApi.create,
  createFromKot: billApi.createFromKot,
  remove: billApi.remove,
  updatePaymentStatus: billApi.updatePaymentStatus,
};