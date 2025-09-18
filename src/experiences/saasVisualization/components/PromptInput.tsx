import React, { useState } from "react";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import { CreateVisualizationRequested } from "../state/SaaSVisualizationEvent";
import { SaaSDataLoaded } from "../state/SaaSVisualizationState";

interface PromptInputProps {
  onCreateVisualization?: (prompt: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({
  onCreateVisualization,
}) => {
  const { saasDataState, emitEvent } = useSaaSVisualization();
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!prompt.trim() || !(saasDataState instanceof SaaSDataLoaded)) {
      return;
    }

    setIsLoading(true);

    try {
      emitEvent(new CreateVisualizationRequested(prompt.trim()));
      onCreateVisualization?.(prompt.trim());
      // Keep the prompt text in the input box instead of clearing it
    } catch (error) {
      console.error("Failed to create visualization:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || !(saasDataState instanceof SaaSDataLoaded);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">Create Visualization</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="prompt"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Describe your visualization
            <span className="text-xs text-gray-500 ml-2">(text will be preserved after creation)</span>
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Create a pie chart showing the distribution of SaaS companies by industry"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            rows={4}
            disabled={isDisabled}
          />
        </div>

        <button
          type="submit"
          disabled={isDisabled || !prompt.trim()}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            isDisabled || !prompt.trim()
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Creating...
            </span>
          ) : (
            "Create Visualization"
          )}
          {!isLoading && prompt.trim() && (
            <span className="text-xs text-gray-500 mt-1 block">
              Your prompt will remain in the input box for easy editing
            </span>
          )}
        </button>
      </form>

      {!(saasDataState instanceof SaaSDataLoaded) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
          <p className="text-sm text-yellow-800">
            Loading SaaS data... Please wait before creating visualizations.
          </p>
        </div>
      )}
    </div>
  );
};
