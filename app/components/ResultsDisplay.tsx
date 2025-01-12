import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ApiResponse } from "../utils/types";
import ReactMarkdown from "react-markdown";
import CitationsList, { processContentWithCitations } from "./Citations";

interface ResultsDisplayProps {
  results: ApiResponse;
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const handleCopyResults = () => {
    navigator.clipboard.writeText(results.content);
  };

  const processedContent = processContentWithCitations(
    results.content,
    results.citations
  );

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

      <CitationsList citations={results.citations} />
    </div>
  );
}
