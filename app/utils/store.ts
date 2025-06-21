import { create } from "zustand";
import { ChatMessage } from "./types";

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  setMessages: (messages: ChatMessage[]) => void;
  addMessage: (message: ChatMessage) => void;
  setIsLoading: (isLoading: boolean) => void;
  clearMessages: () => void;
}

export const useChatStore = create<ChatState>((set: any) => ({
  messages: [],
  isLoading: false,
  setMessages: (messages: ChatMessage[]) => set({ messages }),
  addMessage: (message: ChatMessage) =>
    set((state: ChatState) => ({ messages: [...state.messages, message] })),
  setIsLoading: (isLoading: boolean) => set({ isLoading }),
  clearMessages: () => set({ messages: [] }),
}));
