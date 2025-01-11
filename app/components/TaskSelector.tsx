import { Button } from "@/components/ui/button"
import { Task } from "../utils/types"

interface TaskSelectorProps {
  tasks: Task[]
  onSelect: (task: Task) => void
  selectedTask: Task | null
}

export default function TaskSelector({ tasks, onSelect, selectedTask }: TaskSelectorProps) {
  return (
    <div className="flex space-x-2 mb-4">
      {tasks.map((task) => (
        <Button
          key={task.id}
          onClick={() => onSelect(task)}
          variant={selectedTask?.id === task.id ? "default" : "outline"}
        >
          {task.name}
        </Button>
      ))}
    </div>
  )
}

