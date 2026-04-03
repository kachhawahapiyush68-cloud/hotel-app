// src/modules/bill/store.ts
import { create } from "zustand";
import { normalizeRole } from "../../shared/utils/role";
import { useAuthStore } from "../../store/authStore";
import {
  billApi,
  Bill,
  BillItem,
  BillCreateInput,
  BillFromKotInput,
  BillPaymentStatus,
} from "../../api/billApi";

type BillState = {
  items: Bill[];
  loading: boolean;
  error: string | null;

  currentBill: Bill | null;
  currentItems: BillItem[];

  fetch: (opts?: { billtype?: string }) => Promise<void>;
  getById: (id: number) => Promise<void>;
  create: (input: BillCreateInput) => Promise<Bill | null>;
  createFromKot: (
    input: BillFromKotInput
  ) => Promise<{ bill: Bill; items: BillItem[] } | null>;
  remove: (id: number) => Promise<boolean>;
  updatePaymentStatus: (
    id: number,
    status: BillPaymentStatus | string
  ) => Promise<Bill | null>;
};

export const useBillStore = create<BillState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  currentBill: null,
  currentItems: [],

  async fetch(opts) {
    try {
      set({ loading: true, error: null });

      const auth = useAuthStore.getState();
      const user = auth.user;
      const roleUpper = normalizeRole(user?.role);

      const companyid =
        roleUpper === "SUPER_ADMIN"
          ? auth.selectedCompanyId
          : user?.companyid;

      const data = await billApi.list({
        companyid: companyid ?? undefined,
        billtype: opts?.billtype,
      });

      set({ items: data, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message || e?.message || "Failed to load bills",
      });
    }
  },

  async getById(id: number) {
    try {
      set({ loading: true, error: null });
      const res = await billApi.get(id);
      set({
        currentBill: res.bill,
        currentItems: res.items || [],
        loading: false,
      });
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message || e?.message || "Failed to load bill",
      });
    }
  },

  async create(input: BillCreateInput) {
    try {
      const auth = useAuthStore.getState();
      const user = auth.user;
      const roleUpper = normalizeRole(user?.role);

      const payload: BillCreateInput = { ...input };

      if (roleUpper === "SUPER_ADMIN") {
        if (!payload.company_id && auth.selectedCompanyId) {
          payload.company_id = auth.selectedCompanyId;
        }
      } else if (user?.companyid) {
        payload.company_id = user.companyid;
      }

      const created = await billApi.create(payload);
      set({ items: [created, ...get().items] });
      return created;
    } catch (e: any) {
      set({
        error:
          e?.response?.data?.message || e?.message || "Failed to create bill",
      });
      return null;
    }
  },

  async createFromKot(input: BillFromKotInput) {
    try {
      const auth = useAuthStore.getState();
      const user = auth.user;
      const roleUpper = normalizeRole(user?.role);

      const payload: BillFromKotInput = { ...input };

      if (roleUpper === "SUPER_ADMIN") {
        if (!payload.company_id && auth.selectedCompanyId) {
          payload.company_id = auth.selectedCompanyId;
        }
      } else if (user?.companyid) {
        payload.company_id = user.companyid;
      }

      const res = await billApi.createFromKot(payload);

      set({
        items: [res.bill, ...get().items],
        currentBill: res.bill,
        currentItems: res.items || [],
      });

      return res;
    } catch (e: any) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to create bill",
      });
      return null;
    }
  },

  async remove(id: number) {
    try {
      await billApi.remove(id);
      set({
        items: get().items.filter((b) => b.bill_id !== id),
      });
      return true;
    } catch (e: any) {
      set({
        error:
          e?.response?.data?.message || e?.message || "Failed to delete bill",
      });
      return false;
    }
  },

  async updatePaymentStatus(id: number, status: BillPaymentStatus | string) {
    try {
      const updated = await billApi.updatePaymentStatus(id, status);
      set({
        items: get().items.map((b) => (b.bill_id === id ? updated : b)),
        currentBill:
          get().currentBill?.bill_id === id ? updated : get().currentBill,
      });
      return updated;
    } catch (e: any) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to update payment status",
      });
      return null;
    }
  },
}));