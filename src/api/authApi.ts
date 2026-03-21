// src/api/authApi.ts
import { httpClient } from './httpClient';

export type LoginResponse = {
  token: string;
  user: {
    userid: number;
    companyid: number;
    username: string;
    fullname?: string | null;
    role: string;
  };
};

export async function loginApi(payload: {
  username: string;
  password: string;
  hotelCode?: string;
}): Promise<LoginResponse> {
  const res = await httpClient.post<LoginResponse>('/auth/login', payload);
  return res.data;
}

export type RegisterResponse = {
  message: string;
  user: {
    user_id: number;
    company_id: number;
    username: string;
    full_name: string;
    role: string;
    email?: string | null;
  };
};

export async function registerApi(payload: {
  username: string;
  password: string;
  fullName?: string;
  email?: string;
  companyId: number;
  role?: string;
}): Promise<RegisterResponse> {
  const res = await httpClient.post<RegisterResponse>('/auth/register', payload);
  return res.data;
}
