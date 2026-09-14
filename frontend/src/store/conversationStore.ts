import { create } from "zustand";
import { ConversationResponse } from "@/types/api";
import { conversationApi } from "@/api/conversationApi";

interface ConversationState {
  conversations: ConversationResponse[];
  activeConversation: ConversationResponse | null;
  isLoading: boolean;
  isCreating: boolean;
  error: string | null;

  fetchConversations: (archived?: boolean) => Promise<void>;
  fetchConversation: (id: string) => Promise<ConversationResponse | null>;
  createConversation: (title?: string) => Promise<ConversationResponse>;
  updateConversation: (
    id: string,
    data: { title?: string; archived?: boolean }
  ) => Promise<ConversationResponse>;
  deleteConversation: (id: string) => Promise<void>;
  setActiveConversation: (conversation: ConversationResponse | null) => void;
  removeConversationFromList: (id: string) => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  conversations: [],
  activeConversation: null,
  isLoading: false,
  isCreating: false,
  error: null,

  fetchConversations: async (archived = false) => {
    set({ isLoading: true, error: null });
    try {
      const res = await conversationApi.getConversations({ archived, page: 0, size: 50 });
      set({
        conversations: res.data?.content || [],
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchConversation: async (id: string) => {
    // Check if already in memory
    const existing = get().conversations.find((c) => c.id === id);
    if (existing) {
      set({ activeConversation: existing });
    }

    try {
      const res = await conversationApi.getConversation(id);
      if (res.data) {
        set({ activeConversation: res.data });
        // Update in list if present
        set((state) => ({
          conversations: state.conversations.map((c) => (c.id === id ? res.data : c)),
        }));
        return res.data;
      }
      return null;
    } catch (err: any) {
      set({ error: err.message });
      return null;
    }
  },

  createConversation: async (title?: string) => {
    set({ isCreating: true, error: null });
    try {
      const res = await conversationApi.createConversation(title ? { title } : undefined);
      const newConv = res.data;
      set((state) => ({
        conversations: [newConv, ...state.conversations],
        activeConversation: newConv,
        isCreating: false,
      }));
      return newConv;
    } catch (err: any) {
      set({ isCreating: false, error: err.message });
      throw err;
    }
  },

  updateConversation: async (id: string, data: { title?: string; archived?: boolean }) => {
    const previousConversations = get().conversations;
    const previousActive = get().activeConversation;

    // Optimistic update
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, ...data, updatedAt: new Date().toISOString() } : c
      ),
      activeConversation:
        state.activeConversation?.id === id
          ? { ...state.activeConversation, ...data, updatedAt: new Date().toISOString() }
          : state.activeConversation,
    }));

    try {
      const res = await conversationApi.updateConversation(id, data);
      set((state) => ({
        conversations: state.conversations.map((c) => (c.id === id ? res.data : c)),
        activeConversation:
          state.activeConversation?.id === id ? res.data : state.activeConversation,
      }));
      return res.data;
    } catch (err: any) {
      // Rollback on error
      set({
        conversations: previousConversations,
        activeConversation: previousActive,
        error: err.message,
      });
      throw err;
    }
  },

  deleteConversation: async (id: string) => {
    const previous = get().conversations;
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversation: state.activeConversation?.id === id ? null : state.activeConversation,
    }));

    try {
      await conversationApi.deleteConversation(id);
    } catch (err: any) {
      // Rollback
      set({ conversations: previous, error: err.message });
      throw err;
    }
  },

  setActiveConversation: (conversation) => set({ activeConversation: conversation }),

  removeConversationFromList: (id) =>
    set((state) => ({
      conversations: state.conversations.filter((c) => c.id !== id),
      activeConversation: state.activeConversation?.id === id ? null : state.activeConversation,
    })),
}));
