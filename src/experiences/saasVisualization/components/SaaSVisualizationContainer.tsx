import React, { useEffect } from "react";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import {
  LoadSaaSDataRequested,
  LoadVisualizationsRequested,
} from "../state/SaaSVisualizationEvent";
import {
  SaaSDataLoaded,
  VisualizationsLoaded,
} from "../state/SaaSVisualizationState";
import { PromptInput } from "./PromptInput";
import { VisualizationDisplay } from "./VisualizationDisplay";
import { VisualizationsList } from "./VisualizationsList";

export const SaaSVisualizationContainer: React.FC = () => {
  const { saasDataState, visualizationsState, emitEvent } =
    useSaaSVisualization();

  // Load initial data on mount
  useEffect(() => {
    emitEvent(new LoadSaaSDataRequested());
    emitEvent(new LoadVisualizationsRequested());
  }, []); // Empty dependency array - run once on mount

  return (
    <div className="saas-visualization-container">
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            SaaS Data Visualization
          </h1>
          <p className="text-gray-600">
            Create interactive visualizations from SaaS company data using
            natural language prompts
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Panel - Input and Controls */}
          <div className="lg:col-span-1 space-y-6">
            <PromptInput />

            {/* Data Status */}
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="text-lg font-semibold mb-3">Data Status</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">SaaS Companies:</span>
                  <span
                    className={`text-sm font-medium ${
                      saasDataState instanceof SaaSDataLoaded
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {saasDataState instanceof SaaSDataLoaded
                      ? `${saasDataState.data.length} loaded`
                      : "Loading..."}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Visualizations:</span>
                  <span
                    className={`text-sm font-medium ${
                      visualizationsState instanceof VisualizationsLoaded
                        ? "text-green-600"
                        : "text-yellow-600"
                    }`}
                  >
                    {visualizationsState instanceof VisualizationsLoaded
                      ? `${visualizationsState.visualizations.length} created`
                      : "Loading..."}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel - Visualizations */}
          <div className="lg:col-span-2 space-y-6">
            <VisualizationDisplay />
            <VisualizationsList />
          </div>
        </div>
      </div>
    </div>
  );
};
