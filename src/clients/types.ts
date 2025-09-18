// SaaS Data Visualization Types
export interface SaaSCompany {
  id: string;
  name: string; // Company Name
  foundedYear: number; // Founded Year
  hq: string; // HQ location
  industry: string; // Industry
  totalFunding: string; // Total Funding (with $ and M/B suffixes)
  arr: string; // ARR (with $ and M/B suffixes)
  valuation: string; // Valuation (with $ and M/B suffixes)
  employees: string; // Employees (with commas)
  topInvestors: string; // Top Investors (comma-separated)
  product: string; // Product
  g2Rating: number; // G2 Rating
  description?: string; // Optional description derived from product
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
  methodology?: string; // How the AI analyzed the request
  rationale?: string; // Why this visualization type was chosen
  error?: string; // Error message if request is incompatible
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
