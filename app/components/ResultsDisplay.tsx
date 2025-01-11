import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ApiResponse, Citation } from "../utils/types"

interface ResultsDisplayProps {
  results: ApiResponse
}

export default function ResultsDisplay({ results }: ResultsDisplayProps) {
  const [selectedCitation, setSelectedCitation] = useState<Citation | null>(null)

  const handleCitationClick = (citation: Citation) => {
    setSelectedCitation(citation)
  }

  const handleCopyResults = () => {
    navigator.clipboard.writeText(results.content)
  }

  return (
    <div className="mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Results</h2>
        <Button onClick={handleCopyResults}>Copy Results</Button>
      </div>
      <div className="bg-white p-4 rounded shadow">
        {results.content.split('\n').map((paragraph, index) => (
          <p key={index} className="mb-2">{paragraph}</p>
        ))}
      </div>
      {results.citations.length > 0 && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Citations</h3>
          <ul className="list-disc pl-5">
            {results.citations.map((citation, index) => (
              <li key={index} className="mb-1">
                <button
                  onClick={() => handleCitationClick(citation)}
                  className="text-blue-500 hover:underline"
                >
                  Citation {citation.position}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {selectedCitation && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h4 className="font-semibold mb-2">Citation Details</h4>
          <p>Position: {selectedCitation.position}</p>
          <p>References:</p>
          <ul className="list-disc pl-5">
            {selectedCitation.references.map((ref, index) => (
              <li key={index}>
                File: {ref.file.name} (ID: {ref.file.id}), Pages: {ref.pages.join(', ')}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

