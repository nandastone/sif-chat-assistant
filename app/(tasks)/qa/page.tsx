"use client";

import { useState } from "react";
import ChatInterface from "@/app/components/ChatInterface";
import { ChatMessage, ApiResponse } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { getAuthHeader } from "@/app/utils/auth-utils";

export default function QAPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const task = TASKS.find((t) => t.id === "qa")!;

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true);

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
          task: task.id,
          messages: task.basePrompt
            ? [
                { role: "assistant", content: task.basePrompt },
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
      // Remove the user message if there was an error
      setMessages((prev) => prev.slice(0, -1));
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ChatInterface
      onSubmit={handleSubmit}
      isLoading={isLoading}
      messages={messages}
    />
  );
}
