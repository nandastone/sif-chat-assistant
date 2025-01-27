import { MOCK_RESPONSES } from "./mock-data";

export const runtime = "edge";

export async function POST(req: Request) {
  const { prompt, task } = await req.json();

  // Get mock response based on task
  let mockResponse;
  if (task === "analyze") {
    mockResponse = MOCK_RESPONSES.find((r) => r.type === "analysis");
  } else if (prompt?.toLowerCase().includes("apply")) {
    mockResponse = MOCK_RESPONSES.find((r) => r.type === "improved_draft");
  } else {
    mockResponse = MOCK_RESPONSES.find((r) => r.type === "draft");
  }

  if (!mockResponse) {
    return new Response("No mock response found for task", { status: 404 });
  }

  // Create a stream of text chunks
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      // Initial delay to simulate processing
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Split content into lines first to preserve structure
      const lines = mockResponse.content.split("\n");

      for (const line of lines) {
        // For each line, chunk into smaller pieces if needed
        if (line.length <= 30) {
          // Send short lines as single chunks
          const data = {
            type: "content_chunk",
            delta: {
              content: line + "\n",
            },
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
          await new Promise((resolve) => setTimeout(resolve, 50));
        } else {
          // Split longer lines into chunks
          const chunks = line.match(/.{1,30}/g) || [];
          for (const chunk of chunks) {
            const data = {
              type: "content_chunk",
              delta: {
                content: chunk,
              },
            };
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
            );
            await new Promise((resolve) => setTimeout(resolve, 50));
          }
          // Add line break after long line
          const newline = {
            type: "content_chunk",
            delta: {
              content: "\n",
            },
          };
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(newline)}\n\n`)
          );
        }
      }

      // Send end message
      controller.enqueue(encoder.encode(`data: {"type": "message_end"}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
