import { apiClient } from "./client";
import { ApiResponse, MemoryResponse } from "@/types/api";

export const memoryApi = {
  getMemories: () =>
    apiClient.get<ApiResponse<MemoryResponse[]>>("/memories"),

  deleteMemory: (memoryId: string) =>
    apiClient.delete<ApiResponse<void>>(`/memories/${memoryId}`),

  deleteAllMemories: () =>
    apiClient.delete<ApiResponse<void>>("/memories"),
};
