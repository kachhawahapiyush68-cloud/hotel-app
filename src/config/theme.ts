// src/config/theme.ts

export type Theme = {
  colors: {
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    primary: string;
    primarySoft: string;
    border: string;
    danger: string;
    tabBarBg: string;
  };
};

export const darkTheme: Theme = {
  colors: {
    background: '#050807',
    surface: '#111827',
    text: '#F9FAFB',
    textSecondary: '#9CA3AF',
    primary: '#F97360',
    primarySoft: '#FEE2E2',
    border: '#1F2933',
    danger: '#F97360',
    tabBarBg: '#050807',
  },
};

export const lightTheme: Theme = {
  colors: {
    background: '#F9FAFB',
    surface: '#FFFFFF',
    text: '#111827',
    textSecondary: '#6B7280',
    primary: '#F97360',
    primarySoft: '#FEE2E2',
    border: '#E5E7EB',
    danger: '#DC2626',
    tabBarBg: '#FFFFFF',
  },
};
