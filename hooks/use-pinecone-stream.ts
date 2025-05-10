import { useState } from "react";
import { ChatMessage, Citation } from "../app/utils/types";
import { getAuthHeader } from "../app/utils/auth-utils";
import * as Sentry from "@sentry/nextjs";
import { API_ENDPOINTS } from "../app/utils/config";

interface UsePineconeStreamOptions {
  onStart?: () => void;
  onFinish?: () => void;
  onError?: (error: Error) => void;
}

const TIMEOUT_MS = 60 * 1000; // 60 seconds

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
      includeSpiritSoulDraft?: boolean;
    },
    onData: (data: { content?: string; citations?: Citation[] }) => void
  ) => {
    setIsLoading(true);
    setIsStreaming(true);
    setError(null);

    let timeoutId: NodeJS.Timeout | undefined;
    let lastChunkTime = Date.now();
    let hasEndMessage = false;

    const checkTimeout = () => {
      const timeSinceLastChunk = Date.now() - lastChunkTime;
      if (timeSinceLastChunk >= TIMEOUT_MS) {
        const error = new Error(
          `Response timeout after ${timeSinceLastChunk}ms`
        );
        Sentry.captureException(error, {
          tags: {
            task: requestData.task,
            timeout_ms: TIMEOUT_MS,
            time_since_last_chunk: timeSinceLastChunk,
            has_end_message: hasEndMessage,
          },
        });
        throw error;
      }
      timeoutId = setTimeout(checkTimeout, 1000); // Check every second
    };

    try {
      timeoutId = setTimeout(checkTimeout, 1000);

      const authHeader = await getAuthHeader();
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (authHeader) {
        headers.Authorization = authHeader;
      }

      const response = await fetch(API_ENDPOINTS.generate, {
        method: "POST",
        headers,
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
          if (!hasEndMessage) {
            const error = new Error("Stream ended without message_end");
            Sentry.captureException(error, {
              tags: {
                task: requestData.task,
                has_end_message: false,
              },
            });
            throw error;
          }
          break;
        }

        lastChunkTime = Date.now();
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

            if (data.type === "message_end") {
              hasEndMessage = true;
            }

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
      if (timeoutId) clearTimeout(timeoutId);
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
