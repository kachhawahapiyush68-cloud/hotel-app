import { create } from "zustand";
import type { Bill, BillDetailResponse } from "./types";

type BillStore = {
  selectedBill: Bill | null;
  selectedBillDetail: BillDetailResponse | null;
  setSelectedBill: (bill: Bill | null) => void;
  setSelectedBillDetail: (detail: BillDetailResponse | null) => void;
  clearSelectedBill: () => void;
};

export const useBillStore = create<BillStore>()((set) => ({
  selectedBill: null,
  selectedBillDetail: null,
  setSelectedBill: (bill) => set({ selectedBill: bill }),
  setSelectedBillDetail: (detail) => set({ selectedBillDetail: detail }),
  clearSelectedBill: () =>
    set({
      selectedBill: null,
      selectedBillDetail: null,
    }),
}));