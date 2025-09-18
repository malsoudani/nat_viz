import * as TE from "fp-ts/TaskEither";
import { TaskEither } from "fp-ts/TaskEither";
import OpenAI from "openai";
import { HttpError } from "./httpClient";
import { ISaaSVisualizationClient } from "./interfaces";
import {
  PieChartData,
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
      valuation: values[6] || "N/A",
      employees: values[7]?.replace(/"/g, "") || "0",
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
    this.openai = new OpenAI({
      apiKey: import.meta.env.VITE_OPENAI_API_KEY,
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
You are a data visualization expert. Given this dataset of SaaS companies and the user's request, create an appropriate visualization.

Dataset structure (Top 100 SaaS Companies 2025):
Each company has these fields:
- name: Company name
- foundedYear: Year founded
- hq: Headquarters location
- industry: Industry category
- totalFunding: Total funding raised (format: $XM, $XB, etc.)
- arr: Annual Recurring Revenue (format: $XM, $XB, etc.)
- valuation: Company valuation (format: $XM, $XB, etc.)
- employees: Number of employees (may contain commas)
- topInvestors: Key investors (comma-separated)
- product: Main product/service
- g2Rating: G2 rating (0-5 scale)

Sample data:
${JSON.stringify(request.data.slice(0, 3), null, 2)}

User request: "${request.prompt}"

IMPORTANT: When working with financial data (funding, ARR, valuation):
- Parse currency values: $1.5M = 1,500,000; $2B = 2,000,000,000
- Handle "N/A" values as 0 or exclude from calculations
- For employee counts, remove commas: "7,388" = 7388

Return a JSON object with:
- type: "pie" | "scatter" | "table" | "bar" | "line"
- title: descriptive title for the visualization
- data: the processed data for the visualization
- config: visualization configuration (colors, labels, etc.)

For different visualization types:
- pie: { labels: string[], values: number[], colors?: string[] }
- scatter: { points: Array<{x: number, y: number, label: string, metadata?: Record<string, unknown>}> }
- table: { headers: string[], rows: Array<Array<string|number>> }
- bar: { labels: string[], datasets: Array<{label: string, data: number[], backgroundColor?: string[]}> }
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
      return parsed;
    } catch {
      // Fallback to basic processing if AI fails
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
      return {
        id: update.id,
        type: parsed.type || "table",
        title: parsed.title || "Updated Visualization",
        data: parsed.data || [],
        config: parsed.config || {},
        createdAt: new Date().toISOString(),
      };
    } catch {
      throw new Error("Failed to parse update response");
    }
  }

  private fallbackVisualization(
    request: VisualizationRequest
  ): VisualizationResponse {
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

  private getStoredVisualizations(): VisualizationResponse[] {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}
