"use client";

import { TASKS } from "@/app/utils/config";
import { ChatPage } from "@/app/components/ChatPage";

export default function CourseOutlinePage() {
  const task = TASKS.find((t) => t.id === "course-outline")!;

  return (
    <ChatPage
      taskId={task.id}
      defaultTitle="Course Outline"
      localStorageKey="course-outline-chats"
      placeholder="Enter your course topic..."
      submitButtonText="Generate Outline"
      generatingText="Generating..."
      basePrompt={task.basePrompt}
    />
  );
}
