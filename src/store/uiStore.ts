// src/store/uiStore.ts
import { create } from 'zustand';

type ToastType = 'success' | 'error' | 'info';

export type ToastState = {
  visible: boolean;
  message: string;
  type: ToastType;
};

type UiState = {
  globalLoading: boolean;
  toast: ToastState;
  confirmVisible: boolean;
  confirmTitle?: string;
  confirmMessage?: string;
  confirmOnOk?: (() => void) | null;

  setGlobalLoading: (value: boolean) => void;

  showToast: (message: string, type?: ToastType) => void;
  hideToast: () => void;

  openConfirm: (params: {
    title?: string;
    message?: string;
    onOk?: () => void;
  }) => void;
  closeConfirm: () => void;
};

export const useUiStore = create<UiState>(set => ({
  globalLoading: false,

  toast: {
    visible: false,
    message: '',
    type: 'info',
  },

  confirmVisible: false,
  confirmTitle: undefined,
  confirmMessage: undefined,
  confirmOnOk: null,

  setGlobalLoading: (value: boolean) => set({ globalLoading: value }),

  showToast: (message: string, type: ToastType = 'info') =>
    set({
      toast: {
        visible: true,
        message,
        type,
      },
    }),

  hideToast: () =>
    set({
      toast: {
        visible: false,
        message: '',
        type: 'info',
      },
    }),

  openConfirm: ({ title, message, onOk }) =>
    set({
      confirmVisible: true,
      confirmTitle: title,
      confirmMessage: message,
      confirmOnOk: onOk ?? null,
    }),

  closeConfirm: () =>
    set({
      confirmVisible: false,
      confirmTitle: undefined,
      confirmMessage: undefined,
      confirmOnOk: null,
    }),
}));
