"use client";

import { useState } from "react";
import PromptInput from "@/app/components/PromptInput";
import ResultsDisplay from "@/app/components/ResultsDisplay";
import { ApiResponse } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { getAuthHeader } from "@/app/utils/auth-utils";

export default function ArticlePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const task = TASKS.find((t) => t.id === "article")!;

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const authHeader = await getAuthHeader();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          task: task.id,
          prompt,
          basePrompt: task.basePrompt,
        }),
      });
      if (!response.ok) throw new Error("Failed to generate content");
      const data: ApiResponse = await response.json();
      setResults(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <PromptInput onSubmit={handleSubmit} isLoading={isLoading} />
      {error && (
        <div className="text-red-500 font-medium text-center">{error}</div>
      )}
      {results?.content && (
        <ResultsDisplay results={results} isLoading={isLoading} />
      )}
    </div>
  );
}
