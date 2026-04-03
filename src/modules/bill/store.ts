import { create } from "zustand";
import { Bill } from "./types";

type BillStore = {
  selectedBill: Bill | null;
  setSelectedBill: (bill: Bill | null) => void;
};

export const useBillStore = create<BillStore>((set) => ({
  selectedBill: null,
  setSelectedBill: (bill) => set({ selectedBill: bill }),
}));