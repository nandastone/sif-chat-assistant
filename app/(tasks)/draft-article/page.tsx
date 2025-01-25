"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ApiResponse, Citation } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { usePineconeStream } from "@/hooks/use-pinecone-stream";
import {
  ArticleMessage,
  AnalysisMessage,
} from "@/app/components/ArticleMessage";
import { LoadingBubbles } from "@/app/components/LoadingBubbles";
import { ArticleChatHistory } from "@/app/components/ArticleChatHistory";
import { useArticleChatStore } from "@/app/utils/article-chat-store";

export default function DraftArticlePage() {
  const [input, setInput] = useState("");
  const [hasStreamStarted, setHasStreamStarted] = useState(false);
  const task = TASKS.find((t) => t.id === "article")!;
  const { streamRequest, isLoading, isStreaming } = usePineconeStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const { chats, activeChat, createChat, updateActiveChat } =
    useArticleChatStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle initial hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Create a new chat if none exist after hydration
  useEffect(() => {
    if (isHydrated && chats.length === 0) {
      createChat("New Article");
    }
  }, [isHydrated, chats.length, createChat]);

  // Add auto-resize functionality
  const adjustTextareaHeight = () => {
    const textarea = inputRef.current;
    if (textarea) {
      textarea.style.height = "inherit";
      const computed = window.getComputedStyle(textarea);
      const height =
        parseInt(computed.getPropertyValue("border-top-width"), 10) +
        parseInt(computed.getPropertyValue("border-bottom-width"), 10) +
        textarea.scrollHeight;

      textarea.style.height = `${height}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [input]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat?.history, isLoading]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!isStreaming && input.trim()) {
        handleSubmit();
      }
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isStreaming || !activeChat) return;

    const isFirstPrompt = activeChat.history.length === 0;
    const prompt = input;
    setInput("");
    setHasStreamStarted(false);

    // Create a clean title from the prompt if this is the first one
    if (isFirstPrompt) {
      updateActiveChat({ title: prompt });
    }

    // Add prompt to history
    updateActiveChat({
      history: [
        ...activeChat.history,
        {
          type: "prompt" as const,
          content: prompt,
          timestamp: new Date(),
        },
      ],
    });

    let streamedContent = "";
    let streamedCitations: Citation[] = [];

    try {
      await streamRequest(
        {
          task: task.id,
          prompt,
          basePrompt: task.basePrompt,
        },
        (data) => {
          if (data.content) {
            streamedContent += data.content;
            setHasStreamStarted(true);
          }
          if (data.citations) {
            streamedCitations = [...streamedCitations, ...data.citations];
          }

          // Update or create draft with accumulated content
          updateActiveChat({
            history: [
              ...activeChat.history,
              {
                type: "prompt" as const,
                content: prompt,
                timestamp: new Date(),
              },
              {
                type: "draft" as const,
                content: streamedContent,
                citations: streamedCitations,
                timestamp: new Date(),
                isLatest: true,
              },
            ],
            expandedDraftIndex: activeChat.history.length + 1,
          });
        }
      );
    } catch (error) {
      console.error("Error during streaming:", error);
    }
  };

  const handleAnalyze = async () => {
    if (!activeChat) return;
    const latestDraft = activeChat.history.findLast(
      (item) => item.type === "draft"
    );
    if (!latestDraft) return;

    updateActiveChat({
      history: [
        ...activeChat.history,
        {
          type: "analysis",
          content: "",
          timestamp: new Date(),
        },
      ],
      expandedDraftIndex: undefined,
    });

    let content = "";

    await streamRequest(
      {
        task: "analyze",
        prompt: latestDraft.content,
        basePrompt: "Analyze this article draft and suggest improvements:",
      },
      (data) => {
        if (data.content) {
          content += data.content;
        }

        updateActiveChat({
          history: activeChat.history.map((item, index) =>
            index === activeChat.history.length - 1 && item.type === "analysis"
              ? {
                  ...item,
                  content,
                }
              : item
          ),
          expandedDraftIndex: undefined,
        });
      }
    );
  };

  const handleApplyAnalysis = async () => {
    if (!activeChat) return;
    const latestAnalysis = activeChat.history.findLast(
      (item) => item.type === "analysis"
    );
    const latestDraft = activeChat.history.findLast(
      (item) => item.type === "draft"
    );
    if (!latestAnalysis || !latestDraft) return;

    updateActiveChat({
      history: [
        ...activeChat.history,
        {
          type: "draft",
          content: "",
          citations: [],
          timestamp: new Date(),
          isLatest: true,
        },
      ],
      expandedDraftIndex: activeChat.history.length + 1,
    });

    let content = "";
    let citations: Citation[] = [];

    await streamRequest(
      {
        task: task.id,
        prompt: `Apply these improvements to the article:\n${latestAnalysis.content}`,
        basePrompt: task.basePrompt,
      },
      (data) => {
        if (data.content) {
          content += data.content;
        }
        if (data.citations) {
          citations = [...citations, ...data.citations];
        }

        updateActiveChat({
          history: activeChat.history.map((item, index) =>
            index === activeChat.history.length - 1 && item.type === "draft"
              ? {
                  ...item,
                  content,
                  citations,
                }
              : item
          ),
          expandedDraftIndex: activeChat.history.length - 1,
        });
      }
    );
  };

  const handleToggleExpand = (index: number, expanded: boolean) => {
    if (!activeChat) return;
    updateActiveChat({
      expandedDraftIndex: expanded ? index : undefined,
    });
  };

  if (!activeChat) {
    return null;
  }

  return (
    <div className="flex flex-1 min-h-[600px]">
      <ArticleChatHistory />

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-hidden">
          <div className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {activeChat.history.map((item, index) => {
                if (item.type === "prompt") {
                  return (
                    <div key={index} className="flex justify-end">
                      <div className="bg-gray-200 text-gray-900 border border-gray-300 rounded-lg p-4 max-w-[80%]">
                        <div className="whitespace-pre-wrap">
                          {item.content}
                        </div>
                      </div>
                    </div>
                  );
                }

                if (item.type === "draft") {
                  const isLatest =
                    index ===
                    activeChat.history.filter((i) => i.type === "draft")
                      .length -
                      1;
                  const draftNumber = activeChat.history.filter(
                    (h, i) => h.type === "draft" && i <= index
                  ).length;
                  return (
                    <ArticleMessage
                      key={index}
                      draft={{
                        preview: item.content.slice(0, 100).trim(),
                        content: item.content,
                        timestamp: item.timestamp,
                        citations: item.citations || [],
                        isLatest,
                      }}
                      draftNumber={draftNumber}
                      onAnalyze={isLatest ? handleAnalyze : undefined}
                      isExpanded={index === activeChat.expandedDraftIndex}
                      onToggleExpand={(expanded) =>
                        handleToggleExpand(index, expanded)
                      }
                    />
                  );
                }

                if (item.type === "analysis") {
                  return (
                    <AnalysisMessage
                      key={index}
                      analysis={{
                        suggestions: [item.content],
                        timestamp: item.timestamp,
                      }}
                      onApply={handleApplyAnalysis}
                    />
                  );
                }
              })}

              {(isLoading || isStreaming) && !hasStreamStarted && (
                <LoadingBubbles />
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="border-t bg-white">
              <form onSubmit={handleSubmit} className="p-4">
                <div className="flex space-x-2">
                  <Textarea
                    ref={inputRef}
                    value={input}
                    onChange={(e) => {
                      setInput(e.target.value);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder="Type your message..."
                    disabled={isStreaming}
                    className="min-h-[88px] max-h-[176px] resize-none overflow-y-auto"
                    rows={3}
                  />
                  <Button type="submit" disabled={isStreaming || !input.trim()}>
                    {isStreaming ? (
                      <span className="flex items-center space-x-2">
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
      </div>
    </div>
  );
}
