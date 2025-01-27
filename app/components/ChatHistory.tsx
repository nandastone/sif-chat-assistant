import { Button } from "@/components/ui/button";
import { Cross2Icon } from "@radix-ui/react-icons";
import { Chat } from "@/app/utils/types";
import { cn } from "@/lib/utils";

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
      <div className="p-4">
        <Button variant="outline" onClick={onNewChat}>
          New Article
        </Button>
      </div>
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 space-y-1">
          {chats.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group relative w-full p-3 rounded-md hover:bg-accent",
                activeChat?.id === chat.id && "bg-accent"
              )}
            >
              <div
                role="button"
                className="flex flex-col items-start text-left"
                onClick={() => onSelectChat(chat)}
              >
                <div className="text-sm font-medium">{chat.title}</div>
                {chat.title === "Draft Article" ? null : (
                  <div className="text-xs text-muted-foreground mt-1">
                    {chat.timestamp.toLocaleString()}
                  </div>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100"
                onClick={() => onDeleteChat(chat.id)}
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
