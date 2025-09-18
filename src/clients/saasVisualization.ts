import * as TE from "fp-ts/TaskEither";
import { TaskEither } from "fp-ts/TaskEither";
import OpenAI from "openai";
import { HttpError } from "./httpClient";
import { ISaaSVisualizationClient } from "./interfaces";
import {
  PieChartData,
  ScatterPlotData,
  BarChartData,
  TableData,
  VisualizationData,
  VisualizationConfig,
  SaaSCompany,
  VisualizationRequest,
  VisualizationResponse,
  VisualizationUpdate,
} from "./types";

const STORAGE_KEY = "saas_visualizations";
const DATA_STORAGE_KEY = "saas_companies_data";

// Import the CSV data
import csvData from "../../top_100_saas_companies_2025.csv?raw";

// Parse CSV data into SaaSCompany format
const parseCSVData = (): SaaSCompany[] => {
  const lines = csvData.trim().split("\n");

  return lines.slice(1).map((line, index) => {
    // Handle quoted fields that may contain commas
    const parseCSVLine = (csvLine: string): string[] => {
      const result: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let i = 0; i < csvLine.length; i++) {
        const char = csvLine[i];

        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "," && !inQuotes) {
          result.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }

      result.push(current.trim());
      return result;
    };

    const values = parseCSVLine(line);

    return {
      id: (index + 1).toString(),
      name: values[0] || "",
      foundedYear: parseInt(values[1]) || 0,
      hq: values[2]?.replace(/"/g, "") || "",
      industry: values[3] || "",
      totalFunding: values[4] || "N/A",
      arr: values[5] || "N/A",
      valuation: values[6] || "N/A", // Keep as string, parse during visualization
      employees: values[7]?.replace(/"/g, "") || "0", // Keep as string, parse during visualization
      topInvestors: values[8] || "",
      product: values[9] || "",
      g2Rating: parseFloat(values[10]) || 0,
      description: values[9] || "", // Use product as description
    };
  });
};

// Load real SaaS data from CSV
const realSaaSData: SaaSCompany[] = parseCSVData();

export class SaaSVisualizationClient implements ISaaSVisualizationClient {
  private openai: OpenAI;

  constructor() {
    const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
    if (!apiKey || apiKey === "your_openai_api_key_here") {
      console.warn("OpenAI API key not set or using placeholder. Visualizations will fall back to basic processing.");
    }

    this.openai = new OpenAI({
      apiKey: apiKey,
      dangerouslyAllowBrowser: true, // For client-side usage
    });
  }

  getSaaSData(): TaskEither<HttpError, SaaSCompany[]> {
    return TE.tryCatch(
      async () => {
        // Try to get from localStorage first
        const stored = localStorage.getItem(DATA_STORAGE_KEY);
        if (stored) {
          return JSON.parse(stored);
        }
        // Return real data if nothing in storage
        return realSaaSData;
      },
      (error) => ({
        status: 500,
        message: `Failed to load SaaS data: ${String(error)}`,
      })
    );
  }

  saveSaaSData(data: SaaSCompany[]): TaskEither<HttpError, void> {
    return TE.tryCatch(
      async () => {
        localStorage.setItem(DATA_STORAGE_KEY, JSON.stringify(data));
      },
      (error) => ({
        status: 500,
        message: `Failed to save SaaS data: ${String(error)}`,
      })
    );
  }

  createVisualization(
    request: VisualizationRequest
  ): TaskEither<HttpError, VisualizationResponse> {
    return TE.tryCatch(
      async () => {
        const result = await this.processVisualizationRequest(request);
        return {
          ...result,
          id: this.generateId(),
          createdAt: new Date().toISOString(),
        };
      },
      (error) => ({
        status: 500,
        message: `Failed to create visualization: ${String(error)}`,
      })
    );
  }

  updateVisualization(
    update: VisualizationUpdate
  ): TaskEither<HttpError, VisualizationResponse> {
    return TE.tryCatch(
      async () => {
        const result = await this.processVisualizationUpdate(update);
        return {
          ...result,
          id: update.id,
          createdAt: new Date().toISOString(),
        };
      },
      (error) => ({
        status: 500,
        message: `Failed to update visualization: ${String(error)}`,
      })
    );
  }

  deleteVisualization(id: string): TaskEither<HttpError, void> {
    return TE.tryCatch(
      async () => {
        const visualizations = this.getStoredVisualizations();
        const filtered = visualizations.filter((v) => v.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
      },
      (error) => ({
        status: 500,
        message: `Failed to delete visualization: ${String(error)}`,
      })
    );
  }

  testOpenAIConnection(): TaskEither<HttpError, boolean> {
    return TE.tryCatch(
      async () => {
        const completion = await this.openai.chat.completions.create({
          model: "gpt-4",
          messages: [{ role: "user", content: "Hello, can you respond with 'OK'?" }],
          max_tokens: 10,
        });

        const response = completion.choices[0]?.message?.content;
        return response !== null && response !== undefined;
      },
      (error) => ({
        status: 500,
        message: `OpenAI connection test failed: ${String(error)}`,
      })
    );
  }

  getVisualizations(): TaskEither<HttpError, VisualizationResponse[]> {
    return TE.tryCatch(
      async () => {
        return this.getStoredVisualizations();
      },
      (error) => ({
        status: 500,
        message: `Failed to load visualizations: ${String(error)}`,
      })
    );
  }

  private async processVisualizationRequest(
    request: VisualizationRequest
  ): Promise<VisualizationResponse> {
    const prompt = `
You are a data visualization expert. Given the COMPLETE dataset of SaaS companies and the user's request, create an appropriate visualization.

IMPORTANT: You have access to the ENTIRE dataset (${request.data.length} companies). Use ALL available data for your analysis and visualization.

DATASET STRUCTURE:
Each company has these exact fields:
- id: string (unique identifier)
- name: string (company name)
- foundedYear: number (year founded)
- hq: string (headquarters location)
- industry: string (industry category)
- totalFunding: string (funding with $ and M/B/T suffixes)
- arr: string (annual recurring revenue with $ and M/B/T suffixes)
- valuation: string (company valuation with $ and M/B/T suffixes)
- employees: string (employee count, may contain commas)
- topInvestors: string (investors, comma-separated)
- product: string (main product/service)
- g2Rating: number (G2 rating 0-5 scale)
- description?: string (optional product description)

FULL DATASET (${request.data.length} companies):
${JSON.stringify(request.data, null, 2)}

CRITICAL REQUIREMENTS:
1. Process ALL ${request.data.length} companies - do not limit to samples
2. Parse financial values correctly: $1.5M = 1,500,000; $2B = 2,000,000,000; $3T = 3,000,000,000,000
3. Handle "N/A" values appropriately (exclude from calculations or set to 0)
4. For employee counts, remove commas: "7,388" = 7388

USER REQUEST: "${request.prompt}"

RESPONSE FORMAT REQUIREMENTS:
Return a JSON object with EXACTLY these fields (no extra fields):

For PIE CHART:
{
  "type": "pie",
  "title": "Descriptive title for the pie chart",
  "data": {
    "labels": ["string array of category names"],
    "values": [number array of values],
    "colors": ["optional string array of hex colors"]
  },
  "config": {
    "colors": ["same colors as data.colors"],
    "showLegend": true,
    "title": "Chart title"
  }
}

For SCATTER PLOT:
{
  "type": "scatter",
  "title": "Descriptive title for the scatter plot",
  "data": {
    "points": [
      {
        "x": number,
        "y": number,
        "label": "point label",
        "metadata": {
          "companyName": "string",
          "industry": "string",
          "additionalInfo": "any relevant data"
        }
      }
    ]
  },
  "config": {
    "xAxisLabel": "X axis description",
    "yAxisLabel": "Y axis description",
    "showGrid": true
  }
}

For BAR CHART:
{
  "type": "bar",
  "title": "Descriptive title for the bar chart",
  "data": {
    "labels": ["string array of bar labels"],
    "datasets": [
      {
        "label": "dataset name",
        "data": [number array of values],
        "backgroundColor": ["optional string array of hex colors"]
      }
    ]
  },
  "config": {
    "showLegend": true,
    "xAxisLabel": "X axis description",
    "yAxisLabel": "Y axis description"
  }
}

For TABLE:
{
  "type": "table",
  "title": "Descriptive title for the table",
  "data": {
    "headers": ["string array of column headers"],
    "rows": [
      ["mixed array of strings and numbers for each row"]
    ]
  },
  "config": {
    "sortable": true,
    "searchable": true
  }
}

VALIDATION RULES:
- type must be exactly: "pie", "scatter", "table", "bar", or "line"
- data structure must match the exact format above
- All numeric values must be proper JavaScript numbers (not strings)
- Colors should be valid hex codes like "#FF6384"
- Include as many data points as possible (don't artificially limit)
- Ensure the response is valid JSON that can be parsed by JSON.parse()

Create the most appropriate visualization for the user's request using the complete dataset.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        console.error("OpenAI API returned no response");
        throw new Error("No response from OpenAI");
      }

      console.log("OpenAI Response:", response); // Debug log

      try {
        const parsed = JSON.parse(response);
        console.log("Parsed response:", parsed); // Debug log

        // Validate and normalize the response to ensure type compliance
        const validatedResponse = this.validateAndNormalizeResponse(parsed);
        return validatedResponse;
      } catch (parseError) {
        console.error("Failed to parse OpenAI response:", parseError);
        console.error("Raw response:", response);
        // Fallback to basic processing if AI fails
        return this.fallbackVisualization(request);
      }
    } catch (apiError) {
      console.error("OpenAI API call failed:", apiError);
      // Fallback to basic processing if API fails
      return this.fallbackVisualization(request);
    }
  }

  private async processVisualizationUpdate(
    update: VisualizationUpdate
  ): Promise<VisualizationResponse> {
    const prompt = `
Update this visualization based on the user's request.

Current visualization config: ${JSON.stringify(update.currentConfig, null, 2)}

User request: "${update.prompt}"

Return updated config as JSON with the same structure.
`;

    const completion = await this.openai.chat.completions.create({
      model: "gpt-4",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.content;
    if (!response) {
      throw new Error("No response from OpenAI");
    }

    try {
      const parsed = JSON.parse(response);
      const validatedResponse = this.validateAndNormalizeResponse(parsed);
      return {
        ...validatedResponse,
        id: update.id, // Keep the original ID for updates
      };
    } catch {
      throw new Error("Failed to parse update response");
    }
  }

  private fallbackVisualization(
    request: VisualizationRequest
  ): VisualizationResponse {
    const prompt = request.prompt.toLowerCase();

    // Try to determine the requested chart type from the prompt
    if (prompt.includes("scatter") || prompt.includes("correlation") || prompt.includes("relationship")) {
      return this.createFallbackScatterPlot(request);
    } else if (prompt.includes("bar") || prompt.includes("histogram")) {
      return this.createFallbackBarChart(request);
    } else if (prompt.includes("table") || prompt.includes("list")) {
      return this.createFallbackTable(request);
    } else {
      // Default to pie chart for industry breakdown
      return this.createFallbackPieChart(request);
    }
  }

  private createFallbackPieChart(request: VisualizationRequest): VisualizationResponse {
    // Simple fallback for industry breakdown pie chart
    const industryCount: Record<string, number> = {};
    request.data.forEach((company) => {
      const industry = company.industry || "Unknown";
      industryCount[industry] = (industryCount[industry] || 0) + 1;
    });

    const sortedIndustries = Object.entries(industryCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10); // Top 10 industries

    const data: PieChartData = {
      labels: sortedIndustries.map(([industry]) => industry),
      values: sortedIndustries.map(([, count]) => count),
      colors: [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
        "#FF6384",
        "#C9CBCF",
        "#4BC0C0",
        "#FF6384",
      ],
    };

    return {
      id: this.generateId(),
      type: "pie",
      title: "Top 10 SaaS Industries by Company Count",
      data,
      config: {
        colors: data.colors,
        showLegend: true,
        title: "Industry Distribution",
      },
      createdAt: new Date().toISOString(),
    };
  }

  private createFallbackScatterPlot(request: VisualizationRequest): VisualizationResponse {
    // Create a scatter plot of founded year vs valuation
    const points = request.data.slice(0, 20).map((company) => {
      // Simple parsing of valuation for fallback
      let valuation = 0;
      const valStr = company.valuation;
      if (valStr && valStr !== "N/A") {
        const cleanStr = valStr.replace(/[$,]/g, "");
        if (cleanStr.endsWith("T")) {
          valuation = parseFloat(cleanStr.slice(0, -1)) * 1000000000000;
        } else if (cleanStr.endsWith("B")) {
          valuation = parseFloat(cleanStr.slice(0, -1)) * 1000000000;
        } else if (cleanStr.endsWith("M")) {
          valuation = parseFloat(cleanStr.slice(0, -1)) * 1000000;
        } else {
          valuation = parseFloat(cleanStr) || 0;
        }
      }

      return {
        x: company.foundedYear,
        y: valuation,
        label: company.name,
        metadata: {
          industry: company.industry,
          hq: company.hq,
        },
      };
    }).filter((point) => point.x > 0 && point.y > 0); // Filter out invalid points

    const data: ScatterPlotData = {
      points,
    };

    return {
      id: this.generateId(),
      type: "scatter",
      title: "Company Founded Year vs Valuation",
      data,
      config: {
        xAxisLabel: "Founded Year",
        yAxisLabel: "Valuation ($)",
        showGrid: true,
      },
      createdAt: new Date().toISOString(),
    };
  }

  private createFallbackBarChart(request: VisualizationRequest): VisualizationResponse {
    // Create a bar chart of top companies by valuation
    const companies = request.data
      .map((company) => {
        let valuation = 0;
        const valStr = company.valuation;
        if (valStr && valStr !== "N/A") {
          const cleanStr = valStr.replace(/[$,]/g, "");
          if (cleanStr.endsWith("T")) {
            valuation = parseFloat(cleanStr.slice(0, -1)) * 1000000000000;
          } else if (cleanStr.endsWith("B")) {
            valuation = parseFloat(cleanStr.slice(0, -1)) * 1000000000;
          } else if (cleanStr.endsWith("M")) {
            valuation = parseFloat(cleanStr.slice(0, -1)) * 1000000;
          } else {
            valuation = parseFloat(cleanStr) || 0;
          }
        }
        return { ...company, parsedValuation: valuation };
      })
      .filter((company) => company.parsedValuation > 0)
      .sort((a, b) => b.parsedValuation - a.parsedValuation)
      .slice(0, 10);

    const data: BarChartData = {
      labels: companies.map((company) => company.name),
      datasets: [
        {
          label: "Valuation",
          data: companies.map((company) => company.parsedValuation),
          backgroundColor: ["#3B82F6", "#EF4444", "#10B981", "#F59E0B", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316", "#EC4899", "#6B7280"],
        },
      ],
    };

    return {
      id: this.generateId(),
      type: "bar",
      title: "Top 10 SaaS Companies by Valuation",
      data,
      config: {
        showLegend: false,
        xAxisLabel: "Company",
        yAxisLabel: "Valuation ($)",
      },
      createdAt: new Date().toISOString(),
    };
  }

  private createFallbackTable(request: VisualizationRequest): VisualizationResponse {
    // Create a table with company information
    const headers = ["Company", "Industry", "Founded", "Valuation", "Employees"];
    const rows = request.data.slice(0, 20).map((company) => [
      company.name,
      company.industry,
      company.foundedYear.toString(),
      company.valuation,
      company.employees,
    ]);

    const data: TableData = {
      headers,
      rows,
    };

    return {
      id: this.generateId(),
      type: "table",
      title: "SaaS Companies Overview",
      data,
      config: {
        sortable: true,
        searchable: true,
      },
      createdAt: new Date().toISOString(),
    };
  }

  private getStoredVisualizations(): VisualizationResponse[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private validateAndNormalizeResponse(parsed: unknown): VisualizationResponse {
    // Ensure the response has the required structure
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid response structure');
    }

    const response = parsed as Record<string, unknown>;

    // Validate and normalize the type
    const validTypes = ['pie', 'scatter', 'table', 'bar', 'line'];
    const type = typeof response.type === 'string' && validTypes.includes(response.type)
      ? response.type
      : 'table';

    if (response.type && !validTypes.includes(response.type as string)) {
      console.warn(`Invalid type "${response.type}", defaulting to "table"`);
    }

    // Ensure required fields exist
    const title = typeof response.title === 'string' ? response.title : 'Data Visualization';

    const data = (response.data && typeof response.data === 'object') ? response.data as Record<string, unknown> : this.getDefaultDataForType(type);

    const config = (response.config && typeof response.config === 'object') ? response.config as Record<string, unknown> : {};

    // Type-specific validation and normalization
    switch (type) {
      case 'pie':
        this.validatePieChartData(data);
        break;
      case 'scatter':
        this.validateScatterPlotData(data);
        break;
      case 'bar':
        this.validateBarChartData(data);
        break;
      case 'table':
        this.validateTableData(data);
        break;
    }

    return {
      id: this.generateId(),
      type: type as "pie" | "scatter" | "table" | "bar" | "line",
      title,
      data: data as unknown as VisualizationData,
      config: config as unknown as VisualizationConfig,
      createdAt: new Date().toISOString(),
    };
  }

  private getDefaultDataForType(type: string): Record<string, unknown> {
    switch (type) {
      case 'pie':
        return { labels: [], values: [], colors: [] };
      case 'scatter':
        return { points: [] };
      case 'bar':
        return { labels: [], datasets: [] };
      case 'table':
        return { headers: [], rows: [] };
      default:
        return { headers: [], rows: [] };
    }
  }

  private validatePieChartData(data: Record<string, unknown>): void {
    if (!Array.isArray(data.labels)) data.labels = [];
    if (!Array.isArray(data.values)) data.values = [];
    if (!Array.isArray(data.colors)) data.colors = [];

    // Ensure values are numbers
    data.values = (data.values as unknown[]).map((v: unknown) => typeof v === 'number' ? v : parseFloat(String(v)) || 0);

    // Ensure labels are strings
    data.labels = (data.labels as unknown[]).map((l: unknown) => String(l || ''));
  }

  private validateScatterPlotData(data: Record<string, unknown>): void {
    if (!Array.isArray(data.points)) data.points = [];

    // Validate each point
    data.points = (data.points as unknown[]).map((point: unknown) => {
      const p = point as Record<string, unknown>;
      return {
        x: typeof p.x === 'number' ? p.x : parseFloat(String(p.x)) || 0,
        y: typeof p.y === 'number' ? p.y : parseFloat(String(p.y)) || 0,
        label: String(p.label || ''),
        metadata: (p.metadata && typeof p.metadata === 'object') ? p.metadata : {},
      };
    });
  }

  private validateBarChartData(data: Record<string, unknown>): void {
    if (!Array.isArray(data.labels)) data.labels = [];
    if (!Array.isArray(data.datasets)) data.datasets = [];

    // Validate datasets
    data.datasets = (data.datasets as unknown[]).map((dataset: unknown) => {
      const ds = dataset as Record<string, unknown>;
      return {
        label: String(ds.label || ''),
        data: Array.isArray(ds.data)
          ? (ds.data as unknown[]).map((v: unknown) => typeof v === 'number' ? v : parseFloat(String(v)) || 0)
          : [],
        backgroundColor: Array.isArray(ds.backgroundColor) ? ds.backgroundColor : undefined,
      };
    });

    // Ensure labels are strings
    data.labels = (data.labels as unknown[]).map((l: unknown) => String(l || ''));
  }

  private validateTableData(data: Record<string, unknown>): void {
    if (!Array.isArray(data.headers)) data.headers = [];
    if (!Array.isArray(data.rows)) data.rows = [];

    // Ensure headers are strings
    data.headers = (data.headers as unknown[]).map((h: unknown) => String(h || ''));

    // Ensure rows are arrays
    data.rows = (data.rows as unknown[]).map((row: unknown) =>
      Array.isArray(row) ? row.map((cell: unknown) => cell) : []
    );
  }  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
