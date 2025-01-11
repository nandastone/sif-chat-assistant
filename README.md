# Research Assistant

A Next.js application that provides a streamlined interface for AI-powered research and content generation using Pinecone's AI capabilities.

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **AI Integration**: Pinecone
- **Authentication**: Custom auth implementation

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
   ```

4. Configure authentication:

   - Generate a secure secret key for API authentication
   - Add the secret key to your environment variables:

   ```
   AUTH_SECRET_KEY=your_secure_secret
   ```

   - Include this secret in the Authorization header for all API requests:

   ```
   Authorization: Bearer your_secure_secret
   ```

5. Run the development server:

   ```bash
   npm run dev
   # or
   bun dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run linting

## API Endpoints

- `POST /api/generate` - Generate research assistance responses
- `GET /api/auth-test` - Test authentication status

## License

This project is private and proprietary.
