import { Task } from './types'

export const TASKS: Task[] = [
  {
    id: 'research',
    name: 'Research Assistant',
    description: 'Analyze and compile information from source documents',
    basePrompt: 'Analyze the following topic and provide a comprehensive research summary:',
    outputType: 'research'
  },
  {
    id: 'article',
    name: 'Article Generator',
    description: 'Generate a complete article draft',
    basePrompt: 'Write a well-structured article on the following topic:',
    outputType: 'article'
  }
]

