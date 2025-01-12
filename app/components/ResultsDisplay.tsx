import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckIcon, CopyIcon } from "@radix-ui/react-icons";
import ReactMarkdown from "react-markdown";
import { processContentWithCitations } from "./Citations";
import CitationsList from "./CitationsList";
import { ApiResponse } from "../utils/types";

interface ResultsDisplayProps {
  results: ApiResponse;
  isLoading?: boolean;
}

export default function ResultsDisplay({
  results,
  isLoading,
}: ResultsDisplayProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyResults = async () => {
    await navigator.clipboard.writeText(results.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!results.content) return null;

  // Process content to add citation links if there are citations
  const processedContent =
    results.citations?.length > 0
      ? processContentWithCitations(results.content, results.citations)
      : results.content;

  return (
    <div className="mt-8">
      <div className="bg-white dark:bg-gray-800 p-4 rounded shadow prose dark:prose-invert max-w-none mb-4 prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg">
        <ReactMarkdown>{processedContent}</ReactMarkdown>
      </div>

      {results.citations && results.citations.length > 0 && (
        <div className="mb-4">
          <CitationsList citations={results.citations} />
        </div>
      )}

      <Button
        onClick={handleCopyResults}
        variant={copied ? "outline" : "default"}
        className="flex items-center space-x-2"
      >
        {copied ? (
          <>
            <CheckIcon className="h-4 w-4" />
            <span>Copied!</span>
          </>
        ) : (
          <>
            <CopyIcon className="h-4 w-4" />
            <span>Copy Results</span>
          </>
        )}
      </Button>
    </div>
  );
}
