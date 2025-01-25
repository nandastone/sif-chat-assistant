export interface Task {
  id: "research" | "article" | "qa" | "draft-article";
  name: string;
  description: string;
  basePrompt: string;
  outputType: "research" | "article" | "chat";
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  citations?: Citation[];
  timestamp?: string;
}

export interface Citation {
  text: string;
  source: string;
  position?: number;
  references?: string[];
}

export interface ApiResponse {
  content: string;
  citations: Citation[];
}

export interface StreamChunk {
  type: "message_start" | "content_chunk" | "citation" | "message_end";
  id: string;
  model: string;
  delta?: {
    content: string;
  };
  citation?: Citation;
  finish_reason?: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}
