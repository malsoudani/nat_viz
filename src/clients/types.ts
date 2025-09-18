// SaaS Data Visualization Types
export interface SaaSCompany {
  id: string;
  name: string;
  industry: string;
  foundedYear: number;
  valuation: number; // in billions USD
  arr: number; // Annual Recurring Revenue in millions USD
  employees: number;
  location: string;
  investors: string[];
  description: string;
}

export interface PieChartData {
  labels: string[];
  values: number[];
  colors?: string[];
}

export interface ScatterPlotData {
  points: Array<{
    x: number;
    y: number;
    label: string;
    metadata?: Record<string, unknown>;
  }>;
}

export interface TableData {
  headers: string[];
  rows: Array<Array<string | number>>;
}

export interface BarChartData {
  labels: string[];
  datasets: Array<{
    label: string;
    data: number[];
    backgroundColor?: string[];
  }>;
}

export type VisualizationData =
  | PieChartData
  | ScatterPlotData
  | TableData
  | BarChartData;

export interface VisualizationConfig {
  colors?: string[];
  title?: string;
  xAxis?: string;
  yAxis?: string;
  showLegend?: boolean;
  showGrid?: boolean;
  fontSize?: number;
  [key: string]: unknown;
}

export interface VisualizationRequest {
  prompt: string;
  data: SaaSCompany[];
}

export interface VisualizationResponse {
  id: string;
  type: "pie" | "scatter" | "table" | "bar" | "line";
  title: string;
  data: VisualizationData;
  config: VisualizationConfig;
  createdAt: string;
}

export interface VisualizationUpdate {
  id: string;
  prompt: string;
  currentConfig: VisualizationConfig;
}

export interface DataQuery {
  type: "filter" | "sort" | "aggregate" | "visualize";
  field?: string;
  operation?: string;
  value?: string | number | boolean;
  groupBy?: string;
}

// Add new data types here as needed
