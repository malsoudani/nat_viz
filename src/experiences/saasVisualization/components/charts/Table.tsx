import React from "react";
import { TableData, VisualizationConfig } from "../../../../clients/types";

interface TableProps {
  data: TableData;
  config: VisualizationConfig;
}

export const Table: React.FC<TableProps> = ({ data }) => {
  // Handle undefined or malformed data
  if (
    !data ||
    !data.headers ||
    !data.rows ||
    !Array.isArray(data.headers) ||
    !Array.isArray(data.rows)
  ) {
    return (
      <div className="table-container">
        <div className="flex flex-row items-start justify-center gap-6 h-full min-h-0">
          <div className="flex items-center justify-center flex-shrink-0">
            <div className="text-center text-gray-500">
              <p className="text-sm font-medium">No data available</p>
              <p className="text-xs mt-1">Unable to display table</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { headers, rows } = data;

  return (
    <div className="table-container overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, index) => (
              <th
                key={index}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {rows.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              {row.map((cell, cellIndex) => (
                <td
                  key={cellIndex}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {rows.length === 0 && (
        <div className="text-center py-8 text-gray-500">No data to display</div>
      )}
    </div>
  );
};
