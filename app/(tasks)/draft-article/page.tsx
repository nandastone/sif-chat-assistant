"use client";

import { TASKS } from "@/app/utils/config";
import { ChatPage } from "@/app/components/ChatPage";

export default function DraftArticlePage() {
  const task = TASKS.find((t) => t.id === "draft-article")!;

  return (
    <ChatPage
      taskId={task.id}
      defaultTitle="Draft Article"
      localStorageKey="draft-article-chats"
      placeholder="Enter your article topic..."
      submitButtonText="Generate Draft"
      generatingText="Generating..."
      basePrompt={task.basePrompt}
    />
  );
}
