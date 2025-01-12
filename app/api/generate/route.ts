import { NextResponse } from "next/server";
import type { ChatMessage } from "../../utils/types";
import { checkAssistantPrerequisites } from "../../utils/assistant-utils";
import { verifyAuth } from "../../utils/auth-utils";
import * as Sentry from "@sentry/nextjs";

// https://vercel.com/docs/functions/configuring-functions/duration#node.js-next.js-%3E=-13.5-or-higher-sveltekit-astro-nuxt-and-remix
export const maxDuration = 60;

const reportError = (error: unknown, context?: Record<string, unknown>) => {
  console.error("Error generating response:", error);
  Sentry.captureException(error, { extra: context });
};

interface MessageOptions {
  level?: Sentry.SeverityLevel;
  tags?: Record<string, string | number | boolean>;
}

const reportMessage = (message: string, options?: MessageOptions) => {
  console.warn(message, options?.tags);
  Sentry.captureMessage(message, {
    level: options?.level,
    tags: options?.tags,
  });
};

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!verifyAuth(authHeader)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { task, prompt, basePrompt, messages } = await request.json();
    const { apiKey, assistantName } = await checkAssistantPrerequisites();

    if (!apiKey || !assistantName) {
      return NextResponse.json(
        { error: "PINECONE_API_KEY and PINECONE_ASSISTANT_NAME are required." },
        { status: 400 }
      );
    }

    if (!task || (!prompt && !messages)) {
      return NextResponse.json(
        { error: "Task and either prompt or messages are required" },
        { status: 400 }
      );
    }

    let chatMessages: ChatMessage[];
    if (messages) {
      chatMessages = messages;
    } else {
      const formattingInstructions = `
Format your response in clear markdown with proper headings:
- Use # for main headings
- Use ## for subheadings
- Use ### for sub-subheadings
- Use proper markdown for lists, quotes, and emphasis
- Structure the content hierarchically with clear sections
`;
      const fullPrompt = basePrompt
        ? `[Base Prompt]\n${basePrompt}\n\n[Formatting]\n${formattingInstructions}\n\n[User Query]\n${prompt}`
        : `${formattingInstructions}\n\n${prompt}`;
      chatMessages = [{ role: "user", content: fullPrompt }];
    }

    const pineconeResponse = await fetch(
      `https://prod-1-data.ke.pinecone.io/assistant/chat/${assistantName}`,
      {
        method: "POST",
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: chatMessages,
          stream: true,
          model: "claude-3-5-sonnet",
        }),
      }
    );

    if (!pineconeResponse.ok) {
      const errorText = await pineconeResponse.text();
      throw new Error(
        `Pinecone API error: ${pineconeResponse.status} - ${errorText}`
      );
    }

    // Create a TransformStream to detect timeouts and incomplete responses
    const timeoutMs = maxDuration * 1000;
    let lastChunkTime = Date.now();
    let hasEndMessage = false;

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        lastChunkTime = Date.now();
        const text = new TextDecoder().decode(chunk);

        // Check if this is the end message
        if (text.includes('"type":"message_end"')) {
          hasEndMessage = true;
        }

        controller.enqueue(chunk);
      },
      flush() {
        const timeSinceLastChunk = Date.now() - lastChunkTime;
        if (timeSinceLastChunk >= timeoutMs || !hasEndMessage) {
          reportMessage(
            `Response timeout or incomplete after ${timeSinceLastChunk}ms`,
            {
              level: "error",
              tags: {
                task,
                timeout_ms: timeoutMs,
                time_since_last_chunk: timeSinceLastChunk,
                has_end_message: hasEndMessage,
              },
            }
          );
        }
      },
    });

    // Return the transformed stream
    return new Response(pineconeResponse.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    reportError(error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to generate response";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
