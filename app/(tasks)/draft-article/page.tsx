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
import { UpdateIcon } from "@radix-ui/react-icons";
import { LoadingBubbles } from "@/app/components/LoadingBubbles";

interface ArticleState {
  history: Array<{
    type: "prompt" | "draft" | "analysis";
    content: string;
    timestamp: Date;
    citations?: Citation[];
    isLatest?: boolean;
  }>;
  expandedDraftIndex?: number;
}

export default function DraftArticlePage() {
  const [state, setState] = useState<ArticleState>({ history: [] });
  const [input, setInput] = useState("");
  const task = TASKS.find((t) => t.id === "article")!;
  const { streamRequest, isLoading, isStreaming } = usePineconeStream();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [state.history, isLoading]);

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
    if (!input.trim() || isStreaming) return;

    // Add user prompt to history
    setState((prev) => ({
      history: [
        ...prev.history,
        {
          type: "prompt",
          content: input,
          timestamp: new Date(),
        },
      ],
      expandedDraftIndex: undefined,
    }));

    const prompt = input;
    setInput("");

    let content = "";
    let citations: Citation[] = [];
    let draftCreated = false;

    await streamRequest(
      {
        task: task.id,
        prompt,
        basePrompt: task.basePrompt,
      },
      (data) => {
        if (!draftCreated) {
          // Create draft message when first chunk arrives
          setState((prev) => ({
            history: [
              ...prev.history,
              {
                type: "draft",
                content: "",
                citations: [],
                timestamp: new Date(),
                isLatest: true,
              },
            ],
            expandedDraftIndex: prev.history.length + 1,
          }));
          draftCreated = true;
        }

        if (data.content) {
          content += data.content;
        }
        if (data.citations) {
          citations = [...citations, ...data.citations];
        }

        // Update the draft message
        setState((prev) => {
          const history = [...prev.history];
          const draftMsg = history[history.length - 1];
          if (draftMsg.type === "draft") {
            draftMsg.content = content;
            draftMsg.citations = citations;
          }
          return { history, expandedDraftIndex: history.length - 1 };
        });
      }
    );
  };

  const handleAnalyze = async () => {
    const latestDraft = state.history.findLast((item) => item.type === "draft");
    if (!latestDraft) return;

    // Create initial analysis message
    setState((prev) => ({
      history: [
        ...prev.history,
        {
          type: "analysis",
          content: "",
          timestamp: new Date(),
        },
      ],
      expandedDraftIndex: undefined,
    }));

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

        // Update the analysis message
        setState((prev) => {
          const history = [...prev.history];
          const analysisMsg = history[history.length - 1];
          if (analysisMsg.type === "analysis") {
            analysisMsg.content = content;
          }
          return { history, expandedDraftIndex: undefined };
        });
      }
    );
  };

  const handleApplyAnalysis = async () => {
    const latestAnalysis = state.history.findLast(
      (item) => item.type === "analysis"
    );
    const latestDraft = state.history.findLast((item) => item.type === "draft");
    if (!latestAnalysis || !latestDraft) return;

    // Create initial draft message
    setState((prev) => ({
      history: [
        ...prev.history,
        {
          type: "draft",
          content: "",
          citations: [],
          timestamp: new Date(),
          isLatest: true,
        },
      ],
      expandedDraftIndex: prev.history.length + 1,
    }));

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

        // Update the draft message
        setState((prev) => {
          const history = [...prev.history];
          const draftMsg = history[history.length - 1];
          if (draftMsg.type === "draft") {
            draftMsg.content = content;
            draftMsg.citations = citations;
          }
          return { history, expandedDraftIndex: history.length - 1 };
        });
      }
    );
  };

  const handleToggleExpand = (index: number, expanded: boolean) => {
    setState((prev) => ({
      ...prev,
      expandedDraftIndex: expanded ? index : undefined,
    }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold">Draft Article (Chat)</h1>
        <Button variant="outline" onClick={() => setState({ history: [] })}>
          Clear History
        </Button>
      </div>

      <div className="border rounded-lg h-[600px] flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {state.history.map((item, index) => {
            if (item.type === "prompt") {
              return (
                <div key={index} className="flex justify-end">
                  <div className="bg-gray-200 text-gray-900 border border-gray-300 rounded-lg p-4 max-w-[80%]">
                    <div className="whitespace-pre-wrap">{item.content}</div>
                  </div>
                </div>
              );
            }

            if (item.type === "draft") {
              const isLatest =
                index ===
                state.history.filter((i) => i.type === "draft").length - 1;
              const draftNumber = state.history.filter(
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
                  isExpanded={index === state.expandedDraftIndex}
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

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
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
            <div className="flex space-x-2">
              <Textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                disabled={isStreaming}
                className="min-h-[44px] max-h-[200px] resize-none"
                rows={1}
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
  );
}
