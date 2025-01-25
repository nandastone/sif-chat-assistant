import { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import {
  ChevronDownIcon,
  ChevronRightIcon,
  UpdateIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import CitationsList from "./CitationsList";
import { processContentWithCitations } from "../utils/citation-utils";
import { Citation } from "../utils/types";

interface ArticleDraft {
  preview: string;
  content: string;
  timestamp: Date;
  isLatest: boolean;
  citations?: Citation[];
}

interface Analysis {
  suggestions: string[];
  timestamp: Date;
}

interface ArticleMessageProps {
  draft: ArticleDraft;
  onAnalyze?: () => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
  draftNumber?: number;
}

interface AnalysisMessageProps {
  analysis: Analysis;
  onApply: () => void;
}

export function ArticleMessage({
  draft,
  onAnalyze,
  isExpanded = false,
  onToggleExpand,
  draftNumber,
}: ArticleMessageProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  // Update local state when prop changes
  useEffect(() => {
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    onToggleExpand?.(newExpanded);
  };

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-2">
      <div className="flex items-start justify-between">
        <button
          onClick={handleToggle}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900"
        >
          {localExpanded ? (
            <ChevronDownIcon className="w-4 h-4" />
          ) : (
            <ChevronRightIcon className="w-4 h-4" />
          )}
          <span>
            Draft {draftNumber ? `${draftNumber} • ` : ""}
            {draft.timestamp.toLocaleString()}
          </span>
        </button>
        {draft.isLatest && onAnalyze && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAnalyze}
            className="ml-2"
          >
            Analyze
          </Button>
        )}
      </div>

      <div className={localExpanded ? "block" : "hidden"}>
        <div className="prose max-w-none">
          <ReactMarkdown>
            {draft.citations && draft.citations.length > 0
              ? processContentWithCitations(draft.content, draft.citations)
              : draft.content}
          </ReactMarkdown>
        </div>
        {draft.citations && draft.citations.length > 0 && (
          <CitationsList citations={draft.citations} />
        )}
      </div>

      {!localExpanded && (
        <div className="text-sm text-gray-600">{draft.preview}...</div>
      )}
    </div>
  );
}

export function AnalysisMessage({ analysis, onApply }: AnalysisMessageProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-600">
          Analysis {analysis.timestamp.toLocaleString()}
        </span>
        <Button variant="outline" size="sm" onClick={onApply}>
          Apply Changes
        </Button>
      </div>
      <div className="space-y-2">
        {analysis.suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-1" />
            <p className="text-sm text-gray-700">{suggestion}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
