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
- **Authentication**: Auth0
- **Form Handling**: React Hook Form + Zod
- **Date Handling**: date-fns
- **Markdown Support**: react-markdown
- **Theme**: next-themes

## Authentication

This application uses Auth0 for authentication and access control:

- **Login**: Users authenticate through Auth0's hosted login page
- **Membership Validation**: Access is controlled via Auth0 app metadata memberships
- **Global Protection**: All routes and API endpoints are protected by middleware
- **Session Management**: Auth0 handles session persistence and token refresh

Users must have the appropriate membership in their Auth0 profile to access the application.

## Prerequisites

- Node.js 18+ or Bun runtime
- Pinecone API key
- Auth0 application configured
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
   AUTH0_SECRET=your_auth0_secret
   AUTH0_BASE_URL=http://localhost:3000
   AUTH0_ISSUER_BASE_URL=https://your-domain.auth0.com
   AUTH0_CLIENT_ID=your_auth0_client_id
   AUTH0_CLIENT_SECRET=your_auth0_client_secret
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
  - Requires authentication via Auth0 session
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
