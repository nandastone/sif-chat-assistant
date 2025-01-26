import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Chat } from "@/app/utils/types";

interface ChatHistoryProps {
  chats: Chat[];
  activeChat: Chat | null;
  onSelectChat: (chat: Chat) => void;
  onDeleteChat: (id: string) => void;
  onNewChat: () => void;
}

export function ChatHistory({
  chats,
  activeChat,
  onSelectChat,
  onDeleteChat,
  onNewChat,
}: ChatHistoryProps) {
  return (
    <div className="w-64 flex flex-col">
      <div className="p-6">
        <Button className="w-full" variant="outline" onClick={onNewChat}>
          New Article
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="space-y-2 p-4">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={`group flex items-start justify-between p-3 rounded-lg hover:bg-gray-100 cursor-pointer ${
                activeChat?.id === chat.id ? "bg-gray-100" : ""
              }`}
              onClick={() => onSelectChat(chat)}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {chat.title}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteChat(chat.id);
                }}
              >
                <Cross2Icon className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
