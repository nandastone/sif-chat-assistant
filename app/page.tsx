"use client";

import { useState } from "react";
import TaskSelector from "./components/TaskSelector";
import PromptInput from "./components/PromptInput";
import ResultsDisplay from "./components/ResultsDisplay";
import ChatInterface from "./components/ChatInterface";
import Footer from "./components/Footer";
import { Task, ApiResponse, ChatMessage } from "./utils/types";
import { TASKS } from "./utils/config";
import { getAuthHeader } from "./utils/auth-utils";

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(TASKS[0]);
  const [results, setResults] = useState<ApiResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setResults(null);
    setError(null);
    setMessages([]);
  };

  const handleChatSubmit = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    // Add user message immediately
    const userMessage: ChatMessage = {
      role: "user",
      content: prompt,
    };
    setMessages((prev) => [...prev, userMessage]);

    try {
      const authHeader = await getAuthHeader();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify({
          task: selectedTask?.id,
          messages: selectedTask?.basePrompt
            ? [
                { role: "assistant", content: selectedTask.basePrompt },
                ...messages,
                userMessage,
              ]
            : [...messages, userMessage],
        }),
      });

      if (!response.ok) throw new Error("Failed to generate content");
      const data: ApiResponse = await response.json();

      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: data.content,
        citations: data.citations,
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred"
      );
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResearchSubmit = async (prompt: string) => {
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
          task: selectedTask?.id,
          prompt,
          basePrompt: selectedTask?.basePrompt,
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
    <>
      <main className="container mx-auto p-4 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">SIF.yoga Research Assistant</h1>
        <div className="space-y-8">
          <TaskSelector
            tasks={TASKS}
            onSelect={handleTaskSelect}
            selectedTask={selectedTask}
          />
          {selectedTask && (
            <>
              {selectedTask.outputType === "chat" ? (
                <ChatInterface
                  onSubmit={handleChatSubmit}
                  isLoading={isLoading}
                  messages={messages}
                />
              ) : (
                <>
                  <PromptInput
                    onSubmit={handleResearchSubmit}
                    isLoading={isLoading}
                  />
                  {error && (
                    <div className="text-red-500 font-medium text-center">
                      {error}
                    </div>
                  )}
                  {results?.content && (
                    <ResultsDisplay results={results} isLoading={isLoading} />
                  )}
                </>
              )}
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
