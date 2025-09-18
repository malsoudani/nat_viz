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

// Mock SaaS data for demonstration
const mockSaaSData: SaaSCompany[] = [
  {
    id: "1",
    name: "Stripe",
    industry: "Fintech",
    foundedYear: 2010,
    valuation: 95,
    arr: 12000,
    employees: 8000,
    location: "San Francisco, CA",
    investors: ["Sequoia Capital", "Andreessen Horowitz", "General Catalyst"],
    description: "Payment processing platform for internet businesses",
  },
  {
    id: "2",
    name: "Databricks",
    industry: "Data Analytics",
    foundedYear: 2013,
    valuation: 43,
    arr: 1400,
    employees: 5000,
    location: "San Francisco, CA",
    investors: ["Andreessen Horowitz", "Battery Ventures"],
    description: "Unified analytics platform powered by Apache Spark",
  },
  {
    id: "3",
    name: "Canva",
    industry: "Design",
    foundedYear: 2012,
    valuation: 40,
    arr: 1500,
    employees: 3500,
    location: "Sydney, Australia",
    investors: ["Sequoia Capital", "Blackbird Ventures"],
    description: "Online design platform for non-designers",
  },
  {
    id: "4",
    name: "Notion",
    industry: "Productivity",
    foundedYear: 2016,
    valuation: 10,
    arr: 300,
    employees: 200,
    location: "San Francisco, CA",
    investors: ["Index Ventures", "GV"],
    description: "All-in-one workspace for notes, docs, and projects",
  },
  {
    id: "5",
    name: "Figma",
    industry: "Design",
    foundedYear: 2012,
    valuation: 10,
    arr: 400,
    employees: 800,
    location: "San Francisco, CA",
    investors: ["Index Ventures", "Greylock Partners"],
    description: "Collaborative interface design tool",
  },
];

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
        // Return mock data if nothing in storage
        return mockSaaSData;
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

Dataset structure:
${JSON.stringify(request.data.slice(0, 5), null, 2)}... (showing first 5 of ${
      request.data.length
    } companies)

User request: "${request.prompt}"

Return a JSON object with:
- type: "pie" | "scatter" | "table" | "bar" | "line"
- title: descriptive title for the visualization
- data: the processed data for the visualization
- config: visualization configuration (colors, labels, etc.)

For different visualization types:
- pie: { labels: string[], values: number[], colors?: string[] }
- scatter: { points: Array<{x: number, y: number, label: string}> }
- table: { headers: string[], rows: Array<Array<string|number>> }
- bar: { labels: string[], datasets: Array<{label: string, data: number[]}> }
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
      industryCount[company.industry] =
        (industryCount[company.industry] || 0) + 1;
    });

    const data: PieChartData = {
      labels: Object.keys(industryCount),
      values: Object.values(industryCount),
    };

    return {
      id: this.generateId(),
      type: "pie",
      title: "Industry Breakdown",
      data,
      config: { colors: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"] },
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
