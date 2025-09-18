import React from "react";
import {
  BarChartData,
  PieChartData,
  ScatterPlotData,
  TableData,
} from "../../../clients/types";
import { useSaaSVisualization } from "../SaaSVisualizationContext";
import {
  VisualizationCreated,
  VisualizationCreating,
  VisualizationIdle,
  VisualizationUpdated,
  VisualizationUpdating,
} from "../state/SaaSVisualizationState";
import { BarChart } from "./charts/BarChart";
import { PieChart } from "./charts/PieChart";
import { ScatterPlot } from "./charts/ScatterPlot";
import { Table } from "./charts/Table";

export const VisualizationDisplay: React.FC = () => {
  const { visualizationState } = useSaaSVisualization();

  if (visualizationState instanceof VisualizationIdle) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-gray-400">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No Visualization Yet
          </h3>
          <p className="text-gray-500">
            Enter a prompt above to create your first visualization
          </p>
        </div>
      </div>
    );
  }

  if (
    visualizationState instanceof VisualizationCreating ||
    visualizationState instanceof VisualizationUpdating
  ) {
    return (
      <div className="bg-white rounded-lg shadow p-8">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 mx-auto mb-4 text-blue-600">
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
          <p className="text-gray-600">
            {visualizationState instanceof VisualizationCreating
              ? "Creating visualization..."
              : "Updating visualization..."}
          </p>
        </div>
      </div>
    );
  }

  if (
    visualizationState instanceof VisualizationCreated ||
    visualizationState instanceof VisualizationUpdated
  ) {
    const visualization = visualizationState.visualization;

    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            {visualization.title}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Created: {new Date(visualization.createdAt).toLocaleString()}
          </p>
        </div>

        <div className="h-96">
          {visualization.type === "pie" && (
            <PieChart
              data={visualization.data as PieChartData}
              config={visualization.config}
            />
          )}
          {visualization.type === "scatter" && (
            <ScatterPlot
              data={visualization.data as ScatterPlotData}
              config={visualization.config}
            />
          )}
          {visualization.type === "bar" && (
            <BarChart
              data={visualization.data as BarChartData}
              config={visualization.config}
            />
          )}
          {visualization.type === "table" && (
            <Table
              data={visualization.data as TableData}
              config={visualization.config}
            />
          )}
          {visualization.type === "line" && (
            <BarChart
              data={visualization.data as BarChartData}
              config={visualization.config}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
};
