import Link from "next/link";
import { usePathname } from "next/navigation";
import { Task } from "../utils/types";
import TaskInfoButton from "./TaskInfoButton";

interface TaskNavProps {
  tasks: Task[];
}

export default function TaskNav({ tasks }: TaskNavProps) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {tasks.map((task) => {
          const href = `/${task.id}`;
          const isActive = pathname === href;

          return (
            <Link
              key={task.id}
              href={href}
              className={`p-3 rounded-lg border transition-colors ${
                isActive
                  ? "border-primary bg-primary/5"
                  : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600"
              }`}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-sm">{task.name}</h3>
                <TaskInfoButton task={task} />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5">
                {task.description}
              </p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
