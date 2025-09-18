import React from "react";

interface ChartSkeletonProps {
  type: "pie" | "bar" | "scatter" | "table";
}

export const ChartSkeleton: React.FC<ChartSkeletonProps> = ({ type }) => {
  const renderChartSkeleton = () => {
    switch (type) {
      case "pie":
        return (
          <div className="chart-skeleton flex items-center justify-center">
            <div className="relative">
              <svg width="280" height="280" viewBox="0 0 200 200" className="drop-shadow-sm">
                {/* Pie chart skeleton - animated circles */}
                <circle
                  cx="100"
                  cy="100"
                  r="85"
                  fill="none"
                  stroke="#f3f4f6"
                  strokeWidth="25"
                  className="animate-pulse"
                  opacity="0.4"
                />
                <circle
                  cx="100"
                  cy="100"
                  r="35"
                  fill="#ffffff"
                  stroke="#e5e7eb"
                  strokeWidth="2"
                  className="drop-shadow-sm"
                />
              </svg>
              {/* Animated segments */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
        );

      case "bar":
        return (
          <div className="chart-skeleton flex items-center justify-center">
            <svg
              width="600"
              height="350"
              className="bg-white rounded-xl border border-gray-200 drop-shadow-sm"
            >
              {/* Bar chart skeleton - animated rectangles */}
              <rect width="600" height="350" fill="#fafafa" rx="12" />
              {Array.from({ length: 6 }, (_, i) => (
                <rect
                  key={i}
                  x={60 + i * 85}
                  y={60 + Math.random() * 180}
                  width="50"
                  height={120 + Math.random() * 120}
                  fill="#e5e7eb"
                  rx="4"
                  className="animate-pulse"
                  opacity="0.7"
                />
              ))}
              {/* Grid lines */}
              <line x1="40" y1="300" x2="560" y2="300" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="240" x2="560" y2="240" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="180" x2="560" y2="180" stroke="#f3f4f6" strokeWidth="1" />
            </svg>
          </div>
        );

      case "scatter":
        return (
          <div className="chart-skeleton flex items-center justify-center">
            <svg
              width="500"
              height="350"
              className="bg-white rounded-xl border border-gray-200 drop-shadow-sm"
            >
              {/* Scatter plot skeleton - animated circles */}
              <rect width="500" height="350" fill="#fafafa" rx="12" />
              {Array.from({ length: 12 }, (_, i) => (
                <circle
                  key={i}
                  cx={60 + Math.random() * 380}
                  cy={60 + Math.random() * 230}
                  r="6"
                  fill="#e5e7eb"
                  className="animate-pulse"
                  opacity="0.7"
                />
              ))}
              {/* Grid lines */}
              <line x1="40" y1="300" x2="460" y2="300" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="240" x2="460" y2="240" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="180" x2="460" y2="180" stroke="#f3f4f6" strokeWidth="1" />
              <line x1="40" y1="120" x2="460" y2="120" stroke="#f3f4f6" strokeWidth="1" />
            </svg>
          </div>
        );

      case "table":
        return (
          <div className="chart-skeleton">
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden drop-shadow-sm">
              {/* Table header skeleton */}
              <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                <div className="flex space-x-6">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div key={i} className="h-4 bg-gray-300 rounded animate-pulse flex-1"></div>
                  ))}
                </div>
              </div>
              {/* Table rows skeleton */}
              {Array.from({ length: 6 }, (_, i) => (
                <div key={i} className="px-6 py-4 border-b border-gray-100 last:border-b-0">
                  <div className="flex space-x-6">
                    {Array.from({ length: 4 }, (_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded animate-pulse flex-1"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="chart-skeleton flex items-center justify-center">
            <div className="w-80 h-56 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl animate-pulse drop-shadow-sm"></div>
          </div>
        );
    }
  };

  return (
    <div className="chart-loading-container h-full flex flex-col items-center justify-center space-y-8 p-8">
      {/* Chart skeleton */}
      <div className="flex-shrink-0">
        {renderChartSkeleton()}
      </div>

      {/* Loading indicator */}
      <div className="text-center space-y-3">
        <div className="flex justify-center space-x-2">
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce"></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
          <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
        </div>
        <p className="text-base text-gray-600 font-medium">Preparing visualization...</p>
      </div>
    </div>
  );
};
