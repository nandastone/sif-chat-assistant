"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Citation } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { usePineconeStream } from "@/hooks/use-pinecone-stream";
import { LoadingBubbles } from "@/app/components/LoadingBubbles";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Cross2Icon } from "@radix-ui/react-icons";
import { ChatHistory } from "@/app/components/ChatHistory";
import { ArticleDraftMessage } from "@/app/components/ArticleDraftMessage";
import { ChevronDownIcon } from "@radix-ui/react-icons";

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
}

const ANALYSIS_TYPES = [
  {
    id: "wikipedia",
    label: "Wikipedia Guidelines",
    prompt:
      "Evaluate this article's suitability as a Wikipedia reference based on the following criteria: reliability of the publisher/author, independence from the subject, factual accuracy, and third-party verification. Check if it meets Wikipedia's requirements for reliable sources, including editorial oversight and reputation.",
  },
  {
    id: "completeness",
    label: "Check Completeness",
    prompt:
      "Analyze if this article covers all key aspects of the topic. Identify any missing important points or areas that need more depth.",
  },
  {
    id: "clarity",
    label: "Check Clarity & Structure",
    prompt:
      "Analyze this article for clarity, structure, and flow. Suggest specific improvements to make the content more clear and engaging.",
  },
];

export default function DraftArticlePage() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<Chat | null>(null);
  const [stagingMessage, setStagingMessage] = useState<Message | null>(null);
  const [input, setInput] = useState("");
  const task = TASKS.find((t) => t.id === "article")!;
  const { streamRequest, isStreaming } = usePineconeStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Load chats from localStorage
  useEffect(() => {
    const savedChats = localStorage.getItem("chats");
    if (savedChats) {
      const parsed = JSON.parse(savedChats);
      setChats(parsed);
      // Set the first chat as active if none is active
      if (parsed.length > 0) {
        setActiveChat(parsed[0]);
      }
    } else {
      // Create initial chat
      const newChat = {
        id: Date.now().toString(),
        title: "New Article",
        messages: [],
      };
      setChats([newChat]);
      setActiveChat(newChat);
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem("chats", JSON.stringify(chats));
    }
  }, [chats]);

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

  const createNewChat = () => {
    const newChat = {
      id: Date.now().toString(),
      title: "New Article",
      messages: [],
    };
    setChats((current) => [newChat, ...current]);
    setActiveChat(newChat);
  };

  const deleteChat = (id: string) => {
    setChats((current) => {
      const filtered = current.filter((c) => c.id !== id);
      // If we're deleting the active chat, set the first remaining chat as active
      if (activeChat?.id === id && filtered.length > 0) {
        setActiveChat(filtered[0]);
      }
      // If this was the last chat, create a new one
      if (filtered.length === 0) {
        const newChat = {
          id: Date.now().toString(),
          title: "New Article",
          messages: [],
        };
        setActiveChat(newChat);
        return [newChat];
      }
      return filtered;
    });
  };

  const updateActiveChat = (messages: Message[]) => {
    if (!activeChat) return;

    const updatedChat = { ...activeChat, messages };
    setActiveChat(updatedChat);
    setChats((current) =>
      current.map((chat) => (chat.id === activeChat.id ? updatedChat : chat))
    );
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming || !activeChat) return;

    const prompt = input;
    setInput("");

    // If this is the first message, use it as the chat title
    if (activeChat.messages.length === 0) {
      const updatedChat = { ...activeChat, title: prompt };
      setActiveChat(updatedChat);
      setChats((current) =>
        current.map((chat) => (chat.id === activeChat.id ? updatedChat : chat))
      );
    }

    // Add user prompt to messages
    const promptMessage = {
      type: "prompt" as const,
      content: prompt,
      timestamp: new Date(),
    };
    const updatedMessages = [...activeChat.messages, promptMessage];
    updateActiveChat(updatedMessages);

    // Create staging message for streaming
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
          task: task.id,
          prompt,
          basePrompt: task.basePrompt,
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

      // Commit the final message to chat history, preserving the prompt message
      if (content) {
        updateActiveChat([
          ...updatedMessages, // Include the prompt message we added earlier
          { ...draftMessage, content: content.trim(), citations },
        ]);
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

    // Add prompt to messages
    const promptMessage = {
      type: "prompt" as const,
      content: "Analyze draft",
      timestamp: new Date(),
    };
    updateActiveChat([...activeChat.messages, promptMessage]);

    // Create staging message for analysis
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

      // Commit the final message to chat history
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

    // Add prompt to messages
    const promptMessage = {
      type: "prompt" as const,
      content: "Apply analysis",
      timestamp: new Date(),
    };
    updateActiveChat([...activeChat.messages, promptMessage]);

    // Create staging message for streaming
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
          task: task.id,
          prompt: `Apply these improvements to the article:\n${latestAnalysis.content}`,
          basePrompt: task.basePrompt,
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

      // Commit the final message to chat history
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

                      // Count previous drafts for numbering
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
                      return (
                        <div key={index} className="space-y-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="prose max-w-none">
                              <ReactMarkdown>{msg.content}</ReactMarkdown>
                            </div>
                            {msg.content && (
                              <div className="mt-4 flex justify-end">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={handleApplyAnalysis}
                                  disabled={isStreaming}
                                >
                                  Apply Changes
                                </Button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    }

                    return null;
                  })}
                  {isStreaming && !stagingMessage?.content && (
                    <LoadingBubbles />
                  )}
                  {stagingMessage?.content && (
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
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </div>

            <div className="bg-white">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="flex flex-col space-y-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isStreaming}
                    className="min-h-[88px] max-h-[176px] resize-none overflow-y-auto"
                    rows={3}
                  />
                  <Button
                    type="submit"
                    disabled={isStreaming || !input.trim()}
                    className="self-end"
                  >
                    {isStreaming ? "Sending..." : "Send"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
