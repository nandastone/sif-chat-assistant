import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiResponse, Citation } from "../utils/types";
import ReactMarkdown from "react-markdown";

interface ResultsDisplayProps {
  results: ApiResponse;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const handleCopyResults = () => {
    navigator.clipboard.writeText(results.content);
  };

  // Process content to insert and make citations clickable
  const processContent = () => {
    let content = results.content;

    // Create a map of positions to citation indices
    const positionMap = new Map();
    results.citations.forEach((citation, index) => {
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
  };

  const processedContent = processContent();

  return (
    <div className="mt-8">
      <div className="bg-white p-4 rounded shadow prose dark:prose-invert max-w-none mb-4">
        <ReactMarkdown>{processedContent}</ReactMarkdown>
      </div>

      <div className="mb-4">
        <Button onClick={handleCopyResults}>Copy Results</Button>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Note: AI responses can be inaccurate. Please double check all
          responses against the original sources.
        </p>
      </div>

      {results.citations.length > 0 ? (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Citations</h3>
          <ul className="list-disc pl-5">
            {results.citations.map((citation, index) => (
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
      ) : null}
    </div>
  );
}
