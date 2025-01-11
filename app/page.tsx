'use client'

import { useState } from 'react'
import TaskSelector from './components/TaskSelector'
import PromptInput from './components/PromptInput'
import ResultsDisplay from './components/ResultsDisplay'
import { Task, ApiResponse } from './utils/types'
import { TASKS } from './utils/config'

export default function Home() {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [results, setResults] = useState<ApiResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task)
    setResults(null)
    setError(null)
  }

  const handleSubmit = async (prompt: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: selectedTask?.id, prompt }),
      })
      if (!response.ok) throw new Error('Failed to generate content')
      const data: ApiResponse = await response.json()
      setResults(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">Research & Writing Assistant</h1>
      <TaskSelector tasks={TASKS} onSelect={handleTaskSelect} selectedTask={selectedTask} />
      {selectedTask && (
        <PromptInput 
          task={selectedTask} 
          onSubmit={handleSubmit} 
          isLoading={isLoading} 
        />
      )}
      {error && <div className="text-red-500 mt-4">{error}</div>}
      {results && <ResultsDisplay results={results} />}
    </main>
  )
}

