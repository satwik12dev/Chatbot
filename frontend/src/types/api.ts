export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface PagedResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  expiresInMs: number;
  user: UserProfileResponse;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  otp?: string;
}

export interface SendOtpRequest {
  email: string;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ConversationResponse {
  id: string;
  userId: string;
  title: string;
  archived: boolean;
  version?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateConversationRequest {
  title?: string;
}

export interface UpdateConversationRequest {
  title?: string;
  archived?: boolean;
}

export type MessageRole = "USER" | "ASSISTANT" | "SYSTEM";
export type MessageType = "TEXT" | "AUDIO";

export interface ChatMessageResponse {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  messageType: MessageType;
  model?: string;
  totalTokens?: number;
  createdAt: string;
}

export interface ChatMessageRequest {
  message: string;
}

export interface StreamChunkEvent {
  type: "content" | "complete" | "error";
  text?: string;
  messageId?: string;
  error?: string;
}

export type MemoryType = "PREFERENCE" | "FACT" | "INSTRUCTION" | "PROFILE";

export interface MemoryResponse {
  id: string;
  memoryKey: string;
  memoryValue: string;
  memoryType: MemoryType;
  importance: number;
  createdAt: string;
  updatedAt: string;
}

export interface SearchResponse {
  query: string;
  matchedConversations: ConversationResponse[];
  matchedMessages: ChatMessageResponse[];
}

export interface VoiceChatResponse {
  conversationId: string;
  transcribedUserText: string;
  assistantMessage: ChatMessageResponse;
  audioUrl?: string;
  audioFormat?: string;
}

export interface TranscriptionResponse {
  transcribedText: string;
  audioFormat: string;
  durationMs: number;
}
