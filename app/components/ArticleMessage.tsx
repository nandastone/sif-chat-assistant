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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

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
  analysisType?: string;
}

export interface AnalysisType {
  id: string;
  label: string;
  prompt: string;
}

export const ANALYSIS_TYPES: AnalysisType[] = [
  {
    id: "clarity",
    label: "Check Clarity & Structure",
    prompt:
      "Analyze this article for clarity, structure, and flow. Suggest specific improvements to make the content more clear and engaging.",
  },
  {
    id: "wikipedia",
    label: "Wikipedia Guidelines",
    prompt:
      "Analyze this article against Wikipedia's editorial guidelines. Check for neutral tone, proper citations, and areas that need more authoritative sources.",
  },
  {
    id: "completeness",
    label: "Check Completeness",
    prompt:
      "Analyze if this article covers all key aspects of the topic. Identify any missing important points or areas that need more depth.",
  },
];

interface ArticleMessageProps {
  draft: {
    preview: string;
    content: string;
    timestamp: Date;
    citations: Citation[];
    isLatest?: boolean;
  };
  onAnalyze?: (analysisPrompt: string) => void;
  isExpanded?: boolean;
  onToggleExpand?: (expanded: boolean) => void;
}

interface AnalysisMessageProps {
  analysis: Analysis;
  onApply: () => void;
}

export function ArticleMessage({
  draft,
  onAnalyze,
  isExpanded,
  onToggleExpand,
}: ArticleMessageProps) {
  const [localExpanded, setLocalExpanded] = useState(isExpanded);

  useEffect(() => {
    setLocalExpanded(isExpanded);
  }, [isExpanded]);

  const handleToggle = () => {
    const newExpanded = !localExpanded;
    setLocalExpanded(newExpanded);
    onToggleExpand?.(newExpanded);
  };

  return (
    <div className="draft-item space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand?.(!isExpanded)}
          >
            <ChevronRightIcon
              className={cn("h-4 w-4 transition-transform", {
                "rotate-90": isExpanded,
              })}
            />
            <span className="ml-2">Draft</span>
          </Button>
          {onAnalyze && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  Analyze
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {ANALYSIS_TYPES.map((type) => (
                  <DropdownMenuItem
                    key={type.id}
                    onClick={() => onAnalyze?.(type.prompt)}
                  >
                    {type.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        <span className="text-sm text-gray-500">
          {draft.timestamp.toLocaleString()}
        </span>
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
          {analysis.analysisType || "Analysis"} •{" "}
          {analysis.timestamp.toLocaleString()}
        </span>
        <Button variant="outline" size="sm" onClick={onApply}>
          Apply Changes
        </Button>
      </div>
      <div className="space-y-2">
        {analysis.suggestions.map((suggestion, index) => (
          <div key={index} className="flex items-start space-x-2">
            <ExclamationTriangleIcon className="w-4 h-4 text-yellow-500 mt-1" />
            <p className="text-sm text-gray-700 whitespace-pre-wrap">
              {suggestion}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
