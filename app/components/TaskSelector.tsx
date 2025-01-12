import { Task } from "../utils/types";
import TaskInfoButton from "./TaskInfoButton";

interface TaskSelectorProps {
  tasks: Task[];
  selectedTask: Task | null;
  onSelect: (task: Task) => void;
}

export default function TaskSelector({
  tasks,
  selectedTask,
  onSelect,
}: TaskSelectorProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <div
          key={task.id}
          className={`p-4 rounded-lg border cursor-pointer transition-colors ${
            selectedTask?.id === task.id
              ? "border-primary bg-primary/5"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
          }`}
          onClick={() => onSelect(task)}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{task.name}</h3>
            <TaskInfoButton task={task} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
            {task.description}
          </p>
        </div>
      ))}
    </div>
  );
}
