import { Task } from "./types";

export const TASKS: Task[] = [
  {
    id: "qa",
    name: "Q&A Chat",
    description: "Have a conversation with contextual search and analysis",
    basePrompt: `Answer questions by finding and sharing relevant teachings from the source materials.

When responding:
1. Lead with the most relevant quote(s) that directly answer the question
2. Provide brief context if needed to understand the quote
3. Keep responses clear and focused on what was asked
4. Include proper citations

Source Material Usage:
- Primary: Use teachings from Jagad Guru Siddhaswarupananda
- Supporting: Include relevant teachings from Bhaktivedanta Swami when they directly support the point
- Citations: Reference source documents for all quotes

Keep responses direct and focused. If the question requires deeper exploration, wait for follow-up questions rather than providing extensive detail upfront.`,
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
    basePrompt: `Help refine and improve articles through chat. For each response:

1. If you have suggestions or comments about the requested changes, write them above a markdown divider (---)
2. ALWAYS include the complete article draft below the divider, incorporating any requested changes
3. Never output partial articles or sections - each draft must be the complete article
4. Each draft should stand on its own as a complete piece

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

For analysis and refinement:
- Evaluate clarity and engagement
- Check quote integration and flow
- Suggest specific improvements
- Consider audience understanding
- Ensure practical relevance`,
    outputType: "article",
  },
];

export const shouldEnforceAuth =
  process.env.NODE_ENV === "production" || process.env.ENFORCE_AUTH === "true";
