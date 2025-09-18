import React from "react";
import { BarChart } from "./experiences/saasVisualization/components/charts/BarChart";
import { PieChart } from "./experiences/saasVisualization/components/charts/PieChart";
import { ScatterPlot } from "./experiences/saasVisualization/components/charts/ScatterPlot";
import { Table } from "./experiences/saasVisualization/components/charts/Table";

// Test data for each chart type
const testPieData = {
  labels: ["Category A", "Category B", "Category C"],
  values: [30, 50, 20],
  colors: ["#3B82F6", "#EF4444", "#10B981"],
};

const testScatterData = {
  points: [
    { x: 10, y: 20, label: "Point 1" },
    { x: 15, y: 25, label: "Point 2" },
    { x: 20, y: 30, label: "Point 3" },
    { x: 25, y: 35, label: "Point 4" },
  ],
};

const testBarData = {
  labels: ["Jan", "Feb", "Mar", "Apr"],
  datasets: [
    {
      label: "Sales",
      data: [100, 150, 200, 250],
    },
  ],
};

const testTableData = {
  headers: ["Name", "Value", "Status"],
  rows: [
    ["Item 1", "100", "Active"],
    ["Item 2", "200", "Inactive"],
    ["Item 3", "300", "Active"],
  ],
};

const testConfig = {
  title: "Test Chart",
  type: "pie" as const,
};

export const ChartTest: React.FC = () => {
  return (
    <div className="p-8 space-y-8">
      <h1 className="text-2xl font-bold">Chart Components Test</h1>
            <p className="text-gray-600">Hover over chart elements to see native SVG tooltips. Data summaries are shown horizontally alongside each chart.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-lg font-semibold mb-4">Pie Chart</h2>
          <p className="text-sm text-gray-500 mb-2">
            Hover over pie slices for details
          </p>
          <PieChart data={testPieData} config={testConfig} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Scatter Plot</h2>
          <p className="text-sm text-gray-500 mb-2">
            Hover over data points for coordinates
          </p>
          <ScatterPlot data={testScatterData} config={testConfig} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Bar Chart</h2>
          <p className="text-sm text-gray-500 mb-2">
            Hover over bars for values
          </p>
          <BarChart data={testBarData} config={testConfig} />
        </div>

        <div>
          <h2 className="text-lg font-semibold mb-4">Table</h2>
          <p className="text-sm text-gray-500 mb-2">
            Data table (no tooltips needed)
          </p>
          <Table data={testTableData} config={testConfig} />
        </div>
      </div>
    </div>
  );
};
