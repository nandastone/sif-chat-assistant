import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";

interface AnalysisMessageProps {
  content: string;
  timestamp: Date;
  isLatest: boolean;
  isStreaming: boolean;
  onApply: () => void;
  analysisType?: string;
}

export function AnalysisMessage({
  content,
  timestamp,
  isLatest,
  isStreaming,
  onApply,
  analysisType = "Analysis",
}: AnalysisMessageProps) {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg">
      <div className="flex items-center justify-between p-4 border-b border-yellow-200">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">{analysisType}</span>
            <span className="text-sm text-yellow-600/40">•</span>
            <span className="text-sm text-yellow-700/70">
              {timestamp.toLocaleString()}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onApply}
          disabled={!isLatest || isStreaming}
        >
          Apply Changes
        </Button>
      </div>
      <div className="p-4">
        <div className="prose max-w-none">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}
