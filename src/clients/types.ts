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
  title: string;
  createdAt: string;
  methodology?: string; // How the AI analyzed the request
  visualizationConcept?: string; // Creative visualization approach description
  dataFunction?: string; // AI-generated JavaScript function to process data
  svgFunction?: string; // AI-generated JavaScript function to create SVG
  hoverCallback?: string; // AI-generated JavaScript function for hover interactions
  error?: string; // Error message if request is incompatible
  // Legacy fields for backward compatibility
  type?: string;
  data?: unknown; // Generic data for legacy compatibility
  config?: VisualizationConfig;
  rationale?: string; // Legacy field - replaced by visualizationConcept
}

// Hover callback types for canvas tooltips
export interface HoverCallbackData {
  data: unknown; // The data point being hovered
  position: { x: number; y: number }; // Mouse position
  canvas: HTMLCanvasElement; // Canvas element for drawing
  context: CanvasRenderingContext2D; // Canvas 2D context
  showTooltip: boolean; // Whether to show the tooltip
}

export type HoverCallback = (data: HoverCallbackData) => void;

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
