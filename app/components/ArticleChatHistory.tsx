import { Button } from "@/components/ui/button";
import { useArticleChatStore } from "@/app/utils/article-chat-store";
import { Cross2Icon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns";

export function ArticleChatHistory() {
  const { chats, activeChat, createChat, loadChat, deleteChat } =
    useArticleChatStore();

  const handleNewArticle = () => {
    createChat("New Article");
  };

  const handleDeleteChat = (chatId: string) => {
    deleteChat(chatId);
  };

  return (
    <div className="w-64 border-r bg-gray-50/50 flex flex-col">
      <div className="p-4 border-b">
        <Button className="w-full" variant="outline" onClick={handleNewArticle}>
          New Article
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {chats.map((chat) => {
            return (
              <div
                key={chat.id}
                className={`group flex items-start justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${
                  activeChat?.id === chat.id ? "bg-gray-100" : ""
                }`}
                onClick={() => loadChat(chat.id)}
              >
                <div className="flex-1 min-w-0">
                  <p
                    className="text-sm font-medium text-gray-900 truncate"
                    title={chat.title}
                  >
                    {chat.title}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(chat.createdAt), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteChat(chat.id);
                  }}
                >
                  <Cross2Icon className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
