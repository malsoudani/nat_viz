import React from "react";
import { BarChartData, VisualizationConfig } from "../../../../clients/types";

interface BarChartProps {
  data: BarChartData;
  config: VisualizationConfig;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { labels, datasets } = data;

  return (
    <div className="bar-chart">
      <div className="h-full flex items-center justify-center">
        <div className="w-full h-full bg-gray-50 border border-gray-200 rounded-lg flex items-center justify-center">
          <div className="text-center">
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Bar Chart
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {labels.length} categories, {datasets.length} datasets
            </p>
            <div className="text-xs text-gray-400">
              {datasets.map((dataset, index) => (
                <div key={index}>
                  {dataset.label}: {dataset.data.length} values
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
