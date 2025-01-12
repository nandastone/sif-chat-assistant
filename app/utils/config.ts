import { Task } from "./types";

export const TASKS: Task[] = [
  {
    id: "research",
    name: "Research Assistant",
    description: "Analyze and compile information from source documents",
    basePrompt: `Analyze the source materials to provide comprehensive insights on this topic. Focus on finding the most clear and effective teachings, examples, and explanations.

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
    basePrompt: `Research the source materials and create an engaging article that presents these teachings clearly and naturally.

Note: Documents marked as 'style_guide' in metadata should be used as references for structure and writing style only, not as sources for quotes or content.

# Article Structure
Follow the engaging style demonstrated in our example articles, which:
- Open with compelling insights that draw readers in
- Build understanding progressively
- Use clear transitions between concepts
- Integrate quotes naturally into the flow
- Connect principles to practical applications

# Content Development
Using the source materials (not style guides):
- Present fundamental principles clearly
- Support key points with direct quotes
- Include practical examples and applications
- Address common questions or misconceptions
- Show how different aspects connect
- Demonstrate real-world relevance

# Writing Style
Follow the engaging approach shown in our example articles:
- Clear, natural flow
- Accessible yet profound
- Direct and authoritative voice
- Balance depth with readability
- Effective use of analogies and examples

The article should read as a cohesive, engaging piece that naturally weaves together teachings, examples, and applications while maintaining authoritative presentation of the spiritual science.`,
    outputType: "article",
  },
];
