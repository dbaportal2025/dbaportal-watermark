import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserInfo } from '@/types';

interface AuthStore {
  unifiedToken: string | null;
  userInfo: UserInfo | null;
  isLoading: boolean;
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  setLoading: (loading: boolean) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      unifiedToken: null,
      userInfo: null,
      isLoading: false,
      setToken: (token) => set({ unifiedToken: token }),
      setUserInfo: (userInfo) => set({ userInfo }),
      setLoading: (loading) => set({ isLoading: loading }),
      clearAuth: () => set({ unifiedToken: null, userInfo: null, isLoading: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ unifiedToken: state.unifiedToken, userInfo: state.userInfo }),
    }
  )
);
