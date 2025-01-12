# Research Assistant

A Next.js application that provides a streamlined interface for AI-powered research and content generation using Pinecone's AI capabilities. Features include article research, Q&A assistance, and content generation tasks.

## Features

- Research assistance with AI-powered insights
- Question & Answer interface
- Article analysis and content generation
- Modern, responsive UI
- Real-time content generation
- Task-based navigation system

## Tech Stack

- **Framework**: Next.js 14.2
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**:
  - Radix UI primitives
  - Shadcn/ui components
  - Custom React components
- **State Management**: Zustand
- **AI Integration**: Pinecone
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Markdown Support**: react-markdown
- **Theme**: next-themes

## Prerequisites

- Node.js 18+ or Bun runtime
- Pinecone API key
- Environment variables setup (see below)

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
3. Copy `.env.example` to `.env.local` and fill in your environment variables:

   ```
   PINECONE_API_KEY=your_api_key
   PINECONE_ASSISTANT_NAME=your_assistant_name
   AUTH_SECRET=your_secure_secret
   ```

4. Run the development server:

   ```bash
   npm run dev
   # or
   bun dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

## API Endpoints

- `POST /api/generate` - Generate research assistance responses
  - Supports streaming responses with Server-Sent Events (SSE)
  - 60-second timeout for long-running requests
  - Requires authentication via Authorization header
  - Request body:
    ```json
    {
      "task": "string",
      "prompt": "string",
      "basePrompt": "string (optional)",
      "messages": "array (optional)"
    }
    ```

## License

This project is private and proprietary.
