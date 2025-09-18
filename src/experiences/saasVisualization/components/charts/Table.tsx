import React from "react";
import { Table as TableIcon } from "lucide-react";
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
      <div className="table-container h-full flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto">
            <TableIcon className="w-8 h-8 text-gray-400" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-gray-700">No data available</p>
            <p className="text-base text-gray-500">Unable to display table</p>
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
