import { NextResponse } from "next/server";
import type { ChatMessage } from "../../utils/types";
import { checkAssistantPrerequisites } from "../../utils/assistant-utils";
import { getAuth0SessionAndVerifyMembership } from "../../utils/auth-utils";
import { shouldEnforceAuth } from "../../utils/config";
import * as Sentry from "@sentry/nextjs";

// https://vercel.com/docs/functions/configuring-functions/duration#node.js-next.js-%3E=-13.5-or-higher-sveltekit-astro-nuxt-and-remix
export const maxDuration = 60;

const reportError = (error: unknown, context?: Record<string, unknown>) => {
  console.error("Error generating response:", error);
  Sentry.captureException(error, { extra: context });
};

export async function POST(request: Request) {
  try {
    if (shouldEnforceAuth) {
      const authResult = await getAuth0SessionAndVerifyMembership();
      if (!authResult) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const { task, prompt, basePrompt, messages, includeSpiritSoulDraft } =
      await request.json();
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

    const spiritSoulDraftInstructions = includeSpiritSoulDraft
      ? `\n\nInclude information from the "Spirit Soul: 5 Secrets to Finding Real Peace, Happiness, and Purpose" document in your response.`
      : `\n\n❌ NEVER include information from the "Spirit Soul: 5 Secrets to Finding Real Peace, Happiness, and Purpose" document.`;

    let chatMessages: ChatMessage[];

    if (messages) {
      // If first message is from assistant, just append formatting and spirit soul draft instructions.
      if (messages[0]?.role === "assistant") {
        chatMessages = [
          {
            role: "assistant",
            content: `${messages[0].content}\n\n${spiritSoulDraftInstructions}`,
          },
          ...messages.slice(1),
        ];
      } else {
        chatMessages = messages;
      }
    } else {
      // Build single message from prompt, always including base prompt.
      const sections = [
        `[Base Prompt]\n${basePrompt}`,
        `[Further Instructions]\n${spiritSoulDraftInstructions}`,
        `[User Query]\n${prompt}`,
      ];
      chatMessages = [
        {
          role: "user",
          content: sections.join("\n\n"),
        },
      ];
    }

    console.debug("Chat messages", chatMessages);

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

    // Return the stream directly
    return new Response(pineconeResponse.body, {
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
