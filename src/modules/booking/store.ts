// src/modules/booking/store.ts
import { create } from "zustand";
import {
  bookingApi,
  Booking,
  BookingCreateInput,
  BookingUpdateInput,
  CheckInResponse,
} from "../../api/bookingApi";
import { useAuthStore } from "../../store/authStore";
import { normalizeRole } from "../../shared/utils/role";

type BookingState = {
  items: Booking[];
  loading: boolean;
  error: string | null;

  arrivals: Booking[];

  currentBooking: Booking | null;
  currentFolio: { folio_id: number; folio_no: string } | null;

  fetch: () => Promise<void>;
  create: (input: BookingCreateInput) => Promise<Booking | null>;
  update: (id: number, input: BookingUpdateInput) => Promise<Booking | null>;

  fetchTodayArrivals: (date?: string) => Promise<void>;
  fetchReservationsInRange: (from: string, to: string) => Promise<void>;

  setCurrentFromCheckIn: (booking: Booking, resp: CheckInResponse) => void;
  setCurrentManual: (
    booking: Booking,
    folio: { folio_id: number; folio_no: string }
  ) => void;
  clearCurrent: () => void;
};

export const useBookingStore = create<BookingState>((set, get) => ({
  items: [],
  loading: false,
  error: null,

  arrivals: [],
  currentBooking: null,
  currentFolio: null,

  async fetch() {
    try {
      set({ loading: true, error: null });

      const auth = useAuthStore.getState();
      const user = auth.user;
      const roleUpper = normalizeRole(user?.role);

      const companyIdParam =
        roleUpper === "SUPER_ADMIN"
          ? auth.selectedCompanyId
          : user?.companyid;

      const data = await bookingApi.list(companyIdParam);
      set({ items: data, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load bookings",
      });
    }
  },

  async create(input: BookingCreateInput) {
    try {
      set({ error: null });

      const auth = useAuthStore.getState();
      const user = auth.user;
      const roleUpper = normalizeRole(user?.role);

      const payload: BookingCreateInput = { ...input };

      if (roleUpper === "SUPER_ADMIN") {
        if (!payload.company_id && auth.selectedCompanyId) {
          payload.company_id = auth.selectedCompanyId;
        }
      } else if (user?.companyid) {
        payload.company_id = user.companyid;
      }

      const created = await bookingApi.create(payload);
      set({ items: [created, ...get().items] });
      return created;
    } catch (e: any) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to create booking",
      });
      return null;
    }
  },

  async update(id: number, input: BookingUpdateInput) {
    try {
      set({ error: null });

      const updated = await bookingApi.update(id, input);
      set({
        items: get().items.map((b) => (b.booking_id === id ? updated : b)),
        arrivals: get().arrivals.map((b) => (b.booking_id === id ? updated : b)),
      });
      return updated;
    } catch (e: any) {
      set({
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to update booking",
      });
      return null;
    }
  },

  async fetchTodayArrivals(date?: string) {
    try {
      set({ loading: true, error: null });

      const target = date ?? new Date().toISOString().slice(0, 10);
      const arrivals = await bookingApi.arrivals({ date: target });

      set({ arrivals, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load arrivals",
      });
    }
  },

  async fetchReservationsInRange(from: string, to: string) {
    try {
      set({ loading: true, error: null });

      const data = await bookingApi.reservations({ from, to });

      set({ items: data, loading: false });
    } catch (e: any) {
      set({
        loading: false,
        error:
          e?.response?.data?.message ||
          e?.message ||
          "Failed to load reservations",
      });
    }
  },

  setCurrentFromCheckIn(booking, resp) {
    set({
      currentBooking: booking,
      currentFolio: {
        folio_id: resp.folio_id,
        folio_no: resp.folio_no,
      },
    });
  },

  setCurrentManual(booking, folio) {
    set({
      currentBooking: booking,
      currentFolio: folio,
    });
  },

  clearCurrent() {
    set({
      currentBooking: null,
      currentFolio: null,
    });
  },
}));