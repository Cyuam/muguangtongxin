import { create } from 'zustand';
import type { User } from '@muguang/shared';

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  setUser: (user: User) => void;
  logout: () => void;
  isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem('accessToken'),
  user: null,
  setAuth: (token, user) => {
    localStorage.setItem('accessToken', token);
    set({ token, user });
  },
  setUser: (user) => set({ user }),
  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ token: null, user: null });
  },
  isAuthenticated: () => get().token !== null,
}));
