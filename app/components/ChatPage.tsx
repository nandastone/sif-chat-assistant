"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Citation } from "@/app/utils/types";
import { ANALYSIS_TYPES } from "@/app/utils/config";
import { usePineconeStream } from "@/hooks/use-pinecone-stream";
import { LoadingBubbles } from "@/app/components/LoadingBubbles";
import { ChatHistory } from "@/app/components/ChatHistory";
import { ArticleDraftMessage } from "@/app/components/ArticleDraftMessage";
import { AnalysisMessage } from "@/app/components/AnalysisMessage";
import { Badge } from "@/components/ui/badge";
import { Cross2Icon } from "@radix-ui/react-icons";

interface Message {
  type: "prompt" | "draft" | "analysis";
  content: string;
  citations?: Citation[];
  timestamp: Date;
}

interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

interface ChatPageProps {
  taskId: string;
  defaultTitle: string;
  localStorageKey: string;
  placeholder: string;
  submitButtonText: string;
  generatingText: string;
  basePrompt: string;
}

// Helper function to extract title from markdown content
const extractTitleFromMarkdown = (content: string): string | null => {
  const h1Match = content.match(/^[ \t]*# (.+)$/m);
  return h1Match ? h1Match[1].trim() : null;
};

export function ChatPage({
  taskId,
  defaultTitle,
  localStorageKey,
  placeholder,
  submitButtonText,
  generatingText,
  basePrompt,
}: ChatPageProps) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [stagingMessage, setStagingMessage] = useState<Message | null>(null);
  const [input, setInput] = useState("");
  const [includeSpiritSoulDraft, setIncludeSpiritSoulDraft] = useState(false);
  const [hasSentWithTag, setHasSentWithTag] = useState(false);
  const [showTagMenu, setShowTagMenu] = useState(false);
  const { streamRequest, isStreaming } = usePineconeStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem(localStorageKey, JSON.stringify(chats));
    }
  }, [chats, localStorageKey]);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem(localStorageKey);
    if (savedChats) {
      try {
        const parsed = JSON.parse(savedChats);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setChats(parsed);
          setActiveChat(parsed[0]);
          return;
        }
      } catch (e) {
        console.error("Error parsing saved chats:", e);
      }
    }

    // Create initial chat if no valid chats found
    const newChat = {
      id: Date.now().toString(),
      title: defaultTitle,
      messages: [],
      timestamp: new Date(),
    };
    setChats([newChat]);
    setActiveChat(newChat);
  }, [defaultTitle, localStorageKey]);

  // Auto-scroll to bottom only during streaming
  useEffect(() => {
    if (isStreaming || stagingMessage) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [isStreaming, stagingMessage, activeChat?.messages]);

  // Auto-focus input
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Focus input after streaming completes
  useEffect(() => {
    if (!isStreaming) {
      inputRef.current?.focus();
    }
  }, [isStreaming]);

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: defaultTitle,
      messages: [],
      timestamp: new Date(),
    };
    setChats((current) => [newChat, ...current]);
    setActiveChat(newChat);
  };

  const deleteChat = (id: string) => {
    setChats((current) => {
      const filtered = current.filter((c) => c.id !== id);
      if (activeChat?.id === id && filtered.length > 0) {
        setActiveChat(filtered[0]);
      }
      if (filtered.length === 0) {
        const newChat = {
          id: Date.now().toString(),
          title: defaultTitle,
          messages: [],
          timestamp: new Date(),
        };
        setActiveChat(newChat);
        return [newChat];
      }
      return filtered;
    });
  };

  const updateActiveChat = (messages: Message[]) => {
    if (!activeChat) return;

    const latestDraft = [...messages].reverse().find((m) => m.type === "draft");
    const title = latestDraft
      ? extractTitleFromMarkdown(latestDraft.content) || activeChat.title
      : activeChat.title;

    const updatedChat = { ...activeChat, messages, title };
    setActiveChat(updatedChat);
    setChats((current) =>
      current.map((chat) => (chat.id === activeChat.id ? updatedChat : chat))
    );
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
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

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming || !activeChat) return;

    const prompt = input;
    setInput("");

    const promptMessage = {
      type: "prompt" as const,
      content: prompt,
      timestamp: new Date(),
    };
    const updatedMessages = [...activeChat.messages, promptMessage];
    updateActiveChat(updatedMessages);

    const draftMessage = {
      type: "draft" as const,
      content: "",
      timestamp: new Date(),
      citations: [] as Citation[],
    };
    setStagingMessage(draftMessage);

    let content = "";
    let citations: Citation[] = [];

    try {
      await streamRequest(
        {
          task: taskId,
          prompt,
          basePrompt,
          includeSpiritSoulDraft,
        },
        (data) => {
          if (data.content) {
            content += data.content;
            setStagingMessage((current) =>
              current
                ? { ...current, content: content.trim(), citations }
                : null
            );
          }
          if (data.citations) {
            citations = [...citations, ...data.citations];
          }
        }
      );

      if (content) {
        updateActiveChat([
          ...updatedMessages,
          { ...draftMessage, content: content.trim(), citations },
        ]);
      }

      // If we sent with the tag, lock it permanently
      if (includeSpiritSoulDraft) {
        setHasSentWithTag(true);
      }
    } finally {
      setStagingMessage(null);
    }
  };

  const handleAnalyze = async (analysisPrompt: string) => {
    if (isStreaming || !activeChat) return;

    const latestDraft = [...activeChat.messages]
      .reverse()
      .find((m) => m.type === "draft");
    if (!latestDraft) return;

    const analysisMessage = {
      type: "analysis" as const,
      content: "",
      timestamp: new Date(),
    };
    setStagingMessage(analysisMessage);

    let content = "";

    try {
      await streamRequest(
        {
          task: "analyze",
          prompt: latestDraft.content,
          basePrompt: analysisPrompt,
        },
        (data) => {
          if (data.content) {
            content += data.content;
            setStagingMessage((current) =>
              current ? { ...current, content: content.trim() } : null
            );
          }
        }
      );

      if (content) {
        updateActiveChat([
          ...activeChat.messages,
          { ...analysisMessage, content: content.trim() },
        ]);
      }
    } finally {
      setStagingMessage(null);
    }
  };

  const handleApplyAnalysis = async () => {
    if (isStreaming || !activeChat) return;

    const latestAnalysis = [...activeChat.messages]
      .reverse()
      .find((m) => m.type === "analysis");
    if (!latestAnalysis) return;

    const draftMessage = {
      type: "draft" as const,
      content: "",
      timestamp: new Date(),
      citations: [] as Citation[],
    };
    setStagingMessage(draftMessage);

    let content = "";
    let citations: Citation[] = [];

    try {
      await streamRequest(
        {
          task: taskId,
          prompt: `Apply these improvements:\n${latestAnalysis.content}`,
          basePrompt,
        },
        (data) => {
          if (data.content) {
            content += data.content;
            setStagingMessage((current) =>
              current
                ? { ...current, content: content.trim(), citations }
                : null
            );
          }
          if (data.citations) {
            citations = [...citations, ...data.citations];
          }
        }
      );

      if (content) {
        updateActiveChat([
          ...activeChat.messages,
          { ...draftMessage, content: content.trim(), citations },
        ]);
      }
    } finally {
      setStagingMessage(null);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        handleSubmit();
      }
    }
  };

  return (
    <div className="flex flex-1 min-h-[600px] overflow-hidden">
      <ChatHistory
        chats={chats}
        activeChat={activeChat}
        onSelectChat={setActiveChat}
        onDeleteChat={deleteChat}
        onNewChat={createNewChat}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {activeChat ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto">
              <div className="p-4">
                <div className="space-y-4">
                  {activeChat.messages.map((msg, index) => {
                    if (msg.type === "prompt") {
                      return (
                        <div key={index} className="flex justify-end">
                          <div className="bg-gray-200 text-gray-900 border border-gray-300 rounded-lg p-4 max-w-[80%]">
                            <div className="whitespace-pre-wrap">
                              {msg.content}
                            </div>
                          </div>
                        </div>
                      );
                    }

                    if (msg.type === "draft") {
                      const isLatest =
                        index === activeChat.messages.length - 1 ||
                        activeChat.messages
                          .slice(index + 1)
                          .every((m) => m.type === "analysis");

                      const draftNumber = activeChat.messages
                        .slice(0, index + 1)
                        .filter((m) => m.type === "draft").length;

                      return (
                        <div
                          key={index}
                          className="draft-message"
                          style={{ counterReset: `draft ${draftNumber}` }}
                        >
                          <ArticleDraftMessage
                            content={msg.content}
                            timestamp={msg.timestamp}
                            citations={msg.citations}
                            isLatest={isLatest}
                            isStreaming={isStreaming}
                            onAnalyze={handleAnalyze}
                            analysisTypes={ANALYSIS_TYPES}
                            draftNumber={draftNumber}
                          />
                        </div>
                      );
                    }

                    if (msg.type === "analysis") {
                      const isLatest = index === activeChat.messages.length - 1;
                      return (
                        <AnalysisMessage
                          key={index}
                          content={msg.content}
                          timestamp={msg.timestamp}
                          isLatest={isLatest}
                          isStreaming={isStreaming}
                          onApply={handleApplyAnalysis}
                          analysisType="Suggested Improvements"
                        />
                      );
                    }

                    return null;
                  })}
                  {isStreaming && !stagingMessage?.content && (
                    <LoadingBubbles />
                  )}
                  {stagingMessage?.content &&
                    (stagingMessage.type === "analysis" ? (
                      <AnalysisMessage
                        content={stagingMessage.content}
                        timestamp={stagingMessage.timestamp}
                        isLatest={true}
                        isStreaming={isStreaming}
                        onApply={handleApplyAnalysis}
                        analysisType="Suggested Improvements"
                      />
                    ) : (
                      <ArticleDraftMessage
                        content={stagingMessage.content}
                        timestamp={stagingMessage.timestamp}
                        citations={stagingMessage.citations}
                        isLatest={true}
                        isStreaming={isStreaming}
                        onAnalyze={handleAnalyze}
                        analysisTypes={ANALYSIS_TYPES}
                        draftNumber={
                          activeChat.messages.filter((m) => m.type === "draft")
                            .length + 1
                        }
                      />
                    ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <div className="bg-white">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="flex flex-col space-y-2">
                  <div className="relative">
                    <Textarea
                      ref={inputRef}
                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={placeholder}
                      disabled={isStreaming}
                      className="min-h-[88px] max-h-[176px] resize-none overflow-y-auto"
                      rows={3}
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
                    <Button
                      type="submit"
                      disabled={isStreaming || !input.trim()}
                      className="self-end"
                    >
                      {isStreaming ? generatingText : submitButtonText}
                    </Button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
