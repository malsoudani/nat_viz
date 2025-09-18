import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CheckCircle, Sparkles, Wand2 } from "lucide-react";
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
    <Card className="shadow-2xl border-0 bg-gradient-to-br from-white via-blue-50/30 to-indigo-50/30 backdrop-blur-sm">
      <CardHeader className="pb-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Create Visualization
            </CardTitle>
            <CardDescription className="text-gray-600 mt-1">
              Describe what you want to visualize in natural language
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label
                htmlFor="prompt"
                className="block text-sm font-semibold text-gray-900"
              >
                Your Prompt
              </label>
              <Badge
                variant="secondary"
                className="bg-blue-100 text-blue-800 hover:bg-blue-100"
              >
                <Sparkles className="w-3 h-3 mr-1" />
                AI-Powered
              </Badge>
            </div>

            <div className="relative">
              <textarea
                id="prompt"
                value={prompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setPrompt(e.target.value)
                }
                placeholder="e.g., Create a bubble chart showing company valuation vs employee count, colored by industry..."
                className="w-full min-h-[120px] px-4 py-3 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 bg-white/80 backdrop-blur-sm text-base leading-relaxed shadow-sm rounded-lg resize-none focus:outline-none"
                disabled={isDisabled}
              />

              {prompt.trim() && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 shadow-sm">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Ready
                  </Badge>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">{prompt.length} characters</span>
              <span className="text-gray-500 flex items-center">
                <Sparkles className="w-3 h-3 mr-1" />
                AI will generate interactive SVG
              </span>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isDisabled || !prompt.trim()}
            className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            {isLoading ? (
              <div className="flex items-center justify-center space-x-3">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Visualization...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-3">
                <Wand2 className="w-5 h-5" />
                <span>Create Visualization</span>
              </div>
            )}
          </Button>

          {!isLoading && prompt.trim() && (
            <p className="text-xs text-gray-500 text-center">
              Your prompt will remain in the input box for easy editing
            </p>
          )}
        </form>

        {/* Status Messages */}
        {!(saasDataState instanceof SaaSDataLoaded) && (
          <div className="p-4 bg-gradient-to-r from-amber-50 to-yellow-50 border border-amber-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-amber-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-amber-800">
                  Loading SaaS Data...
                </p>
                <p className="text-xs text-amber-600 mt-1">
                  Please wait while we prepare the dataset
                </p>
              </div>
            </div>
          </div>
        )}

        {prompt.trim() && saasDataState instanceof SaaSDataLoaded && (
          <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-green-800">
                  Ready to Create!
                </p>
                <p className="text-xs text-green-600 mt-1">
                  Your prompt will remain in the input box for easy editing
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
