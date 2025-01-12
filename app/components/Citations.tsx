import { Citation } from "../utils/types";

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

interface CitationsListProps {
  citations: Citation[];
  className?: string;
}

export default function CitationsList({
  citations,
  className = "",
}: CitationsListProps) {
  if (!citations || citations.length === 0) return null;

  return (
    <div className={`mt-4 ${className}`}>
      <h3 className="text-lg font-semibold mb-2">Citations</h3>
      <ul className="list-disc pl-5">
        {citations.map((citation, index) => (
          <li key={index} id={`citation-${index + 1}`} className="mb-1">
            [{index + 1}]
            {citation.references.map((ref, refIndex) => (
              <span key={refIndex} className="text-sm text-gray-600 ml-2">
                -{" "}
                <a
                  href={ref.file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {ref.file.name}
                </a>
              </span>
            ))}
          </li>
        ))}
      </ul>
    </div>
  );
}
