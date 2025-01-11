export interface Task {
  id: 'research' | 'article';
  name: string;
  description: string;
  basePrompt: string;
  outputType: 'research' | 'article';
}

export interface Citation {
  position: number;
  references: {
    pages: number[];
    file: {
      name: string;
      id: string;
    }
  }[];
}

export interface ApiResponse {
  content: string;
  citations: Citation[];
}

