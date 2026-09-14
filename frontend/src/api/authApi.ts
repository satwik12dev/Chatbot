import { apiClient } from "./client";
import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  UserProfileResponse,
} from "@/types/api";

export const authApi = {
  sendOtp: (email: string) =>
    apiClient.post<ApiResponse<void>>("/auth/send-otp", { email }, { requiresAuth: false }),

  verifyOtp: (email: string, otp: string) =>
    apiClient.post<ApiResponse<void>>("/auth/verify-otp", { email, otp }, { requiresAuth: false }),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/register", data, { requiresAuth: false }),

  login: (data: LoginRequest) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/login", data, { requiresAuth: false }),

  refresh: (refreshToken: string) =>
    apiClient.post<ApiResponse<AuthResponse>>("/auth/refresh", { refreshToken }, { requiresAuth: false }),

  logout: (refreshToken: string) =>
    apiClient.post<ApiResponse<void>>("/auth/logout", { refreshToken }),

  getMe: () =>
    apiClient.get<ApiResponse<UserProfileResponse>>("/auth/me"),

  deleteUserData: () =>
    apiClient.delete<ApiResponse<void>>("/users/me/data"),
};
