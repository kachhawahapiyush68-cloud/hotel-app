// src/store/authStore.ts
import { create } from 'zustand';
import { loginApi, LoginResponse } from '../api/authApi';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'EMPLOYEE' | string;

export type User = {
  userid: number;
  companyid: number;
  username: string;
  fullname?: string | null;
  role: UserRole;
};

type AuthState = {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  selectedCompanyId?: number;
  login: (payload: {
    username: string;
    password: string;
    hotelCode?: string;
  }) => Promise<void>;
  logout: () => void;
  setSelectedCompanyId: (id: number | undefined) => void;
};

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: null,
  loading: false,
  error: null,
  selectedCompanyId: undefined,

  login: async payload => {
    try {
      set({ loading: true, error: null });
      const data: LoginResponse = await loginApi(payload);

      set({
        token: data.token,
        user: {
          userid: data.user.userid,
          companyid: data.user.companyid,
          username: data.user.username,
          fullname: data.user.fullname ?? null,
          role: data.user.role,
        },
        loading: false,
        error: null,
        selectedCompanyId: undefined,
      });
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        'Unable to login, please check your credentials';
      set({ loading: false, error: msg });
    }
  },

  logout: () =>
    set({
      user: null,
      token: null,
      error: null,
      loading: false,
      selectedCompanyId: undefined,
    }),

  setSelectedCompanyId: id => set({ selectedCompanyId: id }),
}));
