import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";
import { formatDistanceToNow } from "date-fns/formatDistanceToNow";
import CitationsList from "./CitationsList";
import { ChatMessage } from "../utils/types";

interface ChatInterfaceProps {
  onSubmit: (message: string) => void;
  isLoading: boolean;
  messages: ChatMessage[];
}

export default function ChatInterface({
  onSubmit,
  isLoading,
  messages,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Add timestamp to message type
  const messagesWithTime = messages.map((msg) => ({
    ...msg,
    timestamp: msg.timestamp || new Date().toISOString(),
  }));

  return (
    <div className="space-y-4">
      <div className="border rounded-lg h-[600px] flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messagesWithTime.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                } rounded-lg p-4`}
              >
                <div className="prose dark:prose-invert max-w-none">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                {message.citations && (
                  <CitationsList citations={message.citations} />
                )}
                <div className="text-xs mt-2 opacity-70">
                  {formatDistanceToNow(new Date(message.timestamp), {
                    addSuffix: true,
                  })}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        <div className="p-4 border-t">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              onSubmit(input);
              setInput("");
            }}
          >
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <Button type="submit" disabled={isLoading || !input.trim()}>
                {isLoading ? (
                  <span className="flex items-center space-x-2">
                    <UpdateIcon className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </span>
                ) : (
                  "Send"
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
