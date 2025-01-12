import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateIcon } from "@radix-ui/react-icons";
import CitationsList from "./CitationsList";
import { processContentWithCitations } from "../utils/citation-utils";
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
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  return (
    <div className="space-y-4">
      <div className="border rounded-lg h-[600px] flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-4 shadow-sm ${
                  message.role === "user"
                    ? "bg-gray-200 text-gray-900 border border-gray-300"
                    : "bg-gray-50 text-gray-900 border border-gray-200"
                }`}
              >
                <div className="prose max-w-none [&>p]:text-current [&>p]:!mb-0">
                  <ReactMarkdown>
                    {message.citations && message.citations.length > 0
                      ? processContentWithCitations(
                          message.content,
                          message.citations
                        )
                      : message.content}
                  </ReactMarkdown>
                </div>
                {message.citations && message.citations.length > 0 && (
                  <CitationsList citations={message.citations} />
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
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
                ref={inputRef}
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
