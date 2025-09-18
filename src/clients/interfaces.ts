import { TaskEither } from "fp-ts/TaskEither";
import { HttpError } from "./httpClient";
import {
  SaaSCompany,
  VisualizationRequest,
  VisualizationResponse,
  VisualizationUpdate,
} from "./types";

// Add new client interfaces and data types here as needed

export interface ISaaSVisualizationClient {
  // Data operations
  getSaaSData(): TaskEither<HttpError, SaaSCompany[]>;
  saveSaaSData(data: SaaSCompany[]): TaskEither<HttpError, void>;

  // Visualization operations
  createVisualization(
    request: VisualizationRequest
  ): TaskEither<HttpError, VisualizationResponse>;
  updateVisualization(
    update: VisualizationUpdate
  ): TaskEither<HttpError, VisualizationResponse>;
  deleteVisualization(id: string): TaskEither<HttpError, void>;
  getVisualizations(): TaskEither<HttpError, VisualizationResponse[]>;
}
