import axios from 'axios';
import type { LoginRequest, LoginResponse } from '@muguang/shared';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 10000,
});

export const authService = {
  async login(dto: LoginRequest): Promise<LoginResponse> {
    const { data } = await api.post('/auth/login', dto);
    return data;
  },

  async refresh(refreshToken: string): Promise<{ accessToken: string }> {
    const { data } = await api.post('/auth/refresh', { refreshToken });
    return data;
  },

  async me(): Promise<unknown> {
    const { data } = await api.get('/auth/me', {
      headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
    });
    return data;
  },
};

export { api };
