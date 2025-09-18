import React from "react";
import {
  ScatterPlotData,
  VisualizationConfig,
} from "../../../../clients/types";

interface ScatterPlotProps {
  data: ScatterPlotData;
  config: VisualizationConfig;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  const { points } = data;

  // Calculate bounds for scaling
  const xValues = points.map((p) => p.x);
  const yValues = points.map((p) => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  return (
    <div className="scatter-plot">
      <div className="h-full flex items-center justify-center">
        <div className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Scatter Plot
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {points.length} data points
            </p>
            <div className="text-xs text-gray-400">
              X: {xMin.toFixed(1)} - {xMax.toFixed(1)}
              <br />
              Y: {yMin.toFixed(1)} - {yMax.toFixed(1)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
