import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Task } from "../utils/types"

interface PromptInputProps {
  task: Task
  onSubmit: (prompt: string) => void
  isLoading: boolean
}

export default function PromptInput({ task, onSubmit, isLoading }: PromptInputProps) {
  const [prompt, setPrompt] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (prompt.trim()) {
      onSubmit(prompt)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder={`Enter your ${task.outputType} request here...`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="w-full h-32"
      />
      <Button type="submit" disabled={isLoading || !prompt.trim()}>
        {isLoading ? 'Generating...' : 'Generate'}
      </Button>
    </form>
  )
}

