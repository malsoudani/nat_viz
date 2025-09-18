import React from "react";
import { PieChartData, VisualizationConfig } from "../../../../clients/types";

interface PieChartProps {
  data: PieChartData;
  config: VisualizationConfig;
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  const { labels, values, colors } = data;
  const total = values.reduce((sum, value) => sum + value, 0);

  // Simple color palette if no colors provided
  const defaultColors = [
    "#3B82F6",
    "#EF4444",
    "#10B981",
    "#F59E0B",
    "#8B5CF6",
    "#06B6D4",
    "#84CC16",
    "#F97316",
    "#EC4899",
    "#6B7280",
  ];

  const chartColors = colors || defaultColors;

  return (
    <div className="pie-chart">
      <div className="flex flex-col lg:flex-row items-center justify-center h-full">
        {/* Chart visualization placeholder */}
        <div className="flex-1 flex items-center justify-center mb-4 lg:mb-0 lg:mr-8">
          <div className="w-64 h-64 bg-gray-100 rounded-full flex items-center justify-center">
            <span className="text-gray-500 text-sm">Pie Chart</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex-1 max-w-md">
          <div className="space-y-2">
            {labels.map((label, index) => {
              const percentage =
                total > 0 ? ((values[index] / total) * 100).toFixed(1) : "0";
              return (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div
                      className="w-4 h-4 rounded mr-3 flex-shrink-0"
                      style={{
                        backgroundColor:
                          chartColors[index % chartColors.length],
                      }}
                    />
                    <span className="text-sm text-gray-700">{label}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-900">
                      {values[index]}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
