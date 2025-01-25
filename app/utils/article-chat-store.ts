import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface ArticleChat {
  id: string;
  title: string;
  createdAt: Date;
  history: Array<{
    type: "prompt" | "draft" | "analysis";
    content: string;
    timestamp: Date;
    citations?: Array<{
      text: string;
      source: string;
      position?: number;
      references?: string[];
    }>;
    isLatest?: boolean;
  }>;
  expandedDraftIndex?: number;
}

interface ArticleChatStore {
  chats: ArticleChat[];
  activeChat?: ArticleChat;
  createChat: (title: string) => void;
  loadChat: (id: string) => void;
  updateActiveChat: (chat: Partial<ArticleChat>) => void;
  deleteChat: (id: string) => void;
}

export const useArticleChatStore = create<ArticleChatStore>()(
  persist(
    (set, get) => ({
      chats: [],
      activeChat: undefined,

      createChat: (title: string) => {
        const newChat: ArticleChat = {
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

      loadChat: (id: string) => {
        const chat = get().chats.find((c) => c.id === id);
        if (chat) {
          set({ activeChat: chat });
        }
      },

      updateActiveChat: (updates: Partial<ArticleChat>) => {
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
