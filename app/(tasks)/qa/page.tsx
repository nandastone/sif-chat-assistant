"use client";

import ChatInterface from "@/app/components/ChatInterface";
import { ChatMessage, Citation } from "@/app/utils/types";
import { TASKS } from "@/app/utils/config";
import { useChatStore } from "@/app/utils/store";
import { Button } from "@/components/ui/button";
import { usePineconeStream } from "@/hooks/use-pinecone-stream";

export default function QAPage() {
  const { messages, setMessages, clearMessages } = useChatStore();
  const task = TASKS.find((t) => t.id === "qa")!;

  const { streamRequest, isLoading } = usePineconeStream({
    onError: (error) => {
      // Remove both messages on error
      setMessages(messages);
      throw error;
    },
  });

  const handleSubmit = async (
    prompt: string,
    includeSpiritSoulDraft?: boolean
  ) => {
    // Create messages for this conversation turn
    const userMessage: ChatMessage = {
      role: "user",
      content: prompt,
    };
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: "",
      citations: [],
    };

    // Add both messages to create the conversation turn
    const currentMessages = [...messages, userMessage, assistantMessage];
    setMessages(currentMessages);

    let content = "";
    let citations: Citation[] = [];

    try {
      await streamRequest(
        {
          task: task.id,
          messages: task.basePrompt
            ? [
                { role: "assistant", content: task.basePrompt },
                ...messages,
                userMessage,
              ]
            : [...messages, userMessage],
          includeSpiritSoulDraft,
        },
        (data) => {
          if (data.content) {
            content += data.content;
          }
          if (data.citations) {
            citations = [...citations, ...data.citations];
          }

          // Update the assistant's message
          const updatedMessages = [...currentMessages];
          const assistantMsg = updatedMessages[updatedMessages.length - 1];
          assistantMsg.content = content;
          assistantMsg.citations = citations;
          setMessages(updatedMessages);
        }
      );
    } catch (error) {
      // Remove both messages on error
      setMessages(messages);
      throw error;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button variant="outline" onClick={clearMessages} className="mb-2">
          Clear Chat
        </Button>
      </div>
      <ChatInterface
        onSubmit={handleSubmit}
        isLoading={isLoading}
        messages={messages}
      />
    </div>
  );
}
