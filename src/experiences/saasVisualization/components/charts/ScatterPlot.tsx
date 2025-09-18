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

  // Chart dimensions
  const width = 400;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scale functions
  const scaleX = (x: number) => {
    if (xMax === xMin) return innerWidth / 2;
    return ((x - xMin) / (xMax - xMin)) * innerWidth;
  };

  const scaleY = (y: number) => {
    if (yMax === yMin) return innerHeight / 2;
    return innerHeight - ((y - yMin) / (yMax - yMin)) * innerHeight;
  };

  return (
    <div className="scatter-plot">
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

            {/* Data points */}
            {points.map((point, index) => (
              <circle
                key={index}
                cx={scaleX(point.x)}
                cy={scaleY(point.y)}
                r="4"
                fill="#3B82F6"
                stroke="#1e40af"
                strokeWidth="1"
                className="hover:r-6 transition-all cursor-pointer"
                opacity="0.8"
              />
            ))}

            {/* Axes */}
            <line
              x1="0"
              y1={innerHeight}
              x2={innerWidth}
              y2={innerHeight}
              stroke="#6b7280"
              strokeWidth="1"
            />
            <line
              x1="0"
              y1="0"
              x2="0"
              y2={innerHeight}
              stroke="#6b7280"
              strokeWidth="1"
            />

            {/* Axis labels */}
            <text
              x={innerWidth / 2}
              y={innerHeight + 30}
              textAnchor="middle"
              className="text-sm fill-gray-600"
            >
              X Axis
            </text>
            <text
              x={-30}
              y={innerHeight / 2}
              textAnchor="middle"
              transform={`rotate(-90, -30, ${innerHeight / 2})`}
              className="text-sm fill-gray-600"
            >
              Y Axis
            </text>

            {/* Axis ticks and values */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const x = ratio * innerWidth;
              const y = innerHeight;
              const xValue = xMin + ratio * (xMax - xMin);
              return (
                <g key={`x-${ratio}`}>
                  <line
                    x1={x}
                    y1={y - 5}
                    x2={x}
                    y2={y + 5}
                    stroke="#6b7280"
                    strokeWidth="1"
                  />
                  <text
                    x={x}
                    y={y + 20}
                    textAnchor="middle"
                    className="text-xs fill-gray-500"
                  >
                    {xValue.toFixed(1)}
                  </text>
                </g>
              );
            })}

            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = innerHeight - ratio * innerHeight;
              const yValue = yMin + ratio * (yMax - yMin);
              return (
                <g key={`y-${ratio}`}>
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
                    {yValue.toFixed(1)}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
    </div>
  );
};
