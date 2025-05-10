export interface Task {
  id: "research" | "article" | "qa" | "draft-article" | "course-outline";
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
  url: string;
}

export interface Message {
  type: "prompt" | "draft" | "analysis";
  content: string;
  timestamp: Date;
  citations?: Citation[];
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  timestamp: Date;
}

export interface ApiResponse {
  content?: string;
  citations?: Citation[];
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

export interface MessageItem {
  type: "prompt" | "draft" | "analysis";
  content: string;
  timestamp: Date;
  citations?: Citation[];
  isLatest?: boolean;
  analysisType?: string;
}

export interface ChatRequest {
  task: string;
  prompt?: string;
  basePrompt?: string;
  messages?: ChatMessage[];
  includeSpiritSoulDraft?: boolean;
}
