import { Task } from "./types";

export const TASKS: Task[] = [
  {
    id: "research",
    name: "Research Assistant",
    description: "Analyze and compile information from source documents",
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
    name: "Article Generator",
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
];
