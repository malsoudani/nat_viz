import * as TE from "fp-ts/TaskEither";
import { TaskEither } from "fp-ts/TaskEither";
import OpenAI from "openai";
import { HttpError } from "./httpClient";
import { ISaaSVisualizationClient } from "./interfaces";
import { VISUALIZATION_PROMPT } from "./prompts";
import {
  SaaSCompany,
  VisualizationConfig,
  VisualizationData,
  VisualizationRequest,
  VisualizationResponse,
  VisualizationUpdate,
} from "./types";

const STORAGE_KEY = "saas_visualizations";
const DATA_STORAGE_KEY = "saas_companies_data";

// Type for structured OpenAI response
interface StructuredCallbackResponse {
  methodology: string;
  rationale: string;
  function: string;
  error?: string;
}

// Type for the result returned by the generated function
interface VisualizationFunctionResult {
  type: "pie" | "scatter" | "table" | "bar" | "line";
  title: string;
  data: Record<string, unknown>;
  config?: Record<string, unknown>;
}

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
      console.warn(
        "OpenAI API key not set or using placeholder. Visualizations will fall back to basic processing."
      );
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
          model: "gpt-4o-mini",
          messages: [
            { role: "user", content: "Hello, can you respond with 'OK'?" },
          ],
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
    // Include the user's specific request in the prompt
    const fullPrompt = `${VISUALIZATION_PROMPT}

USER REQUEST: "${request.prompt}"

Please analyze the user's request above and generate the appropriate JavaScript function for the requested visualization type.`;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: fullPrompt }],
        temperature: 0.1,
        max_tokens: 2000, // Increased for the structured response
      });

      const response = completion.choices[0]?.message?.content;
      if (!response) {
        console.error("OpenAI API returned no response");
        throw new Error("No response from OpenAI");
      }

      console.log("OpenAI Response:", response); // Debug log

      try {
        // Parse the structured text response
        const structuredResponse = this.parseStructuredResponse(response);
        console.log("Structured response:", structuredResponse); // Debug log

        // Check if there's an error in the response
        if (structuredResponse.error) {
          // Return a response with error information
          return {
            id: this.generateId(),
            type: "table",
            title: "Visualization Request Error",
            data: {
              headers: ["Error"],
              rows: [[structuredResponse.error]],
            },
            config: {},
            methodology: structuredResponse.methodology,
            rationale: structuredResponse.rationale,
            error: structuredResponse.error,
            createdAt: new Date().toISOString(),
          };
        }

        // Extract the function code from the function field
        const functionCode = structuredResponse.function;
        if (!functionCode || typeof functionCode !== "string") {
          throw new Error(
            "Invalid response: missing or invalid function field"
          );
        }

        console.log("Function code received:", functionCode); // Debug log

        // Parse the function string and create an executable function
        // Handle both function declarations and expressions
        let processingFunction: (
          companies: SaaSCompany[]
        ) => Record<string, unknown>;

        try {
          // Try to create function from the raw code
          processingFunction = new Function(
            "companies",
            `return (${functionCode})(companies);`
          )();
        } catch (funcError) {
          console.warn(
            "Direct function creation failed, trying alternative approach:",
            funcError
          );

          // Alternative: wrap in an immediately invoked function expression
          const wrappedCode = `
            (function() {
              const userFunction = ${functionCode};
              return function(companies) {
                return userFunction(companies);
              };
            })()
          `;

          processingFunction = eval(wrappedCode);
        }

        // Execute the function with the data
        const result = processingFunction(
          request.data
        ) as unknown as VisualizationFunctionResult;
        console.log("Function execution result:", result); // Debug log

        // Validate the result structure
        if (!result || typeof result !== "object") {
          throw new Error("Function did not return a valid object");
        }

        if (!result.type || !result.title || !result.data) {
          throw new Error(
            "Function result missing required fields: type, title, or data"
          );
        }

        // Convert to our visualization response format
        const visualizationResult =
          result as unknown as VisualizationFunctionResult;
        return {
          id: this.generateId(),
          type: visualizationResult.type,
          title: visualizationResult.title,
          data: visualizationResult.data as unknown as VisualizationData,
          config:
            (visualizationResult.config as unknown as VisualizationConfig) ||
            {},
          methodology: structuredResponse.methodology,
          rationale: structuredResponse.rationale,
          createdAt: new Date().toISOString(),
        };
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

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  private parseStructuredResponse(
    response: string
  ): StructuredCallbackResponse {
    const lines = response.split("\n");
    let methodology = "";
    let rationale = "";
    let functionCode = "";
    let error = "";

    let currentSection = "";

    for (const line of lines) {
      if (line.startsWith("METHODOLOGY:")) {
        currentSection = "methodology";
        methodology = line.substring("METHODOLOGY:".length).trim();
      } else if (line.startsWith("VISUALIZATION RATIONALE:")) {
        currentSection = "rationale";
        rationale = line.substring("VISUALIZATION RATIONALE:".length).trim();
      } else if (line.startsWith("FUNCTION:")) {
        currentSection = "function";
        functionCode = line.substring("FUNCTION:".length).trim();
      } else if (line.startsWith("ERROR:")) {
        currentSection = "error";
        error = line.substring("ERROR:".length).trim();
      } else if (currentSection && line.trim()) {
        // Continue accumulating content for the current section
        if (currentSection === "methodology") {
          methodology += " " + line.trim();
        } else if (currentSection === "rationale") {
          rationale += " " + line.trim();
        } else if (currentSection === "function") {
          if (functionCode) functionCode += "\n" + line;
          else functionCode = line;
        } else if (currentSection === "error") {
          error += " " + line.trim();
        }
      }
    }

    return {
      methodology: methodology.trim(),
      rationale: rationale.trim(),
      function: functionCode.trim(),
      error: error.trim() || undefined,
    };
  }

  private async processVisualizationUpdate(
    update: VisualizationUpdate
  ): Promise<VisualizationResponse> {
    // For now, create a basic response from the update
    // This could be enhanced to handle incremental updates
    return {
      id: update.id,
      type: "table", // Default type
      title: "Updated Visualization",
      data: {
        headers: ["Status"],
        rows: [["Update processed"]],
      },
      config: update.currentConfig,
      createdAt: new Date().toISOString(),
    };
  }

  private getStoredVisualizations(): VisualizationResponse[] {
    try {
      const stored = localStorage.getItem("saas_visualizations");
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Failed to load stored visualizations:", error);
      return [];
    }
  }

  private fallbackVisualization(
    request: VisualizationRequest
  ): VisualizationResponse {
    // Provide a basic fallback visualization when AI processing fails
    const data = request.data || [];

    return {
      id: this.generateId(),
      type: "table",
      title: "SaaS Companies Overview",
      data: {
        headers: ["Company", "Industry", "Funding", "Employees"],
        rows: data
          .slice(0, 10)
          .map((company: SaaSCompany) => [
            company.name || "Unknown",
            company.industry || "Unknown",
            company.totalFunding || "N/A",
            company.employees || "N/A",
          ]),
      },
      config: {
        sortable: true,
        searchable: true,
      },
      createdAt: new Date().toISOString(),
    };
  }
}
