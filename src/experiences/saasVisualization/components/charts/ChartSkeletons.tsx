import React from "react";

interface ChartSkeletonProps {
  type: "pie" | "bar" | "scatter" | "table";
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ type }) => {
  const renderChartSkeleton = () => {
    switch (type) {
      case "pie":
        return (
          <div className="chart-skeleton">
            <svg width="220" height="220" viewBox="0 0 200 200">
              {/* Pie chart skeleton - animated circles */}
              <circle
                cx="100"
                cy="100"
                r="80"
                fill="none"
                stroke="#e5e7eb"
                strokeWidth="20"
                className="skeleton"
                opacity="0.3"
              />
              <circle
                cx="100"
                cy="100"
                r="30"
                fill="#f9fafb"
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            </svg>
          </div>
        );

      case "bar":
        return (
          <div className="chart-skeleton">
            <svg
              width="500"
              height="300"
              className="border border-gray-200 rounded-lg bg-white"
            >
              {/* Bar chart skeleton - animated rectangles */}
              <rect width="500" height="300" fill="#f9fafb" />
              {Array.from({ length: 5 }, (_, i) => (
                <rect
                  key={i}
                  x={50 + i * 80}
                  y={50 + Math.random() * 150}
                  width="40"
                  height={100 + Math.random() * 100}
                  fill="#e5e7eb"
                  className="skeleton"
                  opacity="0.6"
                />
              ))}
            </svg>
          </div>
        );

      case "scatter":
        return (
          <div className="chart-skeleton">
            <svg
              width="400"
              height="300"
              className="border border-gray-200 rounded-lg bg-white"
            >
              {/* Scatter plot skeleton - animated circles */}
              <rect width="400" height="300" fill="#f9fafb" />
              {Array.from({ length: 8 }, (_, i) => (
                <circle
                  key={i}
                  cx={50 + Math.random() * 300}
                  cy={50 + Math.random() * 200}
                  r="4"
                  fill="#e5e7eb"
                  className="skeleton"
                  opacity="0.6"
                />
              ))}
            </svg>
          </div>
        );

      case "table":
        return (
          <div className="chart-skeleton">
            <div className="min-w-full divide-y divide-gray-200">
              {/* Table skeleton - animated rows */}
              {Array.from({ length: 5 }, (_, i) => (
                <div key={i} className="flex space-x-4 py-3">
                  <div className="flex-1 h-4 bg-gray-200 rounded skeleton"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded skeleton"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded skeleton"></div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="chart-skeleton">
            <div className="w-64 h-48 bg-gray-200 rounded-lg skeleton"></div>
          </div>
        );
    }
  };

  return (
    <div className="chart-loading-container">
      {/* Chart skeleton */}
      <div className="flex items-center justify-center flex-shrink-0">
        {renderChartSkeleton()}
      </div>

      {/* Data summary skeleton */}
      <div className="data-summary-skeleton">
        <div className="h-4 bg-gray-200 rounded mb-3 skeleton"></div>
        <div className="space-y-2">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="flex items-center justify-between py-1">
              <div className="flex items-center min-w-0 flex-1">
                <div className="w-3 h-3 bg-gray-200 rounded mr-2 skeleton"></div>
                <div className="h-3 bg-gray-200 rounded flex-1 skeleton"></div>
              </div>
              <div className="h-3 bg-gray-200 rounded w-8 skeleton"></div>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200">
          <div className="flex justify-between">
            <div className="h-3 bg-gray-200 rounded w-12 skeleton"></div>
            <div className="h-3 bg-gray-200 rounded w-6 skeleton"></div>
          </div>
        </div>
      </div>
    </div>
  );
};
