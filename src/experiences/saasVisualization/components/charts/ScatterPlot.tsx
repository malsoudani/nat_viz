import { ScatterChart } from "lucide-react";
import React from "react";
import {
  ScatterPlotData,
  VisualizationConfig,
} from "../../../../clients/types";

interface ScatterPoint {
  x: number;
  y: number;
  label: string;
  metadata?: Record<string, unknown>;
}

interface NestedScatterData {
  points: ScatterPoint[];
}

interface FlexibleScatterData {
  points?: ScatterPoint[];
  data?: ScatterPoint[] | NestedScatterData;
  [key: string]: unknown;
}

interface ScatterPlotProps {
  data: ScatterPlotData | FlexibleScatterData | ScatterPoint[];
  config: VisualizationConfig;
}

export const ScatterPlot: React.FC<ScatterPlotProps> = ({ data }) => {
  // Debug logging to see what data we're receiving
  console.log("ScatterPlot received data:", data);

  // Handle different possible data structures
  let points: ScatterPoint[] = [];

  if (Array.isArray(data)) {
    // Alternative structure: direct array
    points = data as ScatterPoint[];
  } else if (
    data &&
    typeof data === "object" &&
    "points" in data &&
    Array.isArray((data as ScatterPlotData).points)
  ) {
    // Standard structure: { points: [...] }
    points = (data as ScatterPlotData).points;
  } else if (data && typeof data === "object" && "data" in data) {
    const flexibleData = data as FlexibleScatterData;
    if (Array.isArray(flexibleData.data)) {
      // Nested structure: { data: [...] }
      points = flexibleData.data;
    } else if (
      flexibleData.data &&
      typeof flexibleData.data === "object" &&
      "points" in flexibleData.data &&
      Array.isArray((flexibleData.data as NestedScatterData).points)
    ) {
      // Nested structure: { data: { points: [...] } }
      points = (flexibleData.data as NestedScatterData).points;
    }
  }

  // Handle undefined or malformed data
  if (!points || points.length === 0) {
    console.log("ScatterPlot: No valid points found", {
      dataExists: !!data,
      pointsLength: points ? points.length : "undefined",
    });
    return (
      <div className="scatter-plot h-full flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
            <ScatterChart className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">
              No data available
            </p>
            <p className="text-base text-gray-500">
              Unable to display scatter plot
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Filter out invalid points and handle NaN values
  const validPoints = points.filter(
    (point) =>
      typeof point.x === "number" &&
      !isNaN(point.x) &&
      typeof point.y === "number" &&
      !isNaN(point.y) &&
      point.label
  );

  // If no valid points, show empty state
  if (validPoints.length === 0) {
    return (
      <div className="scatter-plot">
        <div className="flex flex-row items-start justify-center gap-6 h-full min-h-0">
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="w-96 h-72 border border-gray-200 rounded-lg bg-white flex items-center justify-center">
              <div className="text-center text-gray-500">
                <div className="text-lg font-medium mb-2">No Valid Data</div>
                <div className="text-sm">
                  Unable to display scatter plot with current data
                </div>
              </div>
            </div>
          </div>
          <div className="flex-1 max-w-xs">
            <h4 className="text-sm font-medium text-gray-900 mb-3">
              Data Points
            </h4>
            <div className="text-sm text-gray-500">
              No valid data points available
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate bounds for scaling using only valid points
  const xValues = validPoints.map((p) => p.x);
  const yValues = validPoints.map((p) => p.y);
  const xMin = Math.min(...xValues);
  const xMax = Math.max(...xValues);
  const yMin = Math.min(...yValues);
  const yMax = Math.max(...yValues);

  // Handle edge case where all values are the same
  const xRange = xMax - xMin;
  const yRange = yMax - yMin;
  const effectiveXMin = xRange === 0 ? xMin - 1 : xMin;
  const effectiveXMax = xRange === 0 ? xMax + 1 : xMax;
  const effectiveYMin = yRange === 0 ? yMin - 1 : yMin;
  const effectiveYMax = yRange === 0 ? yMax + 1 : yMax;

  // Chart dimensions
  const width = 400;
  const height = 300;
  const margin = { top: 20, right: 20, bottom: 40, left: 60 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Scale functions with additional safety checks
  const scaleX = (x: number) => {
    if (!isFinite(x)) return 0;
    if (effectiveXMax === effectiveXMin) return innerWidth / 2;
    const scaled =
      ((x - effectiveXMin) / (effectiveXMax - effectiveXMin)) * innerWidth;
    return isFinite(scaled) ? scaled : 0;
  };

  const scaleY = (y: number) => {
    if (!isFinite(y)) return innerHeight / 2;
    if (effectiveYMax === effectiveYMin) return innerHeight / 2;
    const scaled =
      innerHeight -
      ((y - effectiveYMin) / (effectiveYMax - effectiveYMin)) * innerHeight;
    return isFinite(scaled) ? scaled : innerHeight / 2;
  };

  return (
    <div className="scatter-plot">
      <div className="flex flex-row items-start justify-center gap-6 h-full min-h-0">
        {/* SVG Scatter Plot */}
        <div className="flex items-center justify-center flex-shrink-0">
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
              {validPoints.map((point, index) => (
                <g key={index}>
                  <circle
                    cx={scaleX(point.x)}
                    cy={scaleY(point.y)}
                    r="4"
                    fill="#3B82F6"
                    stroke="#1e40af"
                    strokeWidth="1"
                    className="hover:r-6 transition-all cursor-pointer"
                    opacity="0.8"
                  />
                  <title>{`${point.label}: (${point.x.toFixed(
                    2
                  )}, ${point.y.toFixed(2)})`}</title>
                </g>
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
                const xValue =
                  effectiveXMin + ratio * (effectiveXMax - effectiveXMin);
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
                      {isFinite(xValue) ? xValue.toFixed(1) : "N/A"}
                    </text>
                  </g>
                );
              })}

              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = innerHeight - ratio * innerHeight;
                const yValue =
                  effectiveYMin + ratio * (effectiveYMax - effectiveYMin);
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
                      {isFinite(yValue) ? yValue.toFixed(1) : "N/A"}
                    </text>
                  </g>
                );
              })}
            </g>
          </svg>
        </div>

        {/* Data Summary */}
        <div className="flex-1 max-w-xs">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Data Points ({validPoints.length})
          </h4>
          <div className="space-y-1 max-h-48 overflow-y-auto">
            {validPoints.map((point, index) => (
              <div
                key={index}
                className="flex items-center justify-between py-1 px-2 bg-gray-50 rounded text-sm"
              >
                <span className="text-gray-700 truncate max-w-24">
                  {point.label}
                </span>
                <span className="text-gray-900 font-mono text-xs">
                  ({point.x.toFixed(1)}, {point.y.toFixed(1)})
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-2 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Total points:{" "}
              <span className="font-medium text-gray-900">
                {validPoints.length}
              </span>
              {validPoints.length !== points.length && (
                <span className="text-red-500 ml-2">
                  ({points.length - validPoints.length} invalid filtered out)
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
