import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "../utils/types";
import ReactMarkdown from "react-markdown";
import CitationsList from "./CitationsList";
import { processContentWithCitations } from "../utils/citation-utils";

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
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input field when component mounts
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    setInput("");
    onSubmit(input);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-8">
          {messages.map((message, i) => (
            <div
              key={i}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-6 ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted prose dark:prose-invert"
                }`}
              >
                <div
                  className={
                    message.role === "user"
                      ? ""
                      : "prose dark:prose-invert max-w-none"
                  }
                >
                  <ReactMarkdown
                    components={{
                      a: ({ node, ...props }) => (
                        <a
                          {...props}
                          className={`${
                            message.role === "user"
                              ? "text-primary-foreground underline"
                              : "text-blue-600 dark:text-blue-400 hover:underline"
                          }`}
                        />
                      ),
                    }}
                  >
                    {message.citations
                      ? processContentWithCitations(
                          message.content,
                          message.citations
                        )
                      : message.content}
                  </ReactMarkdown>
                </div>
                {message.citations && (
                  <CitationsList
                    citations={message.citations}
                    className={`mt-4 border-t pt-4 ${
                      message.role === "user"
                        ? "border-primary-foreground/20"
                        : "border-gray-200 dark:border-gray-700"
                    }`}
                  />
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Loading..." : "Send"}
          </Button>
        </div>
      </form>
    </div>
  );
}
