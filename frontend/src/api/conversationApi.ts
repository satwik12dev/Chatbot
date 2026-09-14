import { apiClient } from "./client";
import {
  ApiResponse,
  PagedResponse,
  ConversationResponse,
  CreateConversationRequest,
  UpdateConversationRequest,
} from "@/types/api";

export const conversationApi = {
  createConversation: (data?: CreateConversationRequest) =>
    apiClient.post<ApiResponse<ConversationResponse>>("/conversations", data || {}),

  getConversations: (params?: { archived?: boolean; page?: number; size?: number }) => {
    const query = new URLSearchParams();
    if (params?.archived !== undefined) query.append("archived", String(params.archived));
    if (params?.page !== undefined) query.append("page", String(params.page));
    if (params?.size !== undefined) query.append("size", String(params.size));
    const qs = query.toString();
    return apiClient.get<ApiResponse<PagedResponse<ConversationResponse>>>(
      `/conversations${qs ? `?${qs}` : ""}`
    );
  },

  getConversation: (conversationId: string) =>
    apiClient.get<ApiResponse<ConversationResponse>>(`/conversations/${conversationId}`),

  updateConversation: (conversationId: string, data: UpdateConversationRequest) =>
    apiClient.patch<ApiResponse<ConversationResponse>>(`/conversations/${conversationId}`, data),

  deleteConversation: (conversationId: string) =>
    apiClient.delete<ApiResponse<void>>(`/conversations/${conversationId}`),
};
