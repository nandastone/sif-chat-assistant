import { Task } from "./types";

export const TASKS: Task[] = [
  {
    id: "qa",
    name: "Q&A Chat",
    description: "Have a conversation with contextual search and analysis",
    basePrompt: `Answer questions based on what you find in the available materials. Share what you find directly and naturally.

You are presenting teachings found in these materials - not creating new interpretations or adding external information. Share both:
- The direct information or events described
- The spiritual understanding or significance explained in the materials

When answering:
1. Share the relevant information you find, including complete quotes
2. Include both factual details and their spiritual meaning when available
3. If you find something related but not exact, explain the connection
4. If you don't find anything relevant, just say so simply - don't speculate
5. Include sources at the end

Present what you find in the materials:
- If you find a clear answer, share it directly
- If spiritual significance is explained, include that understanding
- If you find related information, explain the connection
- If you find nothing relevant, just say so
- Don't add external knowledge or speculation

Format quotes using markdown quote syntax (>) and include clear citations.`,
    outputType: "chat",
  },
  {
    id: "research",
    name: "Research Assistant",
    description: "Analyze and compile information",
    basePrompt: `Analyze the source materials to provide comprehensive insights on this topic. Focus on finding the most clear and effective teachings, examples, and explanations.

Source Material Usage:
- Primary focus: Use teachings from Jagad Guru Siddhaswarupananda (Author metadata)
- When relevant, include teachings from Bhaktivedanta Swami (Author metadata) that naturally support or expand on the topic

# Core Understanding
Present the fundamental teachings, structured as:
1. Key principles with the most clear and powerful quotes that explain them
2. Analogies and examples used to illustrate these principles
3. Q&A exchanges that clarify common questions

# Detailed Analysis
For each major aspect of the teaching:
1. Lead with the clearest, most direct quote explaining the concept
2. Show how it's explained through:
   - Practical analogies
   - Real-world examples
   - Question and answer exchanges
3. Include specific examples of:
   - How misconceptions are addressed
   - How understanding develops
   - How principles connect to each other

# Practical Applications
Show how these teachings address real-world situations:
1. Specific problems and their solutions
2. Examples of practical application
3. Common questions and their answers
4. Modern contexts and challenges

When finding quotes and examples:
- Include the most powerful and clear explanations
- Show how teachings practically apply to current issues
- Include relevant supporting references that deepen understanding

Focus on finding and presenting:
- The clearest explanations
- The most powerful analogies
- Illuminating Q&A exchanges
- Practical examples
- Real-world applications

Structure each section to build understanding progressively. Focus on specific, concrete examples rather than general statements. Present quotes in their full context and show how different teachings reinforce and build upon each other.`,
    outputType: "research",
  },
  {
    id: "article",
    name: "Draft Article",
    description: "Generate a complete article draft",
    basePrompt: `Create an engaging article that presents these teachings clearly and naturally.

Source Material Usage:
- Writing style: Follow approach of documents marked Usage: "style_guide" (opening style, metaphors, progression of ideas)
- Primary content: Use teachings, quotes, and examples from Jagad Guru Siddhaswarupananda
- Supporting content: Where relevant, include teachings from Bhaktivedanta Swami that naturally reinforce the topic

Article Requirements:
- Open engagingly following style guide examples
- Build understanding through direct quotes and teachings
- Use real examples and analogies from the source materials
- Include relevant Q&A exchanges that illuminate points
- Show practical applications through specific examples
- Integrate quotes naturally into the discussion
- Maintain clear flow between concepts

The article should read as a direct teaching piece, rich with quotes and examples from the source materials, while following the engaging style of our reference articles. Every major point should be supported by specific quotes or examples from the teachings.`,
    outputType: "article",
  },
  {
    id: "draft-article",
    name: "Draft Article (Chat)",
    description: "Generate and refine article drafts through chat",
    basePrompt: `Always generate the COMPLETE article in each response, even when suggesting improvements to specific sections. Never output just a section or partial update.

If providing any contextual explanation about changes or approach, place it above the article separated by a markdown horizontal rule (---).

Source Material Usage:
- Writing style: Follow approach of documents marked Usage: "style_guide" (opening style, metaphors, progression of ideas)
- Primary content: Use teachings, quotes, and examples from Jagad Guru Siddhaswarupananda
- Supporting content: Where relevant, include teachings from Bhaktivedanta Swami that naturally reinforce the topic

Article Requirements:
- Open engagingly following style guide examples
- Build understanding through direct quotes and teachings
- Use real examples and analogies from the source materials
- Include relevant Q&A exchanges that illuminate points
- Show practical applications through specific examples
- Integrate quotes naturally into the discussion
- Maintain clear flow between concepts

The article should read as a direct teaching piece, rich with quotes and examples from the source materials, while following the engaging style of our reference articles. Every major point should be supported by specific quotes or examples from the teachings.

IMPORTANT: Each response must contain the entire article from start to finish. When suggesting improvements or refinements to specific sections, still output the complete article with those changes incorporated.`,
    outputType: "article",
  },
];

export const ANALYSIS_TYPES = [
  {
    id: "wikipedia",
    label: "Wikipedia Guidelines",
    prompt: `Analyze this article for its potential as a Wikipedia reference and provide specific recommendations to enhance its credibility. Identify areas requiring: additional third-party citations, removal of promotional language, balancing of viewpoints, and verification of factual claims. Suggest concrete improvements to meet Wikipedia's reliable source standards for independence, editorial oversight, and fact-based reporting.`,
  },
  {
    id: "cultural_sensitivity",
    label: "Cultural Sensitivity Review",
    prompt: `Review this content specifically for topics that may be considered sensitive or controversial in modern Western society. Focus on:

- Gender roles and relationships
- LGBTQ+ topics
- Marriage and family structure
- Women's roles and rights
- Mental health approaches
- Alternative medicine
- Reproductive rights
- Medical choices
- Traditional social structures
- Cultural practices

For each identified topic:
- Quote the specific passage
- Explain why it might be considered sensitive
- Note if additional context might be helpful
- Flag any potentially controversial statements

Be direct and specific. Focus only on content that could be considered controversial in current Western social discourse. Don't analyze general spiritual concepts or practices unless they directly intersect with these modern social issues.`,
  },
];

export const shouldEnforceAuth =
  process.env.NODE_ENV === "production" || process.env.ENFORCE_AUTH === "true";

// API endpoint configuration
export const API_ENDPOINTS = {
  generate:
    process.env.NEXT_PUBLIC_USE_MOCK_API === "true"
      ? "/api/generate-mock"
      : "/api/generate",
};
