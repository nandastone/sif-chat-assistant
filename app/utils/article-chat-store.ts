import { create } from "zustand";
import { persist } from "zustand/middleware";
import { MessageItem } from "./types";

interface Chat {
  id: string;
  title: string;
  createdAt: Date;
  history: MessageItem[];
  expandedDraftIndex?: number;
}

interface ArticleChatStore {
  chats: Chat[];
  activeChat: Chat | null;
  createChat: (title: string) => void;
  updateActiveChat: (updates: Partial<Chat>) => void;
  deleteChat: (id: string) => void;
  setActiveChat: (id: string) => void;
}

export const useArticleChatStore = create<ArticleChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: null,

      createChat: (title: string) => {
        const newChat: Chat = {
          id: Date.now().toString(),
          title,
          createdAt: new Date(),
          history: [],
        };
        set((state) => ({
          chats: [newChat, ...state.chats],
          activeChat: newChat,
        }));
      },

      updateActiveChat: (updates: Partial<Chat>) => {
        const activeChat = get().activeChat;
        if (!activeChat) return;

        const updatedChat = { ...activeChat, ...updates };
        set((state) => ({
          activeChat: updatedChat,
          chats: state.chats.map((c) =>
            c.id === updatedChat.id ? updatedChat : c
          ),
        }));
      },

      deleteChat: (id: string) => {
        const { chats } = get();
        const filteredChats = chats.filter((c) => c.id !== id);

        // Create a new chat first if we're about to have no chats
        if (filteredChats.length === 0) {
          const newChat = {
            id: Date.now().toString(),
            title: "New Article",
            createdAt: new Date(),
            history: [],
          };
          set({
            chats: [newChat],
            activeChat: newChat,
          });
        } else {
          // Otherwise just update with filtered chats and set first one as active
          set({
            chats: filteredChats,
            activeChat: filteredChats[0],
          });
        }
      },

      setActiveChat: (id: string) => {
        const chat = get().chats.find((c) => c.id === id);
        if (chat) {
          set({ activeChat: chat });
        }
      },
    }),
    {
      name: "article-chat-storage",
      version: 1,
      partialize: (state) => ({
        chats: state.chats.map((chat) => ({
          ...chat,
          createdAt: chat.createdAt.toISOString(),
          history: chat.history.map((item) => ({
            ...item,
            timestamp: item.timestamp.toISOString(),
          })),
        })),
        activeChat: state.activeChat
          ? {
              ...state.activeChat,
              createdAt: state.activeChat.createdAt.toISOString(),
              history: state.activeChat.history.map((item) => ({
                ...item,
                timestamp: item.timestamp.toISOString(),
              })),
            }
          : undefined,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;

        // Convert stored date strings back to Date objects
        const convertDates = (chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          history: chat.history.map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp),
          })),
        });

        state.chats = state.chats.map(convertDates);
        if (state.activeChat) {
          state.activeChat = convertDates(state.activeChat);
        }
      },
    }
  )
);
