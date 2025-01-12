"use client";

import TaskNav from "@/app/components/TaskNav";
import { TASKS } from "@/app/utils/config";

export default function TasksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-8">
      <TaskNav tasks={TASKS} />
      <div className="container mx-auto px-4 max-w-4xl">{children}</div>
    </div>
  );
}
