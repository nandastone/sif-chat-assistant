import { Citation } from "./types";

export function processContentWithCitations(
  content: string,
  citations: Citation[]
) {
  // Create a map of positions to citation indices
  const positionMap = new Map();
  citations.forEach((citation, index) => {
    positionMap.set(citation.position, index + 1);
  });

  // Sort positions in ascending order
  const positions = Array.from(positionMap.keys()).sort((a, b) => a - b);

  // Build the content with citations, working backwards
  let processedContent = content;
  let offset = 0;
  positions.forEach((position) => {
    const index = positionMap.get(position);
    const citationMark = `[${index}]`;
    processedContent =
      processedContent.slice(0, position + offset) +
      citationMark +
      processedContent.slice(position + offset);
    offset += citationMark.length;
  });

  // Now replace all citation markers with clickable links
  positions.forEach((position) => {
    const index = positionMap.get(position);
    const citationMark = `[${index}]`;
    processedContent = processedContent.replace(
      citationMark,
      `[${citationMark}](#citation-${index})`
    );
  });

  return processedContent;
}
