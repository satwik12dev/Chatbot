import { create } from "zustand";
import { UserProfileResponse, LoginRequest, RegisterRequest } from "@/types/api";
import { authApi } from "@/api/authApi";
import { tokenStorage } from "@/api/client";

interface AuthState {
  user: UserProfileResponse | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  setUser: (user: UserProfileResponse | null) => void;
  deleteAccount: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  initialize: async () => {
    const token = tokenStorage.getAccessToken();
    if (!token) {
      set({ user: null, isAuthenticated: false, isInitialized: true });
      return;
    }

    try {
      const res = await authApi.getMe();
      if (res.data) {
        set({ user: res.data, isAuthenticated: true, isInitialized: true });
      } else {
        tokenStorage.clear();
        set({ user: null, isAuthenticated: false, isInitialized: true });
      }
    } catch {
      tokenStorage.clear();
      set({ user: null, isAuthenticated: false, isInitialized: true });
    }
  },

  login: async (data: LoginRequest) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login(data);
      const authData = res.data;
      tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
      set({ user: authData.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (data: RegisterRequest) => {
    set({ isLoading: true });
    try {
      const res = await authApi.register(data);
      const authData = res.data;
      tokenStorage.setTokens(authData.accessToken, authData.refreshToken);
      set({ user: authData.user, isAuthenticated: true, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (refreshToken) {
      try {
        await authApi.logout(refreshToken);
      } catch {
        // Continue clearing local state regardless
      }
    }
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  deleteAccount: async () => {
    await authApi.deleteUserData();
    tokenStorage.clear();
    set({ user: null, isAuthenticated: false });
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
