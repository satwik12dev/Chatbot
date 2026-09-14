import { apiClient } from "./client";
import { ApiResponse, SearchResponse } from "@/types/api";

export const searchApi = {
  searchConversations: (query: string, limit = 10) => {
    const params = new URLSearchParams({
      q: query,
      limit: String(limit),
    });
    return apiClient.get<ApiResponse<SearchResponse>>(
      `/search/conversations?${params.toString()}`
    );
  },
};
