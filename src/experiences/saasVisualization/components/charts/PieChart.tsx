import React from "react";
import { PieChartData, VisualizationConfig } from "../../../../clients/types";

interface PieChartProps {
  data: PieChartData;
  config: VisualizationConfig;
}

export const PieChart: React.FC<PieChartProps> = ({ data }) => {
  // Handle undefined or malformed data
  if (
    !data ||
    !data.labels ||
    !data.values ||
    !Array.isArray(data.labels) ||
    !Array.isArray(data.values)
  ) {
    return (
      <div className="pie-chart">
        <div className="flex flex-row items-start justify-center gap-6 h-full min-h-0">
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="text-center text-gray-500">
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs mt-1">Unable to display pie chart</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
      <div className="flex flex-row items-start justify-center gap-6 h-full min-h-0">
        {/* SVG Pie Chart */}
        <div className="flex items-center justify-center flex-shrink-0">
          <svg
            width="220"
            height="220"
            viewBox="0 0 200 200"
            className="drop-shadow-sm"
          >
            {pieSlices.map((slice, index) => (
              <g key={index}>
                <path
                  d={slice.pathData}
                  fill={slice.color}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
                <title>{`${slice.label}: ${slice.value} (${slice.percentage}%)`}</title>
              </g>
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

        {/* Data Summary */}
        <div className="flex-1 min-w-0 max-w-xs overflow-hidden">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Chart Data</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {pieSlices.map((slice, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div
                    className="w-3 h-3 rounded mr-2 flex-shrink-0"
                    style={{ backgroundColor: slice.color }}
                  />
                  <span className="text-sm text-gray-700 truncate">
                    {slice.label}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
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
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total:</span>
              <span className="font-medium text-gray-900">{total}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
