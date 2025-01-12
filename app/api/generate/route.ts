import { NextResponse } from "next/server";
import type { ApiResponse, ChatMessage } from "../../utils/types";
import { checkAssistantPrerequisites } from "../../utils/assistant-utils";
import { verifyAuth } from "../../utils/auth-utils";

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
        {
          error: "PINECONE_API_KEY and PINECONE_ASSISTANT_NAME are required.",
        },
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
      const fullPrompt = basePrompt
        ? `[Base Prompt]\n${basePrompt}\n\n[User Query]\n${prompt}`
        : prompt;
      chatMessages = [{ role: "user", content: fullPrompt }];
    }

    const chatResponse = await fetch(
      `https://prod-1-data.ke.pinecone.io/assistant/chat/${assistantName}`,
      {
        method: "POST",
        headers: {
          "Api-Key": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: chatMessages,
          stream: false,
          model: "claude-3-5-sonnet",
        }),
      }
    );

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(
        `Pinecone API error: ${chatResponse.status} - ${errorText}`
      );
    }

    const data = await chatResponse.json();

    // Format the response according to your API schema
    const apiResponse: ApiResponse = {
      content: data.message.content,
      citations:
        data.citations?.map((citation: any) => ({
          position: citation.position,
          references: citation.references.map((ref: any) => ({
            pages: ref.pages,
            file: {
              name: ref.file.name,
              id: ref.file.id,
              url: ref.file.signed_url,
            },
          })),
        })) || [],
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error generating response:", error);
    return NextResponse.json(
      { error: "Failed to generate response" },
      { status: 500 }
    );
  }
}
