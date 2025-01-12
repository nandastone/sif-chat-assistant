"use client";

import { useState } from "react";
import PromptInput from "@/app/components/PromptInput";
import ResultsDisplay from "@/app/components/ResultsDisplay";
import { ApiResponse } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { usePineconeStream } from "@/hooks/use-pinecone-stream";

export default function ArticlePage() {
  const [results, setResults] = useState<ApiResponse>({
    content: "",
    citations: [],
  });
  const task = TASKS.find((t) => t.id === "article")!;

  const { streamRequest, isLoading, isStreaming } = usePineconeStream();

  const handleSubmit = async (prompt: string) => {
    setResults({ content: "", citations: [] });

    await streamRequest(
      {
        task: task.id,
        prompt,
        basePrompt: task.basePrompt,
      },
      (data) => {
        setResults((prev) => ({
          content: data.content ? prev.content + data.content : prev.content,
          citations: data.citations
            ? [...prev.citations, ...data.citations]
            : prev.citations,
        }));
      }
    );
  };

  return (
    <div className="space-y-8">
      <PromptInput onSubmit={handleSubmit} isLoading={isStreaming} />
      {results && <ResultsDisplay results={results} isLoading={isLoading} />}
    </div>
  );
}
