import { InfoCircledIcon } from "@radix-ui/react-icons";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { Task } from "../utils/types";

interface TaskInfoButtonProps {
  task: Task;
}

export default function TaskInfoButton({ task }: TaskInfoButtonProps) {
  return (
    <HoverCard openDelay={200}>
      <HoverCardTrigger asChild>
        <button
          className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          onClick={(e) => e.stopPropagation()} // Prevent task selection when clicking info icon
        >
          <InfoCircledIcon className="h-4 w-4" />
        </button>
      </HoverCardTrigger>
      <HoverCardContent className="w-[450px] p-4">
        <h3 className="font-semibold mb-2">Base Prompt Configuration</h3>
        <pre className="text-sm bg-muted p-3 rounded whitespace-pre-wrap overflow-auto max-h-[400px]">
          {task.basePrompt}
        </pre>
      </HoverCardContent>
    </HoverCard>
  );
}
