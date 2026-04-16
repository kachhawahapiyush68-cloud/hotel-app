// ============================================================
// src/modules/bill/store.ts
// ============================================================

import { create } from "zustand";
import type { Bill } from "./types";

type BillStore = {
  selectedBill: Bill | null;
  setSelectedBill: (bill: Bill | null) => void;
  clearSelectedBill: () => void;
};

export const useBillStore = create<BillStore>()((set) => ({
  selectedBill: null,
  setSelectedBill: (bill) => set({ selectedBill: bill }),
  clearSelectedBill: () => set({ selectedBill: null }),
}));