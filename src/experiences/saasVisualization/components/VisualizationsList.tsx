import React from "react";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import {
  DeleteVisualizationRequested,
  UpdateVisualizationRequested,
} from "../state/SaaSVisualizationEvent";
import { VisualizationsLoaded } from "../state/SaaSVisualizationState";

export const VisualizationsList: React.FC = () => {
  const { visualizationsState, emitEvent } = useSaaSVisualization();

  if (!(visualizationsState instanceof VisualizationsLoaded)) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Your Visualizations</h3>
        <div className="text-center py-8">
          <div className="animate-spin w-6 h-6 mx-auto mb-2 text-blue-600">
            <svg fill="none" viewBox="0 0 24 24">
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
          </div>
          <p className="text-sm text-gray-500">Loading visualizations...</p>
        </div>
      </div>
    );
  }

  const { visualizations } = visualizationsState;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-lg font-semibold mb-4">
        Your Visualizations ({visualizations.length})
      </h3>

      {visualizations.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg
              className="w-12 h-12 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <p className="text-gray-500">No visualizations created yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visualizations.map((visualization) => (
            <div
              key={visualization.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 mb-1">
                    {visualization.title}
                  </h4>
                  <p className="text-sm text-gray-500 mb-2">
                    Type: {visualization.type} • Created:{" "}
                    {new Date(visualization.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        visualization.type === "pie"
                          ? "bg-blue-100 text-blue-800"
                          : visualization.type === "scatter"
                          ? "bg-green-100 text-green-800"
                          : visualization.type === "bar"
                          ? "bg-purple-100 text-purple-800"
                          : visualization.type === "table"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {visualization.type}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
                  <button
                    onClick={() =>
                      emitEvent(
                        new UpdateVisualizationRequested(
                          visualization.id,
                          "Update this visualization"
                        )
                      )
                    }
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    Update
                  </button>
                  <button
                    onClick={() =>
                      emitEvent(
                        new DeleteVisualizationRequested(visualization.id)
                      )
                    }
                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
