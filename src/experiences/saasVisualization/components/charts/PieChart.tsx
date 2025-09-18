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

  // Calculate pie chart paths
  const radius = 80;
  const centerX = 100;
  const centerY = 100;

  let cumulativeAngle = 0;

  const pieSlices = values.map((value, index) => {
    const percentage = total > 0 ? value / total : 0;
    const angle = percentage * 2 * Math.PI;
    const startAngle = cumulativeAngle;
    const endAngle = cumulativeAngle + angle;

    // Calculate path for pie slice
    const x1 = centerX + radius * Math.cos(startAngle);
    const y1 = centerY + radius * Math.sin(startAngle);
    const x2 = centerX + radius * Math.cos(endAngle);
    const y2 = centerY + radius * Math.sin(endAngle);

    const largeArcFlag = angle > Math.PI ? 1 : 0;

    const pathData = [
      `M ${centerX} ${centerY}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      "Z",
    ].join(" ");

    cumulativeAngle = endAngle;

    return {
      pathData,
      color: chartColors[index % chartColors.length],
      percentage: (percentage * 100).toFixed(1),
      label: labels[index],
      value,
    };
  });

  return (
    <div className="pie-chart">
      <div className="flex flex-col lg:flex-row items-center justify-center h-full">
        {/* SVG Pie Chart */}
        <div className="flex-1 flex items-center justify-center mb-4 lg:mb-0 lg:mr-8">
          <svg
            width="220"
            height="220"
            viewBox="0 0 200 200"
            className="drop-shadow-sm"
          >
            {pieSlices.map((slice, index) => (
              <path
                key={index}
                d={slice.pathData}
                fill={slice.color}
                stroke="white"
                strokeWidth="2"
                className="hover:opacity-80 transition-opacity cursor-pointer"
              />
            ))}
            {/* Center circle for better visual */}
            <circle
              cx={centerX}
              cy={centerY}
              r="30"
              fill="white"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="flex-1 max-w-md">
          <div className="space-y-2">
            {pieSlices.map((slice, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center">
                  <div
                    className="w-4 h-4 rounded mr-3 flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-sm text-gray-700">{slice.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-sm font-medium text-gray-900">
                    {slice.value}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">
                    ({slice.percentage}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
