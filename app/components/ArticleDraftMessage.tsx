import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Citation } from "@/app/utils/types";
import { ChevronDownIcon, ChevronRightIcon } from "@radix-ui/react-icons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import CitationsList from "./CitationsList";
import { processContentWithCitations } from "../utils/citation-utils";

interface ArticleDraftMessageProps {
  content: string;
  timestamp: Date;
  citations?: Citation[];
  isLatest: boolean;
  isStreaming: boolean;
  onAnalyze: (prompt: string) => void;
  analysisTypes: Array<{ id: string; label: string; prompt: string }>;
  draftNumber: number;
}

export function ArticleDraftMessage({
  content,
  timestamp,
  citations = [],
  isLatest,
  isStreaming,
  onAnalyze,
  analysisTypes,
  draftNumber,
}: ArticleDraftMessageProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const processedContent =
    citations && citations.length > 0
      ? processContentWithCitations(content, citations)
      : content;

  return (
    <div className="bg-white border rounded-lg">
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-0 h-auto"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-4 w-4" />
            ) : (
              <ChevronRightIcon className="h-4 w-4" />
            )}
          </Button>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Draft #{draftNumber}</span>
            <span className="text-sm text-gray-400">•</span>
            <span className="text-sm text-gray-500">
              {timestamp.toLocaleString()}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              disabled={!isLatest || isStreaming || !content}
            >
              Analyze
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {analysisTypes.map((type) => (
              <DropdownMenuItem
                key={type.id}
                onClick={() => onAnalyze(type.prompt)}
              >
                {type.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {isExpanded && (
        <div className="p-4">
          <div className="prose max-w-none">
            <ReactMarkdown>{processedContent}</ReactMarkdown>
            {citations && citations.length > 0 && (
              <CitationsList
                citations={citations}
                className="mt-4 pt-4 border-t border-gray-200"
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
