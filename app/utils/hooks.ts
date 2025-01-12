import { useState } from "react";
import { ApiResponse, ChatMessage, Citation } from "./types";
import { getAuthHeader } from "./auth-utils";

interface UsePineconeStreamOptions {
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

export function usePineconeStream(options: UsePineconeStreamOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const streamRequest = async (
    requestData: {
      task: string;
      prompt?: string;
      basePrompt?: string;
      messages?: ChatMessage[];
    },
    onData: (data: { content?: string; citations?: Citation[] }) => void
  ) => {
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    try {
      const authHeader = await getAuthHeader();
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader,
        },
        body: JSON.stringify(requestData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }
      if (!response.body) throw new Error("No response body");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let hasReceivedData = false;
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          if (!hasReceivedData) {
            throw new Error("Stream ended without receiving any data");
          }
          break;
        }

        const chunk = decoder.decode(value);
        buffer += chunk;
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          try {
            const trimmedLine = line.trim();
            if (!trimmedLine || !trimmedLine.startsWith("data:")) continue;

            const jsonStr = trimmedLine.slice("data:".length);
            const data = JSON.parse(jsonStr);

            if (!hasReceivedData) {
              hasReceivedData = true;
              setIsLoading(false);
              options.onStart?.();
            }

            if (data.type === "content_chunk" && data.delta?.content) {
              onData({ content: data.delta.content });
            }

            if (data.type === "citation" && data.citation) {
              const citation = {
                position: data.citation.position,
                references: data.citation.references.map((ref: any) => ({
                  pages: ref.pages || [],
                  file: {
                    name: ref.file.name,
                    id: ref.file.id,
                    url: ref.file.signed_url,
                  },
                })),
              };
              onData({ citations: [citation] });
            }
          } catch (e) {
            console.error("Error parsing chunk:", e);
            console.log("Problematic line length:", line.length);
            console.log("Line preview:", line.slice(0, 200));
          }
        }
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      options.onError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      setIsLoading(false);
      setIsStreaming(false);
      options.onFinish?.();
    }
  };

  return {
    streamRequest,
    isLoading,
    isStreaming,
    error,
  };
}
