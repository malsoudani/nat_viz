import React from "react";
import { BarChartData, VisualizationConfig } from "../../../../clients/types";

interface BarChartProps {
  data: BarChartData;
  config: VisualizationConfig;
}

export const BarChart: React.FC<BarChartProps> = ({ data }) => {
  const { labels, datasets } = data;

  // Calculate dimensions
  const width = 500;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 60, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Find max value for scaling
  const allValues = datasets.flatMap((dataset) => dataset.data);
  const maxValue = Math.max(...allValues);
  const minValue = Math.min(...allValues);

  // Scale function
  const scaleY = (value: number) => {
    if (maxValue === minValue) return innerHeight / 2;
    return (
      innerHeight - ((value - minValue) / (maxValue - minValue)) * innerHeight
    );
  };

  // Bar width calculation
  const barGroupWidth = innerWidth / labels.length;
  const barWidth = barGroupWidth / datasets.length;
  const barColors = ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6"];

  return (
    <div className="bar-chart">
      <div className="h-full flex items-center justify-center">
        <svg
          width={width}
          height={height}
          className="border border-gray-200 rounded-lg bg-white"
        >
          {/* Background */}
          <rect width={width} height={height} fill="#f9fafb" />

          {/* Plot area */}
          <g transform={`translate(${margin.left},${margin.top})`}>
            {/* Grid lines */}
            <defs>
              <pattern
                id="grid"
                width="20"
                height="20"
                patternUnits="userSpaceOnUse"
              >
                <path
                  d="M 20 0 L 0 0 0 20"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="0.5"
                />
              </pattern>
            </defs>
            <rect width={innerWidth} height={innerHeight} fill="url(#grid)" />

            {/* Bars */}
            {labels.map((_, labelIndex) => (
              <g key={labelIndex}>
                {datasets.map((dataset, datasetIndex) => {
                  const value = dataset.data[labelIndex];
                  const barHeight = innerHeight - scaleY(value);
                  const x =
                    labelIndex * barGroupWidth + datasetIndex * barWidth;
                  const y = scaleY(value);

                  return (
                    <rect
                      key={`${labelIndex}-${datasetIndex}`}
                      x={x}
                      y={y}
                      width={barWidth - 2}
                      height={barHeight}
                      fill={barColors[datasetIndex % barColors.length]}
                      stroke="#1e40af"
                      strokeWidth="0.5"
                      className="hover:opacity-80 transition-opacity cursor-pointer"
                      opacity="0.8"
                    />
                  );
                })}
              </g>
            ))}

            {/* X-axis */}
            <line
              x1="0"
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke="#6b7280"
              strokeWidth="1"
            />

            {/* Y-axis */}
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={innerHeight}
              stroke="#6b7280"
              strokeWidth="1"
            />

            {/* X-axis labels */}
            {labels.map((label, index) => (
              <text
                key={index}
                x={index * barGroupWidth + barGroupWidth / 2}
                y={innerHeight + 20}
                textAnchor="middle"
                className="text-xs fill-gray-600"
                transform={`rotate(-45, ${
                  index * barGroupWidth + barGroupWidth / 2
                }, ${innerHeight + 20})`}
              >
                {label.length > 10 ? `${label.substring(0, 10)}...` : label}
              </text>
            ))}

            {/* Y-axis labels */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const value = minValue + ratio * (maxValue - minValue);
              const y = innerHeight - ratio * innerHeight;
              return (
                <g key={ratio}>
                  <line
                    x1="-5"
                    y1={y}
                    x2="5"
                    y2={y}
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                  <text
                    x={-15}
                    y={y + 4}
                    textAnchor="end"
                    className="text-xs fill-gray-500"
                  >
                    {value.toFixed(0)}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g transform={`translate(${innerWidth - 100}, 10)`}>
              {datasets.map((dataset, index) => (
                <g key={index} transform={`translate(0, ${index * 20})`}>
                  <rect
                    x="0"
                    y="0"
                    width="12"
                    height="12"
                    fill={barColors[index % barColors.length]}
                    opacity="0.8"
                  />
                  <text x="18" y="10" className="text-xs fill-gray-600">
                    {dataset.label}
                  </text>
                </g>
              ))}
            </g>
          </g>
        </svg>
      </div>
    </div>
  );
};
