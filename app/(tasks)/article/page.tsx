"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ApiResponse, Citation } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { usePineconeStream } from "@/hooks/use-pinecone-stream";
import {
  ArticleMessage,
  AnalysisMessage,
} from "@/app/components/ArticleMessage";

interface ArticleState {
  history: Array<{
    type: "prompt" | "draft" | "analysis";
    content: string;
    timestamp: Date;
    citations?: Citation[];
    isLatest?: boolean;
  }>;
}

export default function ArticlePage() {
  const [state, setState] = useState<ArticleState>({ history: [] });
  const [input, setInput] = useState("");
  const task = TASKS.find((t) => t.id === "article")!;
  const { streamRequest, isLoading, isStreaming } = usePineconeStream();

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
    }));

    const prompt = input;
    setInput("");

    await streamRequest(
      {
        task: task.id,
        prompt,
        basePrompt: task.basePrompt,
      },
      (data) => {
        if (data.content || data.citations) {
          setState((prev) => ({
            history: [
              ...prev.history,
              {
                type: "draft",
                content: data.content || "",
                citations: data.citations || [],
                timestamp: new Date(),
                isLatest: true,
              },
            ],
          }));
        }
      }
    );
  };

  const handleAnalyze = async () => {
    const latestDraft = state.history.findLast((item) => item.type === "draft");
    if (!latestDraft) return;

    await streamRequest(
      {
        task: "analyze",
        prompt: latestDraft.content,
        basePrompt: "Analyze this article draft and suggest improvements:",
      },
      (data) => {
        if (data.content) {
          setState((prev) => ({
            history: [
              ...prev.history,
              {
                type: "analysis" as const,
                content: data.content || "",
                timestamp: new Date(),
              },
            ],
          }));
        }
      }
    );
  };

  const handleApplyAnalysis = async () => {
    const latestAnalysis = state.history.findLast(
      (item) => item.type === "analysis"
    );
    const latestDraft = state.history.findLast((item) => item.type === "draft");
    if (!latestAnalysis || !latestDraft) return;

    await streamRequest(
      {
        task: task.id,
        prompt: `Apply these improvements to the article:\n${latestAnalysis.content}`,
        basePrompt: task.basePrompt,
      },
      (data) => {
        if (data.content || data.citations) {
          setState((prev) => ({
            history: [
              ...prev.history,
              {
                type: "draft",
                content: data.content || "",
                citations: data.citations || [],
                timestamp: new Date(),
                isLatest: true,
              },
            ],
          }));
        }
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button
          variant="outline"
          onClick={() => setState({ history: [] })}
          className="mb-2"
        >
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
                    {item.content}
                  </div>
                </div>
              );
            }

            if (item.type === "draft") {
              const isLatest =
                index ===
                state.history.filter((i) => i.type === "draft").length - 1;
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
                  onAnalyze={isLatest ? handleAnalyze : undefined}
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
        </div>

        <div className="p-4 border-t">
          <form onSubmit={handleSubmit}>
            <div className="flex space-x-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                disabled={isStreaming}
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
