import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiResponse, Citation } from "../utils/types";
import ReactMarkdown from "react-markdown";

interface ResultsDisplayProps {
  results: ApiResponse;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(
    null
  );

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation);
  };

  const handleCopyResults = () => {
    navigator.clipboard.writeText(results.content);
  };

  // Process content to insert and make citations clickable
  const processContent = () => {
    let content = results.content;
    // Sort citations by position in descending order to avoid position shifts
    const sortedCitations = [...results.citations].sort(
      (a, b) => b.position - a.position
    );

    // Insert citation markers at the specified positions
    sortedCitations.forEach((citation, index) => {
      const citationMark = `[${index + 1}]`;
      content =
        content.slice(0, citation.position) +
        citationMark +
        content.slice(citation.position);
    });

    // Replace citation markers with clickable links
    sortedCitations.forEach((citation, index) => {
      const citationMark = `[${index + 1}]`;
      content = content.replace(
        citationMark,
        `[${citationMark}](#citation-${index + 1})`
      );
    });

    return content;
  };

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Results</h2>
        <Button onClick={handleCopyResults}>Copy Results</Button>
      </div>
      <div className="bg-white p-4 rounded shadow prose dark:prose-invert max-w-none">
        <ReactMarkdown>{processContent()}</ReactMarkdown>
      </div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4 dark:bg-yellow-900/20">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          Note: AI responses can be inaccurate. Please double check all
          responses against the original sources.
        </p>
      </div>
      {results.citations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Citations</h3>
          <ul className="list-disc pl-5">
            {results.citations.map((citation, index) => (
              <li key={index} className="mb-1">
                <button
                  id={`citation-${index + 1}`}
                  onClick={() => handleCitationClick(citation)}
                  className="text-blue-500 hover:underline"
                >
                  Citation {index + 1}
                </button>
                {citation.references.map((ref, refIndex) => (
                  <span key={refIndex} className="text-sm text-gray-600 ml-2">
                    - {ref.file.name}
                  </span>
                ))}
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedCitation && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">Citation Details</h4>
          <p>References:</p>
          <ul className="list-disc pl-5">
            {selectedCitation.references.map((ref, index) => (
              <li key={index}>
                File: {ref.file.name} (ID: {ref.file.id})
                {ref.pages.length > 0 && `, Pages: ${ref.pages.join(", ")}`}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
