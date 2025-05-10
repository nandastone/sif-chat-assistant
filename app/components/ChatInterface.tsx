import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { UpdateIcon, Cross2Icon } from "@radix-ui/react-icons";
import CitationsList from "./CitationsList";
import { processContentWithCitations } from "../utils/citation-utils";
import { ChatMessage } from "../utils/types";
import { Badge } from "@/components/ui/badge";

interface ChatInterfaceProps {
  onSubmit: (message: string, includeSpiritSoulDraft?: boolean) => void;
  isLoading: boolean;
  messages: ChatMessage[];
}

export default function ChatInterface({
  onSubmit,
  isLoading,
  messages,
}: ChatInterfaceProps) {
  const [input, setInput] = useState("");
  const [includeSpiritSoulDraft, setIncludeSpiritSoulDraft] = useState(false);
  const [hasSentWithTag, setHasSentWithTag] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    // Show tag menu when @ is typed
    if (value.endsWith("@")) {
      setShowTagMenu(true);
    } else {
      setShowTagMenu(false);
    }
  };

  const handleTagSelect = () => {
    setIncludeSpiritSoulDraft(true);
    setShowTagMenu(false);
    // Remove the @ from input
    setInput(input.slice(0, -1));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      return;
    }

    const currentTagState = includeSpiritSoulDraft;
    onSubmit(input, currentTagState);
    setInput("");

    // If we sent with the tag, lock it permanently.
    if (currentTagState) {
      setHasSentWithTag(true);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border rounded-lg h-[600px] flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages
            .filter(
              (msg) => msg.role !== "assistant" || msg.content.trim() !== ""
            )
            .map((message, index) => (
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
          <form onSubmit={handleSubmit}>
            <div className="flex flex-col space-y-2">
              <div className="relative">
                <Input
                  ref={inputRef}
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  disabled={isLoading}
                />
                {showTagMenu && (
                  <div className="absolute bottom-full mb-2 w-full bg-white border rounded-lg shadow-lg">
                    <button
                      type="button"
                      className="w-full px-4 py-2 text-left hover:bg-gray-100"
                      onClick={handleTagSelect}
                    >
                      Spirit Soul Draft
                    </button>
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between">
                {includeSpiritSoulDraft && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                  >
                    Spirit Soul Draft
                    {!hasSentWithTag && (
                      <button
                        type="button"
                        onClick={() => setIncludeSpiritSoulDraft(false)}
                        className="ml-1 hover:text-gray-600"
                      >
                        <Cross2Icon className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                )}
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
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
