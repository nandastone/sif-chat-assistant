interface MockResponse {
  type: "draft" | "analysis" | "improved_draft";
  content: string;
  citations?: Array<{
    text: string;
    url: string;
  }>;
}

export const MOCK_RESPONSES: MockResponse[] = [
  {
    type: "draft",
    content: `# The Impact of Artificial Intelligence on Modern Society

Artificial Intelligence (AI) has become an integral part of our daily lives, transforming how we work, communicate, and solve problems. This article explores the key impacts of AI on modern society.

## Economic Impact

AI technologies are reshaping industries and creating new economic opportunities. From automated manufacturing to intelligent financial systems, AI is driving productivity and innovation across sectors.

## Social Implications

The integration of AI into society raises important questions about privacy, ethics, and human interaction. As AI systems become more sophisticated, we must carefully consider their social impact.`,
  },
  {
    type: "analysis",
    content: `Here's my analysis of the article:

1. Structure and Organization
- Good overall structure with clear sections
- Could benefit from more specific examples
- Consider adding a conclusion section

2. Content Depth
- Economic impact section needs more detailed statistics
- Social implications could explore specific case studies
- Add references to support key claims

3. Recommendations
- Include recent AI developments and their impacts
- Add discussion of regulatory frameworks
- Expand on future implications`,
  },
  {
    type: "improved_draft",
    content: `# The Impact of Artificial Intelligence on Modern Society

Artificial Intelligence (AI) has become an integral part of our daily lives, transforming how we work, communicate, and solve problems. This article explores the key impacts of AI on modern society, backed by recent developments and concrete examples.

## Economic Impact

AI technologies are reshaping industries and creating new economic opportunities. From automated manufacturing to intelligent financial systems, AI is driving productivity and innovation across sectors. Recent statistics show that AI implementation has increased productivity by 40% in manufacturing and reduced operational costs by 30% in the financial sector.

## Social Implications

The integration of AI into society raises important questions about privacy, ethics, and human interaction. For example, facial recognition systems in public spaces have sparked debates about surveillance and consent. The healthcare sector demonstrates both benefits and challenges - while AI can diagnose diseases with high accuracy, questions arise about data privacy and algorithmic bias.

## Regulatory Framework

As AI systems become more sophisticated, governments worldwide are developing comprehensive frameworks to ensure responsible AI deployment. The EU's AI Act and similar regulations aim to balance innovation with ethical considerations and public safety.

## Future Outlook

Looking ahead, AI will continue to evolve with emerging technologies like quantum computing and advanced neural networks. The key challenge will be maintaining human oversight while maximizing AI's potential for societal benefit.`,
  },
];
